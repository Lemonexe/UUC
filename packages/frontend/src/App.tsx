import { useEffect, useState } from 'react';
import { type FormatParams, convert, format } from 'uuc-core';
import { Converter } from './components/Converter';
import { Footer } from './components/Footer';
import { Intro } from './components/Intro';
import { LangPicker } from './components/LangPicker';
import { Menu } from './components/Menu';
import { Reference } from './components/Reference';
import { SearchEngines } from './components/SearchEngines';
import { Tutorial } from './components/Tutorial';
import { type TutorialState, initialTutorialState } from './components/tutorialConfig';
import { loadCurrencies } from './io/currencies';
import { execHash } from './io/locationHash';
import { LangContextProvider } from './lang';
import { initialRoute, ps } from './state';
import { add2history } from './utils';
import type { FullConversion, ResultWithId, Route } from './types';

export const App = () => {
	const [route, setRoute] = useState<Route>(initialRoute);
	const [input, setInnerInput] = useState(ps.input);
	const [target, setInnerTarget] = useState(ps.target);
	const [formatParams, setInnerFormatParams] = useState(ps.formatParams);
	const [result, setResult] = useState<ResultWithId | null>(null);
	const [tutorialState, setTutorialState] = useState<TutorialState | null>(null);

	const setInput = (v: string) => {
		setInnerInput(v);
		ps.input = v;
	};
	const setTarget = (v: string) => {
		setInnerTarget(v);
		ps.target = v;
	};
	const setFormatParams = (v: FormatParams) => {
		setInnerFormatParams(v);
		ps.formatParams = v;
	};

	const navigate = (r: Route) => {
		setRoute(r);
		ps.hideTutorialLink = true;
	};

	// Perform a full conversion with optional callback on the result (defaults to identity fn).
	const fullConversion: FullConversion = (i, t, onResult = (r) => r) => {
		const res = convert(i, t);
		res.output && (res.output = format(res.output, formatParams));
		add2history({ input: i, target: t, formatParams });
		const id = crypto.randomUUID();
		setResult(onResult({ ...res, id }));
	};
	const showTutorialExamples = () => setTutorialState({ id: 'examples', onlyExamples: true });
	const initTutorial = () => {
		navigate('converter');
		setInput('');
		setTarget('');
		setResult(null);
		setFormatParams({ spec: 'none' });
		setTutorialState(initialTutorialState);
	};

	const [currencyTimestamp, setCurrencyTimestamp] = useState(''); // also helps to rerender when updated

	useEffect(() => {
		loadCurrencies({ setCurrencyTimestamp }).then(() => {
			execHash({ setInput, setTarget, setFormatParams, fullConversion });
		});
	}, []);

	return (
		<LangContextProvider>
			<LangPicker />

			<div id="centeredContainer">
				<div id="contentContainer">
					<h1>Ultimate Unit Converter</h1>
					<Menu route={route} navigate={navigate} />

					{route === 'reference' && <Reference currencyTimestamp={currencyTimestamp} />}
					{route === 'converter' && (
						<Converter
							input={input}
							setInput={setInput}
							target={target}
							setTarget={setTarget}
							formatParams={formatParams}
							setFormatParams={setFormatParams}
							fullConversion={fullConversion}
							result={result}
							setResult={setResult}
							showTutorialExamples={showTutorialExamples}
						/>
					)}
					{route === 'intro' && <Intro navigate={navigate} initTutorial={initTutorial} />}
					{route === 'search' && <SearchEngines navigate={navigate} />}
				</div>
				{tutorialState !== null && (
					<Tutorial
						state={tutorialState}
						setState={setTutorialState}
						navigate={navigate}
						setInput={setInput}
						setTarget={setTarget}
						fullConversion={fullConversion}
					/>
				)}
			</div>

			<Footer />
		</LangContextProvider>
	);
};
