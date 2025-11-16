import { type Dispatch, type FC, type SetStateAction, useRef, useState } from 'react';
import { prefixes, units } from 'uuc-core';
import { Cz, En } from '../lang';
import {
	type ExId,
	type Step,
	type StepId,
	type StepProps,
	type TutorialState,
	examples,
	steps,
} from './tutorialConfig';
import { useDraggable } from './useDraggable';
import type { FullConversion, Route } from '../types';

// EUR is referenced in the 'currencies' example. Meanwhile, USD is a basic unit so it's guaranteed.
const isEUR = () => units.some(({ id }) => id === 'EUR');

type TutorialProps = {
	state: TutorialState;
	setState: Dispatch<SetStateAction<TutorialState | null>>;
	navigate: Dispatch<Route>;
	setInput: Dispatch<string>;
	setTarget: Dispatch<string>;
	fullConversion: FullConversion;
};

const stepComponentMap: Record<StepId, FC<StepProps>> = {
	intro: Intro,
	reference: Reference,
	dimAnalysis: DimAnalysis,
	features: Features,
	examples: Examples,
	temperature: Temperature,
	conclusion: Conclusion,
};

export const Tutorial = ({ state, setState, navigate, setInput, setTarget, fullConversion }: TutorialProps) => {
	const [[top, left], setPos] = useState<[number, number]>([steps[state.id].top, steps[state.id].left]);
	const StepComponent = stepComponentMap[state.id];
	const ref = useRef<HTMLDivElement>(null);

	const handleDragStart = useDraggable({ ref, setPos });

	const keys = Object.keys(steps);
	const stepsTotal = keys.length;
	const stepIndex = keys.indexOf(state.id);
	const nextStepId = keys[stepIndex + 1] as StepId;
	const goToNextStep = () => {
		const step: Step = steps[nextStepId];
		setState((prev) => ({ ...prev, id: nextStepId }));
		setPos([step.top ?? 0, step.left ?? 0]);
		step.route && navigate(step.route!);
	};
	const closeTutorial = () => setState(null);

	const ex = (exId: ExId) => {
		const { input, target } = examples[exId];
		setInput(input);
		setTarget(target);
		fullConversion(input, target);
	};

	return (
		<div id="tutorial" style={{ top, left }} ref={ref}>
			<div id="tutorialBar" onMouseDown={handleDragStart}>
				{state.onlyExamples ? '' : `${stepIndex + 1}/${stepsTotal}`}
				<input type="button" className="XButton" value="✕" onClick={closeTutorial} />
			</div>
			<div className="tutorialSection">
				<StepComponent
					navigate={navigate}
					goToNextStep={goToNextStep}
					closeTutorial={closeTutorial}
					ex={ex}
					onlyExamples={state.onlyExamples}
				/>
			</div>
		</div>
	);
};

const prefixText = prefixes.map((o) => `${o.id} (${o.e})`).join(', '); // printed list of all available SI prefixes

const NextButton = ({ onClick }: { onClick: () => void }) => (
	<button onClick={onClick} className="bigButton">
		<Cz>Dále</Cz>
		<En>Next</En>
	</button>
);
const CloseButton = ({ onClick }: { onClick: () => void }) => (
	<button onClick={onClick} className="bigButton">
		<Cz>Zavřít</Cz>
		<En>Close</En>
	</button>
);

function Intro({ goToNextStep, ex }: StepProps) {
	return (
		<>
			<Cz>
				<p>
					Záložka <b>Převodník</b> je hlavní částí UUC.
					<br />
					Zde můžete napsat výraz do textového pole Vstup a stisknout tlačítko Převést nebo klávesu Enter:{' '}
					<a className="fakeLink" onClick={() => ex('SI')}>
						příklad
					</a>
				</p>
				<p>
					Převod takto proběhne do základních jednotek SI, můžete však vyplnit textové pole Cílové jednotky
					pro určení výstupních jednotek:{' '}
					<a className="fakeLink" onClick={() => ex('simple')}>
						příklad
					</a>
				</p>
				<p>Jak je vidět, při převodu můžete (avšak nemusíte) specifikovat číslo na vstupu.</p>
				<p>
					Mějte na paměti že jednotky jsou dle konvencí citlivé na VELIKOST písmen!
					<br />
					UUC se snaží porozumět i jinému zápisu:{' '}
					<a className="fakeLink" onClick={() => ex('wrongCase')}>
						příklad
					</a>
					, ale nemusí to fungovat vždy..
				</p>
			</Cz>
			<En>
				<p>
					The <b>Converter</b> tab is the main part of UUC.
					<br />
					Here you can enter an expression into the Input text field and press the Convert button or Enter
					key:{' '}
					<a className="fakeLink" onClick={() => ex('SI')}>
						example
					</a>
				</p>
				<p>
					Input will be converted into basic SI units by default, but you can fill out the Target units text
					field in order to specify the output units:{' '}
					<a className="fakeLink" onClick={() => ex('simple')}>
						example
					</a>
				</p>
				<p>As you can see, you may (but needn&apos;t) specify a number in the conversion input.</p>
				<p>
					Bear in mind, that units are by convention case-SENSITIVE!
					<br />
					UUC tries to understand a different case:{' '}
					<a className="fakeLink" onClick={() => ex('wrongCase')}>
						example
					</a>
					, but it may not always work..
				</p>
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function Reference({ goToNextStep }: StepProps) {
	return (
		<>
			<Cz>
				<p>
					V záložce <b>Reference</b> naleznete vyčerpávající seznam všech jednotek.
				</p>
				<p>
					Pro snažší vyhledávání lze seznam filtrovat pomocí rozměru 🔍
					<br />
					Do pole napište jednotku (např. kJ), výraz (N/m2) nebo název ({isEUR() ? 'dolar' : 'yard'}).
				</p>
				{isEUR() && (
					<p>
						Počkat, dolar? Ano, UUC obsahuje také většinu důležitých světových měn! 💰
						<br />
						Jejich směnné kurzy jsou aktualizovány každý den pomocí tohoto {/* prettier-ignore */}
						<a target="_blank" href="https://fixer.io/" rel="noreferrer">API</a>.
					</p>
				)}
				<p>
					Jednotky lze použít se standardními předponami SI (exponenty):
					<br />
					{prefixText}
				</p>
			</Cz>
			<En>
				<p>
					In the <b>Reference</b> tab you&apos;ll find a comprehensive list of all units.
				</p>
				<p>
					To make things easier, you can filter the list by specifying a dimension 🔍
					<br />
					Enter a unit (kJ), expression (N/m2) or name (e.g. {isEUR() ? 'dollar' : 'yard'}) in the field.
				</p>
				{isEUR() && (
					<p>
						Wait, dollar? Yes, UUC also contains the most important world currencies! 💰
						<br />
						Their exchange rates are updated daily using this public {/* prettier-ignore */}
						<a target="_blank" href="https://fixer.io/" rel="noreferrer">API</a>.
					</p>
				)}
				<p>
					Units can be used with standard SI prefixes (exponents):
					<br />
					{prefixText}
				</p>
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function DimAnalysis({ goToNextStep, ex }: StepProps) {
	return (
		<>
			<Cz>
				<p>
					UUC pro vás provede rozměrovou analýzu a pokud vstup nesouhlasí s cílovými jednotkami, dostanete
					varování. Výsledek výpočtu pak ignorujte.
				</p>
				<p>
					To je často způsobeno záměnou symbolu jednotky,
					<br />
					např. coulomb &amp; farad vs. stupeň Celsia &amp; Fahrenheita:{' '}
					<a className="fakeLink" onClick={() => ex('wrongSymbol')}>
						špatně
					</a>
					,&nbsp;
					<a className="fakeLink" onClick={() => ex('okSymbol')}>
						správně
					</a>
				</p>
				<p>
					Také to může být způsobeno syntaktickou chybou, např. mK znamená milikelvin, nikoliv metr krát
					kelvin, ten by byl zapsán jako m*K nebo m K.
				</p>
			</Cz>
			<En>
				<p>
					UUC will perform dimensional analysis for you, and if the input doesn&apos;t match the target units,
					you will get a warning. In that case ignore the conversion result.
				</p>
				<p>
					That&apos;s often caused by a misunderstood unit symbol,
					<br />
					e.g. coulomb &amp; farad vs. degree Celsius &amp; Fahrenheit:{' '}
					<a className="fakeLink" onClick={() => ex('wrongSymbol')}>
						wrong
					</a>
					,&nbsp;
					<a className="fakeLink" onClick={() => ex('okSymbol')}>
						correct
					</a>
				</p>
				<p>
					It can also be caused by a syntax error, e.g. mK means milikelvin, not metre times kelvin, which
					would be written as m*K or m K.
				</p>
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function Features({ goToNextStep, ex }: StepProps) {
	return (
		<>
			<Cz>
				<h4>A jaké jsou další možnosti UUC?</h4>
				<ul>
					<li>
						Jednotky můžete skládat * násobením či / dělením:{' '}
						<a className="fakeLink" onClick={() => ex('okSymbol')}>
							příklad
						</a>
					</li>
					<li>
						Předchozí příklad je možné zpřehlednit použitím (závorek):{' '}
						<a className="fakeLink" onClick={() => ex('brackets')}>
							příklad
						</a>
						<br />
						<i>mezery mohou nahradit * jako znak násobení</i>
					</li>
					<li>
						Čísla mohou být zapsána s desetinnou čárkou i tečkou,
						<br />a lze použít zápis e123 jako 10<sup>123</sup>:{' '}
						<a className="fakeLink" onClick={() => ex('numbers')}>
							příklad
						</a>
					</li>
					{isEUR() && (
						<li>
							Světové měny lze využít k převodu měrných cen:{' '}
							<a className="fakeLink" onClick={() => ex('currencies')}>
								příklad
							</a>
						</li>
					)}
					<li>
						Číslo psané těsně vedle jednotky je zkratkou pro (závorky):{' '}
						<a className="fakeLink" onClick={() => ex('tight')}>
							příklad
						</a>
					</li>
					<li>
						Jednotky lze umocňovat pomocí ^čísla nebo jen pomocí čísla:{' '}
						<a className="fakeLink" onClick={() => ex('powers')}>
							příklad
						</a>
					</li>
					<li>
						Mocninou může být i výraz v závorce, který však nutně musí být bezrozměrný, viz poločas rozpadu
						jako{' '}
						<a className="fakeLink" onClick={() => ex('radioactiveDecay')}>
							příklad
						</a>
					</li>
					<li>
						Čísel může být ve výpočtu více a lze i sčítat a odčítat:{' '}
						<a className="fakeLink" onClick={() => ex('volumeABC')}>
							příklad
						</a>
					</li>
					<li>
						Cílovou jednotkou může být jen číslo, jedná se pak o dělení:{' '}
						<a className="fakeLink" onClick={() => ex('targetNumber')}>
							příklad
						</a>
					</li>
				</ul>
			</Cz>
			<En>
				<h4>What about other features of UUC?</h4>
				<ul>
					<li>
						You can compose units by * multiplication or / division:{' '}
						<a className="fakeLink" onClick={() => ex('okSymbol')}>
							example
						</a>
					</li>
					<li>
						The previous example can be arranged using (brackets):{' '}
						<a className="fakeLink" onClick={() => ex('brackets')}>
							example
						</a>
						<br />
						<i>spaces can replace * as a multiplication sign</i>
					</li>
					<li>
						Both decimal point and comma are accepted,
						<br />
						and you can use e123 notation as 10<sup>123</sup>:{' '}
						<a className="fakeLink" onClick={() => ex('numbers')}>
							example
						</a>
					</li>
					{isEUR() && (
						<li>
							World currencies can be used for unit price conversions:{' '}
							<a className="fakeLink" onClick={() => ex('currencies')}>
								example
							</a>
						</li>
					)}
					<li>
						Number written tightly next to unit is a shortcut for (brackets):{' '}
						<a className="fakeLink" onClick={() => ex('tight')}>
							example
						</a>
					</li>
					<li>
						You can raise units to power using ^number or just number:{' '}
						<a className="fakeLink" onClick={() => ex('powers')}>
							example
						</a>
					</li>
					<li>
						Even an expression in brackets can be a power, but it must be dimensionless, see radioactive
						decay as an{' '}
						<a className="fakeLink" onClick={() => ex('radioactiveDecay')}>
							example
						</a>
					</li>
					<li>
						There can be multiple numbers, and you can add & subtract:{' '}
						<a className="fakeLink" onClick={() => ex('volumeABC')}>
							example
						</a>
					</li>
					<li>
						A mere number can be a target unit, which acts as division:{' '}
						<a className="fakeLink" onClick={() => ex('targetNumber')}>
							example
						</a>
					</li>
				</ul>
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function Examples({ goToNextStep, closeTutorial, ex, onlyExamples }: StepProps) {
	return (
		<>
			<Cz>
				<h4>Užitečné příklady na specifické použití:</h4>
				<ul>
					<li>
						Objem na charakteristický rozměr:{' '}
						<a className="fakeLink" onClick={() => ex('charDim')}>
							příklad
						</a>
					</li>
					<li>
						Pythagorova věta: rozměry na úhlopříčku:{' '}
						<a className="fakeLink" onClick={() => ex('pythagor')}>
							příklad
						</a>
					</li>
					<li>
						Librostopa na joule, kde _g je normální tíhové zrychlení:{' '}
						<a className="fakeLink" onClick={() => ex('lbft')}>
							příklad
						</a>
						<br />
						<i>_ značí univerzální konstanty</i>
					</li>
					<li>
						Tíha kilogramu na centimetr čtvereční na psi:{' '}
						<a className="fakeLink" onClick={() => ex('kgcm2')}>
							příklad
						</a>
						<br />
						<i>psi by stejnou logikou mohlo být zapsáno i jako lb*_g/in2</i>
					</li>
					<li>
						Poundal na newton:{' '}
						<a className="fakeLink" onClick={() => ex('poundal')}>
							příklad
						</a>
					</li>
					<li>
						Přepočet magnetické indukce (B) na magnetickou intenzitu (H):{' '}
						<a className="fakeLink" onClick={() => ex('oersted')}>
							příklad
						</a>
					</li>
					<li>
						Úhel jako násobek pí:{' '}
						<a className="fakeLink" onClick={() => ex('pi')}>
							příklad
						</a>{' '}
						(prázdné pole cílové jednotky = radián)
					</li>
					<li>
						Přetlak na absolutní tlak:{' '}
						<a className="fakeLink" onClick={() => ex('gauge2abs')}>
							příklad
						</a>
						,{' '}
						<a className="fakeLink" onClick={() => ex('abs2gauge')}>
							obráceně
						</a>
					</li>
					<li>
						Normální objemový tok plynu · mol. hmotnost → hmotnostní tok:{' '}
						<a className="fakeLink" onClick={() => ex('gasFlow')}>
							příklad
						</a>
					</li>
					<li>
						Hmotnostní koncentrace plynu / mol. hmotnost → ppm:{' '}
						<a className="fakeLink" onClick={() => ex('gasConc')}>
							příklad
						</a>
					</li>
					<li>
						Tlak ve výšce dle barometrické rovnice:{' '}
						<a className="fakeLink" onClick={() => ex('barometric')}>
							příklad
						</a>
					</li>
					<li>
						Úniková rychlost z planety:{' '}
						<a className="fakeLink" onClick={() => ex('escape')}>
							příklad
						</a>
					</li>
					<li>
						Poločas rozpadu:{' '}
						<a className="fakeLink" onClick={() => ex('radioactiveDecay')}>
							příklad
						</a>
					</li>
				</ul>
				<p>A jistě vás napadne spousta dalších!</p>
				{!onlyExamples && (
					<p>
						💡 <i>V hlavní záložce je odkaz přímo sem, abyste nemuseli znovu do tutoriálu</i>
					</p>
				)}
			</Cz>
			<En>
				<h4>Useful examples for specific use:</h4>
				<ul>
					<li>
						Volume to characteristic dimension:{' '}
						<a className="fakeLink" onClick={() => ex('charDim')}>
							example
						</a>
					</li>
					<li>
						Pythagorean theorem: dimensions to diagonal:{' '}
						<a className="fakeLink" onClick={() => ex('pythagor')}>
							example
						</a>
					</li>
					<li>
						Foot pound-force to joule, where _g is standard gravity:{' '}
						<a className="fakeLink" onClick={() => ex('lbft')}>
							example
						</a>
						<br />
						<i>_ marks universal constants</i>
					</li>
					<li>
						Kilogram force per square cm to psi:{' '}
						<a className="fakeLink" onClick={() => ex('kgcm2')}>
							example
						</a>
						<br />
						<i>psi could also be written as lb*_g/in2 by the same logic</i>
					</li>
					<li>
						Poundal to newton:{' '}
						<a className="fakeLink" onClick={() => ex('poundal')}>
							example
						</a>
					</li>
					<li>
						Calculation of magnetic flux (B) to magnetic field (H):{' '}
						<a className="fakeLink" onClick={() => ex('oersted')}>
							example
						</a>
					</li>
					<li>
						Angle as a pi multiple:{' '}
						<a className="fakeLink" onClick={() => ex('pi')}>
							example
						</a>{' '}
						(empty target field is interpreted as radian)
					</li>
					<li>
						Gauge pressure to absolute:{' '}
						<a className="fakeLink" onClick={() => ex('gauge2abs')}>
							example
						</a>
						,{' '}
						<a className="fakeLink" onClick={() => ex('abs2gauge')}>
							reverse
						</a>
					</li>
					<li>
						Normal volume flow of gas · mol. weight → mass flow:{' '}
						<a className="fakeLink" onClick={() => ex('gasFlow')}>
							example
						</a>
					</li>
					<li>
						Mass concentration of gas / mol. weight → ppm:{' '}
						<a className="fakeLink" onClick={() => ex('gasConc')}>
							example
						</a>
					</li>
					<li>
						Pressure at altitude using barometric equation:{' '}
						<a className="fakeLink" onClick={() => ex('barometric')}>
							example
						</a>
					</li>
					<li>
						Escape velocity from planet:{' '}
						<a className="fakeLink" onClick={() => ex('escape')}>
							example
						</a>
					</li>
					<li>
						Radioactive decay:{' '}
						<a className="fakeLink" onClick={() => ex('radioactiveDecay')}>
							example
						</a>
					</li>
				</ul>
				<p>And surely you&apos;ll think of many more!</p>
				{!onlyExamples && (
					<p>
						💡{' '}
						<i>In main tab there is a link to this list, so you don&apos;t have to open tutorial again</i>
					</p>
				)}
			</En>
			{onlyExamples ? <CloseButton onClick={closeTutorial} /> : <NextButton onClick={goToNextStep} />}
		</>
	);
}

function Temperature({ goToNextStep, ex }: StepProps) {
	const [showCurlyRules, setShowCurlyRules] = useState(false);
	const handleToggle = () => setShowCurlyRules((prev) => !prev);

	return (
		<>
			<Cz>
				<h4>Ale co teplota?</h4>
				<p>
					Ta je běžně chápána jako teplotní <i>rozdíl</i>, nikoliv absolutní teplota (
					<a className="fakeLink" onClick={() => ex('dC')}>
						příklad
					</a>
					). Program by nemohl poznat, zda-li myslíte T či ΔT, proto se obecně pracuje s ΔT{' '}
					<i>(jak jste mohli vidět v minulých příkladech)</i>.
				</p>
				<p>
					Avšak speciální zápis pomocí &#123;složených závorek&#125; umožňuje zadat teplotu jako absolutní,
					např. takto:{' '}
					<a className="fakeLink" onClick={() => ex('F2K')}>
						°F na K
					</a>{' '}
					nebo{' '}
					<a className="fakeLink" onClick={() => ex('F2C')}>
						°F na °C
					</a>
				</p>
				<p>
					To lze různě kombinovat, např. výpočet hustoty vzduchu s{' '}
					<a className="fakeLink" onClick={() => ex('airDenseC')}>
						&#123;°C&#125;
					</a>{' '}
					a ekvivalent{' '}
					<a className="fakeLink" onClick={() => ex('airDenseK')}>
						s K
					</a>
					.
				</p>
				<p>
					Pomocí &#123;&#125; lze též použít speciální funkci –{' '}
					<a className="fakeLink" onClick={() => ex('ln')}>
						přirozený logaritmus
					</a>
					.
				</p>
				<p>📝 &#123;složené závorky&#125; na české klávesnici: pravý Alt + B, N</p>
				{showCurlyRules ? (
					<ul className="subtle">
						<li>Uvnitř &#123;&#125; je dovoleno jen jedno číslo a jedna jednotka.</li>
						<li>Jednotka nesmí mít prefix či mocninu.</li>
						<li>Číslo však může být (bezrozměrný výraz v závorce), viz příklad výše.</li>
						<li>
							V Cílových jednotkách je ještě přísnější omezení: v poli nesmí být <i>nic než</i>{' '}
							&#123;jednotka&#125;, a žádné číslo.
						</li>
						<li>Logaritmus není jednotka, nelze jej tedy použít mimo &#123;&#125;.</li>
					</ul>
				) : (
					<p className="subtle fakeLink" onClick={handleToggle}>
						👉 Má to však omezení...
					</p>
				)}
			</Cz>
			<En>
				<h4>But what about temperature?</h4>
				<p>
					It is normally understood as temp <i>difference</i>, not as absolute temp (
					<a className="fakeLink" onClick={() => ex('dC')}>
						example
					</a>
					). The program couldn&apos;t tell if you want T or ΔT, that&apos;s why it generally operates with ΔT{' '}
					<i>(as you could see in previous examples)</i>.
				</p>
				<p>
					However, a special syntax with &#123;curly brackets&#125; allows you to specify temperature as
					absolute, like this:{' '}
					<a className="fakeLink" onClick={() => ex('F2K')}>
						°F to K
					</a>{' '}
					or{' '}
					<a className="fakeLink" onClick={() => ex('F2C')}>
						°F to °C
					</a>
				</p>
				<p>
					You can freely combine it, e.g. calculate air density with{' '}
					<a className="fakeLink" onClick={() => ex('airDenseC')}>
						&#123;°C&#125;
					</a>{' '}
					and equiv.{' '}
					<a className="fakeLink" onClick={() => ex('airDenseK')}>
						with K
					</a>
					.
				</p>
				<p>
					Using the &#123;&#125; you can also use a special function –{' '}
					<a className="fakeLink" onClick={() => ex('ln')}>
						the natural logarithm
					</a>
					.
				</p>
				<p>📝 &#123;curly brackets&#125; on english keyboard: Shift + &#123; &#125; next to Enter</p>
				{showCurlyRules ? (
					<ul className="subtle">
						<li>Within &#123;&#125; only one number and unit is allowed.</li>
						<li>The unit may have neither prefix nor power.</li>
						<li>The number can be (a dimensionless expression in brackets), see above.</li>
						<li>
							Target units are even stricter, there can be <i>nothing else</i> but &#123;the unit&#125; in
							the field, and no number.
						</li>
						<li>Logarithm is not a unit, so it cannot be used outside &#123;&#125;.</li>
					</ul>
				) : (
					<p className="subtle fakeLink" onClick={handleToggle}>
						👉 There are limitations though...
					</p>
				)}
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function Conclusion({ navigate, closeTutorial }: StepProps) {
	return (
		<>
			<Cz>
				<h4>Závěrečné poznámky</h4>
				<p>
					Po rozkliknutí <i>Formát výstupu</i> můžete výstupnímu číslu nastavit počet desetinných míst, popř.
					další možnosti formátování.
				</p>
				<p>Pomocí ikony 📋 vedle výstupu můžete zformátovaný výstup zkopírovat.</p>
				<p>
					Pokud chcete celý právě zadaný převod komukoliv poslat, stačí <i>Sdílet odkaz</i>.
				</p>
				<p>
					Doporučuji pomocí tohoto{' '}
					<a className="fakeLink" onClick={() => navigate('search')}>
						návodu
					</a>{' '}
					nastavit UUC jako klíčové slovo vyhledávače, může to ušetřit dost času ⚡
				</p>
				<p>Toť vše! 🙂</p>
			</Cz>
			<En>
				<h4>Final remarks</h4>
				<p>
					After expanding <i>Output format</i> you can set decimal points of the output number, or use other
					formatting options.
				</p>
				<p>Using the 📋 icon next to output you can copy the formatted output.</p>
				<p>
					If you want to send the whole current conversion to anyone, just <i>Share link</i>.<br />
				</p>
				<p>
					I recommend following these{' '}
					<a className="fakeLink" onClick={() => navigate('search')}>
						instructions
					</a>{' '}
					to set UUC as a search engine keyword, it may save you a lot of time ⚡
				</p>
				<p>That&apos;s all! 🙂</p>
			</En>
			<CloseButton onClick={closeTutorial} />
		</>
	);
}
