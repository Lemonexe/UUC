<?php //version of resources, to prevent caching of old .js and .html files when a new version is built
	$v = 8;
?>
<!DOCTYPE html>
<html ng-app="UUC" ng-controller="ctrl">
	<head>
		<meta charset="UTF-8">
		<meta name="description" content="A useful tool for unit conversion.">
		<title>Ultimate Unit Converter</title>
		<script src="libs/angular.min.js"></script>
		<!--these scripts just declare-->
		<script src="app/convert.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<script src="app/convert_parse.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<script src="app/convert_macro.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<script src="app/lang.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<script src="app/data.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<!--these script start doing something-->
		<script src="app/misc.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<script src="app/controller.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<!--utilities-->
		<script src="app/tests.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<link rel="stylesheet" href="app/style.css?v=<?php echo $v;?>">
	</head>
	<body ng-mousemove="mouseMove($event)" ng-mouseup="mouseUp()" ng-mouseleave="mouseLeave($event)">
<div id="lang"><img ng-src="{{imgSrcCZ}}" ng-click="changeLang('cz')"><img ng-src="{{imgSrcEN}}" ng-click="changeLang('en')"></div>

<h1>Ultimate Unit Converter II</h1>

<!-- TOP MENU -->
<div id="tabButtonContainer">
	<span ng-click="changeTab('converter')" ng-style="tabButtonStyle('converter')" class="tabButton"><cz>Převodník</cz><en>Converter</en></span>
	<span ng-click="changeTab('help')" ng-style="tabButtonStyle('help')" class="tabButton"><cz>Reference</cz><en>Reference</en></span>
	<span ng-click="changeTab('intro')" ng-style="tabButtonStyle('intro')" class="tabButton"><cz>Úvod</cz><en>Intro</en></span>
	<span ng-click="changeTab('macro')" ng-style="tabButtonStyle('macro')" class="tabButton" ng-show="CS.showMacroTab"><cz>Makro</cz><en>Macro</en></span>
</div>

<div ng-switch="CS.tab">
<!-- INTRO TAB -->
	<div ng-switch-when="intro">
		<cz>
			<p>Ultimate Unit Converter II vás vítá!<br>Pokud jste zde poprvé, <b>klikněte <a ng-click="TF.initTutorial()" class="fakeLink">zde</a> pro spuštění interaktivního tutoriálu</b>, kde se dozvíte o hlavních možnostech použití UUC.</p>
			<p><b>Co je na UUC tak zvláštního?</b></p>
			<p>Na internetu lze najít mnoho převodníků různých jednotek, avšak žádný, který by byl schopen převádět jednotky ve <i>zcela libovolných</i> rozměrech – tedy jako součin a podíl jednotek v různých mocninách.
			S UUC už nebudete muset řešit, kterým číslem násobit či dělit, neboť program pochopí jakýkoliv fyzikální výraz a převede jej na libovolnou jednotku s odpovídajícím rozměrem.</p>
			<p>Kromě prostého převodu jednotek nabízí UUC nové též makra, kde je možné provádět i jednoduché výpočty. To má tu výhodu oproti jiným nástrojům, že nezadáváte pouhá čísla, ale přímo fyzikální veličiny, které UUC správně zpracuje, sám převede jednotky a zkontroluje smysluplnost.<br>
			Tato funkce zůstává skryta, zde ji můžete povolit: <input type="checkbox" ng-model="CS.showMacroTab"></p>
			<p>
				<b>Poznámky:</b>
				<ol>
					<li>UUC je možné přidat do prohlížeče jako vyhledávač a mít jej tak rychle po ruce! <a class="fakeLink" ng-click="changeTab('searchEngine')">Návod (pro Chrome či Edge)</a></li>
					<li>Pokud vám zde chybí vaše oblíbená jednotka či konstanta a rádi byste ji zde viděli, <a href="mailto:zbytek@gmail.com">kontaktujte mě</a></li>
					<li>Pokud máte nápad na vylepšení této aplikace, neváhejte <a href="mailto:zbytek@gmail.com">mě kontaktovat</a></li>
					<li>Pokud sami programujete a máte zájem o zdrojový kód, navštivte <a href="https://github.com/Lemonexe/UUC">Github repozitář</a></li>
				</ol>
			</p>
		</cz>
		<en>
			<p>Ultimate Unit Converter II welcomes you!<br>If you're here for the first time, <b>click <a ng-click="TF.initTutorial()" class="fakeLink">here</a> to open an interactive tutorial</b> that will show you the most important features and use cases of UUC.</p>
			<p><b>What is so special about UUC?</b></p>
			<p> While you can find lots of different converters for various units, there isn't one that could convert units <i>in absolutely any</i> dimension – a product of several units in various powers.
			With UUC you'll never again have to ponder, which number you're supposed to mulitply or divide with, because this program will understand any physical quantity expression and convert it to a unit of choice with corresponding dimension.</p>
			<p>In addition to simple conversion, UUC now also offers macros, where you can code simple calculations. The advantage over other programs is the possibility to actually enter physical quantities instead of just plain numbers, so UUC can automatically process them, convert units and check for consistency.<br>
			This feature is initially hidden, here you can enable it: <input type="checkbox" ng-model="CS.showMacroTab"></p>
			<p>
				<b>Notes:</b>
				<ol>
					<li>Now you can add UUC to your browser as a search engine so as to access it quickly and conveniently! <a class="fakeLink" ng-click="changeTab('searchEngine')">Instructions (for Chrome or Edge)</a></li>
					<li>If you are missing your favorite unit or constant and would like to see it here, you can <a href="mailto:zbytek@gmail.com">contact me</a></li>
					<li>If you have an idea how to enhance the application, you can <a href="mailto:zbytek@gmail.com">contact me</a></li>
					<li>If you are a programmer interested in the source code, see the <a href="https://github.com/Lemonexe/UUC">Github repository</a></li>
				</ol>
			</p>
		</en>
	</div>

<!-- REFERENCE TAB -->
	<div ng-switch-when="help">
		<cz>
			V databázi je {{databaseCount}} položek, z toho {{Units.length}} je právě zobrazeno.<br>
			Jednotky měn byly načteny z externí stránky v {{currencyTimestamp}}.<br><br>
			Zde můžete napsat jednotku (či její název), aby byl seznam omezen na jednotky se stejným rozměrem (1 pro bezrozměrné, _ pro seznam konstant):<br>
		</cz>
		<en>
			There are {{databaseCount}} items in database with {{Units.length}} currently listed.<br>
			Currency units have been loaded from external website at {{currencyTimestamp}}.<br><br>
			You can write a unit (or its name) here to filter the ones with same dimension (1 for dimensionless, _ for list of constants):<br>
		</en>
		<input type="text" class="inputBox" ng-model="CS.filter" ng-change="listenForHelp()">

		<p ng-repeat="u in Units">
			<span class="reference" ng-class="{highlight: $index === 0 && highlightFirst}"><b>{{u.name[CS.lang]}}</b>{{buildUnitEntry(u)}}</span>
		</p>
	</div>

<!-- MAIN TAB -->
	<div ng-switch-when="converter">
		<div ng-if="!CS.hideTutorialLink" style="margin-bottom: 10px;">
			<cz>Jste zde poprvé? Pak doporučuji navštívit záložku Úvod!</cz>
			<en>First-time visitor? Then I'll recommend to take a look at the Intro tab!</en>
		</div>
	<!-- left container -->
		<div id="convertContainer">
			<a ng-click="flip()" style="position: absolute; right: 2px; top: 47px; font-size: 18px; cursor: pointer;">⇅</a>
			<b><cz>Vstup:</cz><en>Input:</en></b><br>
			<input type="text" class="inputBox" ng-model="CS.input" ng-keyup="listenForConvert($event)" ng-change="autoforget()" tabindex="1" autofocus><!--comment to suppress whitespace, lol!
			--><select ng-if="CS.history.length > 0" ng-model="ctrl.autocomplete" id="inputAutocomplete" ng-change="autocomplete(0)">
				<option ng-repeat="opt in CS.history track by $index" ng-value="$index">{{opt.input + (opt.target ? ' > ' + opt.target : '')}}</option>
			</select><br>

			<b><cz>Cílové jednotky:</cz><en>Target units:</en></b><br>
			<input type="text" class="inputBox" ng-model="CS.target" ng-keyup="listenForConvert($event)" ng-change="autoforget()" tabindex="2">
			<br>
			<input type="button" ng-value="'Převést'.trans()" ng-click="fullConversion()" tabindex="3">
			<br><br>
			<b><cz>Výstup:</cz><en>Output:</en></b>
			<span ng-show="ctrl.copyoutput" ng-class="ctrl.copyclass" class="copyEffStatic"><cz>úspěšně zkopírováno</cz><en>copied successfully</en></span><br>
			<span class="outputBox">{{composeResult()}}</span>
			<span ng-show="result && result.output && result.status < 2" ng-click="copyOutput()" style="cursor: copy;" title="Ctrl+C">📋</span><br>
		</div>
	<!-- right container -->
		<div id="paramContainer">
			<a ng-click="TF.showExamplesOnly()" style="cursor: pointer;"><span class="expandable">?</span><cz>Příklady</cz><en>Examples</en></a><br>

			<a ng-click="CS.showParams = !CS.showParams" style="cursor: pointer;"><span class="expandable">{{CS.showParams ? '–' : '+'}}</span><cz>Formát výstupu</cz><en>Output format</en></a>
			<div ng-show="CS.showParams">
				<label><input type="radio" ng-model="CS.params.spec" value="auto" ng-change="updateFormat()"> <cz>automatický</cz><en>automatic</en></label><br>
				<label><input type="radio" ng-model="CS.params.spec" value="digits" ng-change="updateFormat()"> <cz>počet platných cifer</cz><en>significant digits</en>: </label>
				<input type="number" class="numSelector" ng-model="CS.params.digits" min="1" max="20" ng-change="updateFormat()"><br>
				<label><input type="radio" ng-model="CS.params.spec" value="fixed" ng-change="updateFormat()"> <cz>počet desetinných míst</cz><en>number of decimals</en>: </label>
				<input type="number" class="numSelector" ng-model="CS.params.fixed" min="0" max="20" ng-change="updateFormat()"><br>
				<br>
				<label><input type="checkbox" ng-model="CS.params.exp" ng-change="updateFormat()"> <cz>vždy vědecký zápis</cz><en>always scientific notation</en></label>
			</div>
			<br>
			<a ng-click="ctrl.sharelink = !ctrl.sharelink" style="cursor: pointer;"><span class="expandable">≫</span><cz>Sdílet odkaz</cz><en>Share link</en></a>
			<span ng-show="ctrl.copylink" ng-class="ctrl.copyclass" class="copyEffStatic"><cz>úspěšně zkopírováno</cz><en>copied successfully</en></span><br>
			<div id="sharelinkBox" ng-show="ctrl.sharelink">
				<cz>Kliknutím zkopírujete do schránky odkaz na tuto konverzi</cz>
				<en>Click to copy the link with this conversion to clipboard</en><br>
				<span ng-click="copySharelink()" style="cursor: copy;" title="Ctrl+C">📋 <span class="fakeLink" >{{getSharelink()}}</span></span>
			</div>
		</div>
	<!-- below containers -->
		<div style="display: block; clear: both;"></div>
		<div ng-if="result" ng-class="statusAppear">
			<br><b><cz>Stav:</cz><en>Status:</en></b><br>
			<span ng-repeat="m in result.messages track by $index" ng-class="statusClass">{{m}}<br></span>
		</div>
	</div>

<!-- MACRO TAB (hidden from top menu until activated) -->
	<div ng-switch-when="macro">
		<p>
			<cz>Zde můžete sestavit vlastní UUC "skript". Je to experimentální funkce, která je vlastně asi docela k ničemu.<br>Tlačítko Dokumentace vám vysvětlí podrobnosti.</cz>
			<en>Here you can assemble your own UUC "script". It's an experimental feature, that imho proved to be quite useless.<br>The Documentation button will tell you more.</en>
		</p>
		<b><cz>Kód:</cz><en>Code:</en></b><br>
		<textarea ng-model="CS.inputCode" ng-keyup="listenForRun($event)" ng-style="textareaStyle()" resize-observer autofocus spellcheck="false"></textarea><br>
		<input type="button" ng-value="'Spustit (F2)'.trans()" ng-click="runCode()">
		<a target="_blank" ng-href="{{documentation}}"><input type="button" ng-value="'Dokumentace'.trans()"></a><br>
		<b><cz>Výstup:</cz><en>Output:</en></b><br>
		<div ng-if="resultCode"><span ng-repeat="m in resultCode track by $index">{{m}}<br></span></div>
	</div>

<!-- SEARCHENGINE TAB (hidden from topmenu) -->
	<div ng-switch-when="searchEngine">
		<h2>Chrome <cz>nebo</cz><en>or</en> Edge</h2>
		<p><cz>Není třeba nic instalovat, jen provést jednoduché nastavení:</cz>
		<en>No need to install anything, it can be done in the settings:</en></p>
		<ol>
			<li><cz>Otevřete jednu z těchto adres dle prohlížece:</cz><en>Open one of these addresses depending in browser:</en><br>
				<span class="code">chrome://settings/searchEngines</span><br>
				<span class="code">edge://settings/searchEngines</span></li>
			<li><cz>Klepněte na tlačítko Přidat</cz><en>Click the Add button</en></li>
			<li><cz>Do prvních dvou polí vyplňte</cz><en>Insert</en> <span class="code">uuc</span><cz>, do třetího vyplňte</cz><en> into the first two fields, into the third insert</en>
				<span class="code">{{currentWebAddress + '/#%s'}}</span></li>
			<li><cz>Dialog potvrďte tlačítkem Přidat</cz><en>Click the Add button to confirm the dialog</en></li>
		</ol>

		<cz>
			<p>
				Hotovo – právě jste definovali klíčové slovo <i>uuc</i> :-)<br>
				Nyní stačí otevřít nový panel, napsat uuc, mezeru, pokračovat psaním zadání a stisknutím Enter.<br>
				Cílové jednotky se zde specifikují znakem &gt; nebo slovy <i>to</i> či <i>into</i><br>
				např. 3.7 kPa &nbsp;&gt;&nbsp; Torr
			</p>
		</cz><en>
			<p>
				Done – you have defined <i>uuc</i> as a keyword :-)<br>
				Now you can simply open a new tab, write uuc, space, and continue by writing the input and pressing Enter.<br>
				Target units are specified by character &gt; or by words <i>to</i> or <i>into</i><br>
				e.g. 3.7 kPa &nbsp;&gt;&nbsp; Torr
			</p>
		</en>

		<cz>
			<h2>Ostatní prohlížeče</h2>
			<p>Bohužel, tyto prohlížeče neumožňují uživatelům definovat vlastní vyhledávač, avšak možná toho lze dosáhnout pomocí určitých doplňků.</p>
			<p>Pokud takové doplňky využíváte, budete muset sami zjistit, jak definovat klíčové slovo uuc. Promiňte!</p>
		</cz><en>
			<h2>Other browsers</h2>
			<p>Unfortunately, these browsers don't allow users to define a custom search engine, although you can probably achieve it using certain addons.</p>
			<p>If you do use such an addon, you will have to figure out by yourself how to define the uuc keyword. Sorry about that!</p>
		</en>

	</div>
</div>

<!-- OTHER ELEMENTS (such as floating tutorial window)-->
<div id="tutorial" ng-if="CS.tutorial" ng-style="tutorialStyle()" ng-include="'res/tutorial.html?v=<?php echo $v;?>'"></div>

<div id="debug"></div>
<div id="footerDefense"></div>
<div id="footer">
	<cz>Vytvořil <a href="http://jira.zby.cz/">Jiří Zbytovský</a> v letech 2017-2022 pod <a href="https://github.com/Lemonexe/UUC/blob/master/LICENSE">licencí MIT</a></cz>
	<en>Made by <a href="http://jira.zby.cz/">Jiří Zbytovský</a> in years 2017-2022 under <a href="https://github.com/Lemonexe/UUC/blob/master/LICENSE">MIT License</a></en>
</div>

	</body>
</html>
