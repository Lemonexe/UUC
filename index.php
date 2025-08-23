<?php //version of resources, to prevent caching of old .js and .html files when a new version is built
	$v = 12;
?>
<!DOCTYPE html>
<html ng-app="UUC" ng-controller="ctrl">
	<head>
		<meta charset="UTF-8">
		<meta name="description" content="A useful tool for unit conversion.">
		<meta name="robots" content="noimageindex">
		<title>Ultimate Unit Converter</title>
		<script src="libs/angular.min.js"></script>
		<!--these scripts just declare-->
		<script src="app/convert.js?v=<?php echo $v;?>" type="text/javascript"></script>
		<script src="app/convert_parse.js?v=<?php echo $v;?>" type="text/javascript"></script>
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

<div id="lang"><img src="res/CZ.png" ng-click="changeLang('cz')"><img src="res/EN.png" ng-click="changeLang('en')"></div>

<div id="centeredContainer">
	<div id="contentContainer">
		<h1>Ultimate Unit Converter II</h1>

		<!-- TOP MENU -->
		<div id="tabButtonContainer">
			<span ng-click="changeTab('converter')" ng-style="tabButtonStyle('converter')" class="tabButton"><cz>Převodník</cz><en>Converter</en></span>
			<span ng-click="changeTab('help')" ng-style="tabButtonStyle('help')" class="tabButton"><cz>Reference</cz><en>Reference</en></span>
			<span ng-click="changeTab('intro')" ng-style="tabButtonStyle('intro')" class="tabButton"><cz>Úvod</cz><en>Intro</en></span>
		</div>

		<div ng-switch="CS.tab">
		<!-- INTRO TAB -->
			<div ng-switch-when="intro">
				<cz>
					<p>Ultimate Unit Converter II vás vítá!<br>Pokud jste zde poprvé, <b>klikněte <a ng-click="TF.initTutorial()" class="fakeLink">zde</a> pro spuštění interaktivního tutoriálu</b>, kde se dozvíte o hlavních možnostech použití UUC.</p>
					<p><b>Co je na UUC tak zvláštního?</b></p>
					<p>Na internetu lze najít mnoho převodníků různých jednotek, avšak žádný, který by byl schopen převádět jednotky ve <i>zcela libovolných</i> rozměrech – tedy jako součin a podíl jednotek v různých mocninách.
					S UUC už nebudete muset řešit, kterým číslem násobit či dělit, neboť program pochopí jakýkoliv fyzikální výraz a převede jej na libovolnou jednotku s odpovídajícím rozměrem.</p>
					<p>
						<b>Poznámky:</b>
						<ol>
							<li>UUC je možné přidat do prohlížeče jako vyhledávač a mít jej tak rychle po ruce! <a class="fakeLink" ng-click="changeTab('searchEngine')">Návod</a></li>
							<li>Pokud vám zde chybí vaše oblíbená jednotka či konstanta a rádi byste ji zde viděli, <a href="mailto:zbytek@gmail.com">kontaktujte mě</a></li>
							<li>Pokud máte nápad na vylepšení této aplikace, neváhejte <a href="mailto:zbytek@gmail.com">mě kontaktovat</a></li>
							<li>Pokud sami programujete a máte zájem o zdrojový kód, navštivte <a href="https://github.com/Lemonexe/UUC" target="_blank">Github repozitář</a></li>
						</ol>
					</p>
				</cz>
				<en>
					<p>Ultimate Unit Converter II welcomes you!<br>If you're here for the first time, <b>click <a ng-click="TF.initTutorial()" class="fakeLink">here</a> to open an interactive tutorial</b> that will show you the most useful features of UUC.</p>
					<p><b>What is so special about UUC?</b></p>
					<p> While you can find lots of different converters for various units, there isn't one that could convert units <i>in any</i> dimension <i>whatsoever</i> – meaning a product of several units in various powers.
					With UUC you'll never again have to ponder, which number you're supposed to mulitply or divide with, because this program will understand any physical quantity expression and convert it to a unit of choice with corresponding dimension.</p>
					<p>
						<b>Notes:</b>
						<ol>
							<li>Now you can add UUC to your browser as a search engine so as to quickly access it! <a class="fakeLink" ng-click="changeTab('searchEngine')">Instructions</a></li>
							<li>If you are missing your favorite unit or constant and would like to see it here, you can <a href="mailto:zbytek@gmail.com">contact me</a></li>
							<li>If you have an idea how to enhance the application, you can <a href="mailto:zbytek@gmail.com">contact me</a></li>
							<li>If you are a programmer interested in the source code, see the <a href="https://github.com/Lemonexe/UUC" target="_blank">Github repository</a></li>
						</ol>
					</p>
				</en>
			</div>

		<!-- REFERENCE TAB -->
			<div ng-switch-when="help">
				<p>
					<cz>
						V databázi je {{databaseCount}} položek, z toho {{Units.length}} je právě zobrazeno.<br>
						Jednotky měn byly aktualizovány v {{currencyTimestamp}}.
					</cz>
					<en>
						There are {{databaseCount}} items in database with {{Units.length}} currently listed.<br>
						Currency units have been updated at {{currencyTimestamp}}.
					</en>
				</p>
				<b><cz>Vyhledat jednotky:</cz><en>Search units:</en></b><br>
				<input type="text" class="inputBox" ng-model="CS.filter" ng-change="listenForHelp()" style="margin-bottom: 4px"><br>
				<div class="subtle" style="margin-bottom: 24px">
					<cz>(filtruje jednotky se stejným rozměrem, 1 pro bezrozměrné, _ pro seznam vestavěných konstant)</cz>
					<en>(filters units with the same dimension, 1 for dimensionless, _ for list of built-in constants)</en>
				</div>

				<p ng-repeat="u in Units">
					<span class="reference" ng-class="{highlight: $index === 0 && highlightFirst}"><b>{{u.name[CS.lang]}}</b>{{buildUnitEntry(u)}}</span>
				</p>
			</div>

		<!-- MAIN TAB -->
			<div ng-switch-when="converter">
				<div ng-if="!CS.hideTutorialLink" style="margin-bottom: 10px">
					<cz>Jste zde poprvé? Pak doporučuji navštívit záložku Úvod!</cz>
					<en>First-time visitor? Then I'll recommend to take a look at the Intro tab!</en>
				</div>
				<div class="convertContainer">
				<!-- left container -->
					<div style="min-width: 400px">
						<b><cz>Vstup:</cz><en>Input:</en></b><br>
						<input type="text" class="inputBox" ng-model="CS.input" ng-keyup="listenForConvert($event)" ng-change="autoforget()" tabindex="1" autofocus><!--comment to suppress whitespace, lol!
						--><select ng-if="CS.history.length > 0" ng-model="ctrl.autocomplete" id="inputAutocomplete" ng-change="autocomplete(0)">
							<option ng-repeat="opt in CS.history track by $index" ng-value="$index">{{opt.input + (opt.target ? ' > ' + opt.target : '')}}</option>
						</select>
						<a ng-click="flip()" style="position: absolute; left: 365px; top: 50px; font-size: 18px; cursor: pointer">⇅</a>
						<br>

						<b><cz>Cílové jednotky:</cz><en>Target units:</en></b><br>
						<input type="text" class="inputBox" ng-model="CS.target" ng-keyup="listenForConvert($event)" ng-change="autoforget()" tabindex="2">
						<br>
						<input type="button" ng-value="'Převést'.trans()" ng-click="fullConversion()" class="bigButton" tabindex="3">
						<br><br>
						<b><cz>Výstup:</cz><en>Output:</en></b>
						<span ng-show="ctrl.copyoutput" ng-class="ctrl.copyclass" class="copyEffStatic"><cz>úspěšně zkopírováno</cz><en>copied successfully</en></span><br>
						<span class="inputBox outputBox">{{composeResult()}}</span>
						<span ng-show="availableCtrlC && result && result.output && result.status < 2" ng-click="copyOutput()" style="cursor: copy" title="Ctrl+C">📋</span><br>
					</div>
				<!-- right container -->
					<div style="padding: 8px">
						<a ng-click="TF.showExamplesOnly()" style="cursor: pointer"><span class="expandable">?</span><cz>Příklady</cz><en>Examples</en></a><br>

						<a ng-click="CS.showParams = !CS.showParams" style="cursor: pointer"><span class="expandable">{{CS.showParams ? '–' : '+'}}</span><cz>Formát výstupu</cz><en>Output format</en></a>
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
						<a ng-click="ctrl.sharelink = !ctrl.sharelink" style="cursor: pointer"><span class="expandable">≫</span><cz>Sdílet odkaz</cz><en>Share link</en></a>
						<span ng-show="ctrl.copylink" ng-class="ctrl.copyclass" class="copyEffStatic"><cz>úspěšně zkopírováno</cz><en>copied successfully</en></span><br>
						<div id="sharelinkBox" ng-show="ctrl.sharelink">
							<div ng-show="availableCtrlC">
								<cz>Kliknutím zkopírujete do schránky odkaz na tuto konverzi</cz>
								<en>Click to copy the link with this conversion to clipboard</en><br>
								<span ng-click="copySharelink()" style="cursor: copy" title="Ctrl+C">📋 <span class="fakeLink" style="cursor: copy">{{getSharelink()}}</span></span>
							</div>
							<div ng-show="!availableCtrlC">
								<cz>❗ Schránka není dostupná, protože spojení je nezabezpečené. Zkuste otevřít v</cz>
								<en>❗ Clipboard is not available due to unsecured connection. Try opening in</en>
								<a ng-href="{{currentWebAddress.replace('http', 'https')}}">https</a>
							</div>
						</div>
					</div>
				</div>
			<!-- below containers -->
				<div ng-if="result" ng-class="statusAppear">
					<br><b><cz>Stav:</cz><en>Status:</en></b><br>
					<span ng-repeat="m in result.messages track by $index" ng-class="statusClass">{{m}}<br></span>
				</div>
			</div>

		<!-- SEARCHENGINE TAB (hidden from topmenu) -->
			<div ng-switch-when="searchEngine">
				<p><b>Chrome <cz>nebo</cz><en>or</en> Edge</p></b>
				<p><cz>Není třeba nic instalovat, jen provést jednoduché nastavení:</cz>
				<en>No need to install anything, it can be done in the settings:</en></p>
				<ol>
					<li><cz>Otevřete jednu z těchto adres dle prohlížece:</cz><en>Open one of these addresses depending in browser:</en><br>
						<span class="code">chrome://settings/searchEngines</span><br>
						<span class="code">edge://settings/searchEngines</span></li>
					<li><cz>Klepněte na tlačítko Přidat</cz><en>Click the Add button</en></li>
					<li>
						<cz>Do pole URL vložte</cz><en>Insert</en>
						<span class="code">{{currentWebAddress + '/#%s'}}</span>
						<cz>, do zbývajících vložte</cz><en> into the URL field, into the other fields insert</en>
						<span class="code">uuc</span>
					</li>
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

				<p><b>Firefox</p></b>
				<p>
					<cz>Zde je to ještě jednodušší, není ani třeba navštívit nastavení.</cz>
					<en>It's even easier here, no need to even visit settings.</en>
				</p>
				<ol>
					<li>
						<cz>Uložte tuto stránku jako novou záložku.</cz>
						<en>Save this page as a bookmark.</en>
					</li>
					<li>
						<cz>Pak ji editujte a do pole URL vložte</cz>
						<en>Then edit it and fill in</en>
						<span class="code">{{currentWebAddress + '/#%s'}}</span>
						<en>to the URL field</en>.
					</li>
					<li>
						<cz>Do pole Klíčové slovo vložte</cz><en>Fill in</en>
						<span class="code">uuc</span>
						<en>to the UUC field</en>.
					</li>
				</ol>
				<p>
					<cz>A funguje to stejně jako ve Chrome</cz><en>And it works just like in Chrome</en> 🙂
				</p>
			</div>
		</div>

		<!-- OTHER ELEMENTS (such as floating tutorial window)-->
		<div id="tutorial" ng-if="CS.tutorial" ng-style="tutorialStyle()" ng-include="'res/tutorial.html?v=<?php echo $v;?>'"></div>
	</div>
</div>

<div id="footer">
	<cz>Vytvořil <a href="http://jira.zby.cz/">Jiří Zbytovský</a> v letech 2017-2025 pod <a href="https://github.com/Lemonexe/UUC/blob/master/LICENSE">licencí MIT</a></cz>
	<en>Made by <a href="http://jira.zby.cz/">Jiří Zbytovský</a> in years 2017-2025 under <a href="https://github.com/Lemonexe/UUC/blob/master/LICENSE">MIT License</a></en>
</div>

<a id="githubLogo" href="https://github.com/Lemonexe/UUC" target="_blank" title="github"><img src="res/GitHub-Mark-32px.png"></a>

	</body>
</html>
