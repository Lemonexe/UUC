/*
	convert_macro.js
	contains the convert macro function, which interprets "macro code" as string
	this function is a method in Convert(), it is merely exported here for the sake of readability and is not meant to be invoked from any other context

	Macro can be switched between simple mode, which is a very simple "programming language" interpreted by the following algorithms,
	and javascript mode, which is delimited by <js></js> and is simply evaled. It's less intuitive, but has practically unlimited features
*/
function Convert_macro(code) {
	const that = this;
	this.clearStatus();
	try {
	//AUXILIARY FUNCTIONS
		//cleanup callback
		function cleanupCb(line) {
			line = line.trim();
			const c = line.search('//'); //find line comment
			if(c > -1) {line = line.slice(0, c);} //cut the line comment
			return line;
		}
		//callback to sort strings from longest to shortest
		const sortCb = (a, b) => b.length - a.length;
		//validate variable name (allowed are A-z, _ $ and 0-9 (but can't start with 0-9))
		const checkVarName = text => text.search(/^[A-z_$][A-z_0-9$]*$/) > -1;
		//expand (substitute) all variables on a given 'expression' string, it's like delayed expansion in .bat scripts
		function expand(expression) {
			if(!expression) {return;}
			//varNames have to be sorted from longest to shortest in order to avoid colisions
			Object.keys(variables).sort(sortCb).forEach(function(v) {
				const reg = new RegExp(v.replace('$', '\\$'), 'g'); //global regex to match variable name in expression. $ would otherwise cause problems
				if(expression.search(reg) === -1) {return;}
				const expandedVar = `(${variables[v].n}*${that.vector2text(variables[v].v, true)})`.replace(/\*\)$/, ')');
				expression = expression.replace(reg, expandedVar);
			});
			return expression;
		}


	//PREPARE LINES OF CODE
		//first extract block comments - delete them
		code = code.replace(/\/\*[^/*]*\*\//g, '')

		//then extract javascript mode sections - split into sections. Keep the opening <js> tag as identifier
		code = code.split(/(<js>[^]*?)<\/js>/);

		//split into lines and cleanup
		let arr = [];
		for(let line of code) {
			//if javascript mode - put entire javascript block as a "line"
			if(line.search('<js>') === 0) {arr.push(line);}
			//else simple mode - split into lines
			else {arr = arr.concat(line.split(/\r\n|\r|\n/));}
		}

		code = arr.map(cleanupCb).filter(line => line.length > 0);


	//MACRO STATE
		//available functions in simple mode
		const functions = [
			//write all arguments as new messages
			{id: 'write', argsMin: 1, f: function() {
				for(let i = 0; i < arguments.length; i++) {
					that.messages.push(arguments[i]);
				}
			}},
			//display 'input' string converted to 'target' with params and append the result to the last message
			{id: 'convert', argsMin: 1, argsMax: 3, f: function(input, target, params) {
				const m = that.messages;
				input = expand(input); target = expand(target);
				let res = that.convert(input, target);
				if(params) {
					params = JSON.parse(params);
					res = that.format(res, params);
				}
				//append to last message rather than create a new one
				if(m.length === 0) {m[0] = '';}
				m[m.length-1] += (res.num2 || res.num) + ' ' + res.dim;
			}}
		];

		//current simple mode variables as Q instances as 'varName': Q instance
		const variables = {};


	//PROCESS EVERY LINE OF CODE
		for(let i = 0; i < code.length; i++) {
			let line = code[i];

			//eval javascript, yeah, just like that. Let people XSS themselves to oblivion!
			if(line.search('<js>') === 0) {eval(line.replace('<js>', '')); continue;}

			//or parse the simple code
			const eqs = line.split('=').map(o => o.trim()); //split line into sections around equal signs

			//if this line is a variable declaration
			if(eqs.length - 1 >= 2) {throw that.msgDB['ERRC_equalSigns'](line);}
			if(eqs.length - 1 === 1) {
				const varName = eqs[0]; //left side of assignment
				if(!checkVarName(varName)) {throw that.msgDB['ERRC_varName'](line, varName);}
				const expression = expand(eqs[1]); //right side of assignment

				//calculate expression and assign it
				let obj = Convert_parse(that, expression);
				obj = this.rationalizeField(obj);
				obj = this.reduceField(obj);
				variables[varName] = obj;
			}
			//line is contains a function call, try to identify it it
			else {
				let found = false;
				const fids = functions.map(f => f.id).sort(sortCb); //function ids
				for(let v of fids) {
					const reg = new RegExp('^' + v.replace('$', '\\$') + '\\(([^)]*)\\)'); //regex to match a function call and capture arguments
					const m = line.match(reg);
					if(!m) {continue;}
					found = true;
					const f = functions.find(o => o.id === v); //get the corresponding function
					const args = m[1].split(';').filter(o => o.length > 0); //split arguments
					//a really messy code for a messy error
					const errCond = (f.hasOwnProperty('argsMin') && args.length < f.argsMin) || (f.hasOwnProperty('argsMax') && args.length > f.argsMax);
					if(errCond) {throw that.msgDB['ERRC_argCount'](line, f.id, f.argsMin || 0, f.argsMax || 'n', args.length);}
					//finally call the function
					f.f.apply(null, args);
					break;
				}
				if(!found) {throw that.msgDB['ERRC_unreadableLine'](line);}
			}
		}
	}
	catch(err) {this.status = 2; this.messages.push(err);}
	this.status < 2 && this.messages.push('Macro successfully finished');
	const msgs = this.messages; this.clearStatus();
	return msgs;
}
