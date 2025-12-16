import { type Dispatch, type FC, type SetStateAction, useRef, useState } from 'react';
import { prefixes } from 'uuc-core';
import { Cz, En } from '../lang';
import { type ExId, type Step, type StepId, type TutorialState, examples, steps } from './tutorialConfig';
import { Ex, TutorialContext, isEUR, useTutorialContext } from './tutorialUtils';
import { useDraggable } from './useDraggable';
import type { FullConversion, Route } from '../types';

type TutorialProps = {
	state: TutorialState;
	setState: Dispatch<SetStateAction<TutorialState | null>>;
	navigate: Dispatch<Route>;
	setInput: Dispatch<string>;
	setTarget: Dispatch<string>;
	fullConversion: FullConversion;
};

const stepComponentMap: Record<StepId, FC> = {
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
				<TutorialContext.Provider
					value={{ navigate, goToNextStep, closeTutorial, ex, onlyExamples: state.onlyExamples }}
				>
					<StepComponent />
				</TutorialContext.Provider>
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

function Intro() {
	const { goToNextStep } = useTutorialContext();
	return (
		<>
			<Cz>
				<p>
					Záložka <b>Převodník</b> je hlavní částí UUC.
					<br />
					Zde můžete napsat výraz do textového pole Vstup a stisknout tlačítko Převést nebo klávesu Enter:{' '}
					<Ex id="SI" label="příklad" />
				</p>
				<p>
					Převod takto proběhne do základních jednotek SI, můžete však vyplnit textové pole Cílové jednotky
					pro určení výstupních jednotek: <Ex id="simple" label="příklad" />
				</p>
				<p>Jak je vidět, při převodu můžete (avšak nemusíte) specifikovat číslo na vstupu.</p>
				<p>
					Mějte na paměti že jednotky jsou dle konvencí citlivé na VELIKOST písmen!
					<br />
					UUC se snaží porozumět i jinému zápisu: <Ex id="wrongCase" label="příklad" />, ale nemusí to
					fungovat vždy..
				</p>
			</Cz>
			<En>
				<p>
					The <b>Converter</b> tab is the main part of UUC.
					<br />
					Here you can enter an expression into the Input text field and press the Convert button or Enter
					key: <Ex id="SI" label="example" />
				</p>
				<p>
					Input will be converted into basic SI units by default, but you can fill out the Target units text
					field in order to specify the output units: <Ex id="simple" label="example" />
				</p>
				<p>As you can see, you may (but needn&apos;t) specify a number in the conversion input.</p>
				<p>
					Bear in mind, that units are by convention case-SENSITIVE!
					<br />
					UUC tries to understand a different case: <Ex id="wrongCase" label="example" />, but it may not
					always work..
				</p>
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function Reference() {
	const { goToNextStep } = useTutorialContext();
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
						<a target="_blank" href="https://frankfurter.dev/" rel="noreferrer">API</a>.
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
						<a target="_blank" href="https://frankfurter.dev/" rel="noreferrer">API</a>.
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

function DimAnalysis() {
	const { goToNextStep } = useTutorialContext();
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
					<Ex id="wrongSymbol" label="špatně" />
					,&nbsp;
					<Ex id="okSymbol" label="správně" />
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
					e.g. coulomb &amp; farad vs. degree Celsius &amp; Fahrenheit: <Ex id="wrongSymbol" label="wrong" />
					,&nbsp;
					<Ex id="okSymbol" label="correct" />
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

function Features() {
	const { goToNextStep } = useTutorialContext();
	return (
		<>
			<Cz>
				<h4>A jaké jsou další možnosti UUC?</h4>
				<ul>
					<li>
						Jednotky můžete skládat * násobením či / dělením: <Ex id="okSymbol" label="příklad" />
					</li>
					<li>
						Předchozí příklad je možné zpřehlednit použitím (závorek): <Ex id="brackets" label="příklad" />
						<br />
						<i>mezery mohou nahradit * jako znak násobení</i>
					</li>
					<li>
						Čísla mohou být zapsána s desetinnou čárkou i tečkou,
						<br />a lze použít zápis e123 jako 10<sup>123</sup>: <Ex id="numbers" label="příklad" />
					</li>
					{isEUR() && (
						<li>
							Světové měny lze využít k převodu měrných cen: <Ex id="currencies" label="příklad" />
						</li>
					)}
					<li>
						Číslo psané těsně vedle jednotky je zkratkou pro (závorky): <Ex id="tight" label="příklad" />
					</li>
					<li>
						Jednotky lze umocňovat pomocí ^čísla nebo jen pomocí čísla: <Ex id="powers" label="příklad" />
					</li>
					<li>
						Mocninou může být i výraz v závorce, který však nutně musí být bezrozměrný, viz poločas rozpadu
						jako <Ex id="radioactiveDecay" label="příklad" />
					</li>
					<li>
						Čísel může být ve výpočtu více a lze i sčítat a odčítat: <Ex id="volumeABC" label="příklad" />
					</li>
					<li>
						Cílovou jednotkou může být jen číslo, jedná se pak o dělení:{' '}
						<Ex id="targetNumber" label="příklad" />
					</li>
				</ul>
			</Cz>
			<En>
				<h4>What about other features of UUC?</h4>
				<ul>
					<li>
						You can compose units by * multiplication or / division: <Ex id="okSymbol" label="example" />
					</li>
					<li>
						The previous example can be arranged using (brackets): <Ex id="brackets" label="example" />
						<br />
						<i>spaces can replace * as a multiplication sign</i>
					</li>
					<li>
						Both decimal point and comma are accepted,
						<br />
						and you can use e123 notation as 10<sup>123</sup>: <Ex id="numbers" label="example" />
					</li>
					{isEUR() && (
						<li>
							World currencies can be used for unit price conversions:{' '}
							<Ex id="currencies" label="example" />
						</li>
					)}
					<li>
						Number written tightly next to unit is a shortcut for (brackets):{' '}
						<Ex id="tight" label="example" />
					</li>
					<li>
						You can raise units to power using ^number or just number: <Ex id="powers" label="example" />
					</li>
					<li>
						Even an expression in brackets can be a power, but it must be dimensionless, see radioactive
						decay as an <Ex id="radioactiveDecay" label="example" />
					</li>
					<li>
						There can be multiple numbers, and you can add & subtract: <Ex id="volumeABC" label="example" />
					</li>
					<li>
						A mere number can be a target unit, which acts as division:{' '}
						<Ex id="targetNumber" label="example" />
					</li>
				</ul>
			</En>
			<NextButton onClick={goToNextStep} />
		</>
	);
}

function Examples() {
	const { goToNextStep, closeTutorial, onlyExamples } = useTutorialContext();
	return (
		<>
			<Cz>
				<h4>Užitečné příklady na specifické použití:</h4>
				<ul>
					<li>
						Objem na charakteristický rozměr: <Ex id="charDim" label="příklad" />
					</li>
					<li>
						Pythagorova věta: rozměry na úhlopříčku: <Ex id="pythagor" label="příklad" />
					</li>
					<li>
						Librostopa na joule, kde _g je normální tíhové zrychlení: <Ex id="lbft" label="příklad" />
						<br />
						<i>_ značí univerzální konstanty</i>
					</li>
					<li>
						Tíha kilogramu na centimetr čtvereční na psi: <Ex id="kgcm2" label="příklad" />
						<br />
						<i>psi by stejnou logikou mohlo být zapsáno i jako lb*_g/in2</i>
					</li>
					<li>
						Poundal na newton: <Ex id="poundal" label="příklad" />
					</li>
					<li>
						Přepočet magnetické indukce (B) na magnetickou intenzitu (H):{' '}
						<Ex id="oersted" label="příklad" />
					</li>
					<li>
						Úhel jako násobek pí: <Ex id="pi" label="příklad" /> (prázdné pole cílové jednotky = radián)
					</li>
					<li>
						Výška v stopách+palcích: <Ex id="ft_in" label="příklad" />
					</li>
					<li>
						Přetlak na absolutní tlak: <Ex id="gauge2abs" label="příklad" />,{' '}
						<Ex id="abs2gauge" label="obráceně" />
					</li>
					<li>
						Normální objemový tok plynu · mol. hmotnost → hmotnostní tok:{' '}
						<Ex id="gasFlow" label="příklad" />
					</li>
					<li>
						Hmotnostní koncentrace plynu / mol. hmotnost → ppm: <Ex id="gasConc" label="příklad" />
					</li>
					<li>
						Tlak ve výšce dle barometrické rovnice: <Ex id="barometric" label="příklad" />
					</li>
					<li>
						Úniková rychlost z planety: <Ex id="escape" label="příklad" />
					</li>
					<li>
						Poločas rozpadu: <Ex id="radioactiveDecay" label="příklad" />
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
						Volume to characteristic dimension: <Ex id="charDim" label="example" />
					</li>
					<li>
						Pythagorean theorem: dimensions to diagonal: <Ex id="pythagor" label="example" />
					</li>
					<li>
						Foot pound-force to joule, where _g is standard gravity: <Ex id="lbft" label="example" />
						<br />
						<i>_ marks universal constants</i>
					</li>
					<li>
						Kilogram force per square cm to psi: <Ex id="kgcm2" label="example" />
						<br />
						<i>psi could also be written as lb*_g/in2 by the same logic</i>
					</li>
					<li>
						Poundal to newton: <Ex id="poundal" label="example" />
					</li>
					<li>
						Calculation of magnetic flux (B) to magnetic field (H): <Ex id="oersted" label="example" />
					</li>
					<li>
						Angle as a pi multiple: <Ex id="pi" label="example" /> (empty target field is interpreted as
						radian)
					</li>
					<li>
						Height in feet+inches: <Ex id="ft_in" label="example" />
					</li>
					<li>
						Gauge pressure to absolute: <Ex id="gauge2abs" label="example" />,{' '}
						<Ex id="abs2gauge" label="reverse" />
					</li>
					<li>
						Normal volume flow of gas · mol. weight → mass flow: <Ex id="gasFlow" label="example" />
					</li>
					<li>
						Mass concentration of gas / mol. weight → ppm: <Ex id="gasConc" label="example" />
					</li>
					<li>
						Pressure at altitude using barometric equation: <Ex id="barometric" label="example" />
					</li>
					<li>
						Escape velocity from planet: <Ex id="escape" label="example" />
					</li>
					<li>
						Radioactive decay: <Ex id="radioactiveDecay" label="example" />
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

function Temperature() {
	const { goToNextStep } = useTutorialContext();
	const [showCurlyRules, setShowCurlyRules] = useState(false);
	const handleToggle = () => setShowCurlyRules((prev) => !prev);

	return (
		<>
			<Cz>
				<h4>Ale co teplota?</h4>
				<p>
					Ta je běžně chápána jako teplotní <i>rozdíl</i>, nikoliv absolutní teplota (
					<Ex id="dC" label="příklad" />
					). Program by nemohl poznat, zda-li myslíte T či ΔT, proto se obecně pracuje s ΔT{' '}
					<i>(jak jste mohli vidět v minulých příkladech)</i>.
				</p>
				<p>
					Avšak speciální zápis pomocí &#123;složených závorek&#125; umožňuje zadat teplotu jako absolutní,
					např. takto: <Ex id="F2K" label="°F na K" /> nebo <Ex id="F2C" label="°F na °C" />
				</p>
				<p>
					To lze různě kombinovat, např. výpočet hustoty vzduchu s{' '}
					<Ex id="airDenseC" label="&#123;°C&#125;" /> a ekvivalent <Ex id="airDenseK" label="s K" />.
				</p>
				<p>
					Pomocí &#123;&#125; lze též použít speciální funkci – <Ex id="ln" label="přirozený logaritmus" />.
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
					<Ex id="dC" label="example" />
					). The program couldn&apos;t tell if you want T or ΔT, that&apos;s why it generally operates with ΔT{' '}
					<i>(as you could see in previous examples)</i>.
				</p>
				<p>
					However, a special syntax with &#123;curly brackets&#125; allows you to specify temperature as
					absolute, like this: <Ex id="F2K" label="°F to K" /> or <Ex id="F2C" label="°F to °C" />
				</p>
				<p>
					You can freely combine it, e.g. calculate air density with{' '}
					<Ex id="airDenseC" label="&#123;°C&#125;" /> and equiv. <Ex id="airDenseK" label="with K" />.
				</p>
				<p>
					Using the &#123;&#125; you can also use a special function –{' '}
					<Ex id="ln" label="the natural logarithm" />.
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

function Conclusion() {
	const { navigate, closeTutorial } = useTutorialContext();
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
