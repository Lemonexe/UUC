import React, { type Dispatch, Fragment, type SetStateAction, useLayoutEffect, useState } from 'react';
import { type FormatParams, format } from 'uuc-core';
import { Cz, En } from '../lang';
import { defaultDigits, defaultFixed, ps } from '../state';
import { add2history, getCurrentWebAddress, getShareLink, useCopyUIEffects } from '../utils';
import type { FormState, FullConversion, ResultWithId } from '../types';

const currentWebAddress = getCurrentWebAddress();
const isAvailableCtrlC = !!navigator.clipboard; // unsecure connection (such as http) will be false

type CommonProps = FormState & {
	setInput: Dispatch<string>;
	setTarget: Dispatch<string>;
	setFormatParams: Dispatch<FormatParams>;
	fullConversion: FullConversion;
	result: ResultWithId | null;
	setResult: Dispatch<SetStateAction<ResultWithId | null>>;
	showTutorialExamples: () => void;
};

// current index of selected (autocompleted) history item, -1 means none. Outside of state because doesn't affect rendering
let autocomplete = -1;

const ConverterForm = ({
	input,
	setInput,
	target,
	setTarget,
	formatParams,
	setFormatParams,
	fullConversion,
	result,
}: CommonProps) => {
	const { wasCopiedNow, copyClass, doCopyUIEffect } = useCopyUIEffects();

	const flip = () => {
		if (result === null || result.output === null) {
			setTarget(input);
			setInput(target);
			return; // Don't start full conversion, because this is considered a draft (no working output yet)
		}
		const newTarget = input.replace(/^[+-]?[\d.]+(?:e[+-]?\d+)?/, '').trim();
		setTarget(newTarget);
		const newInput = `${result.output.formattedNum ?? result.output.num} ${result.output.dim}`;
		setInput(newInput);
		fullConversion(newInput, newTarget); // Must convert to regenerate output, otherwise next flip would be nonsense
	};

	const printedResult = result?.output
		? `${result.output.formattedNum ?? result.output.num} ${result.output.dim}`
		: '';

	// Recall form state from history using either the autocomplete dropdown list, or ↑↓ keys
	const applyAutocomplete = (i: number) => {
		if (autocomplete === -1) {
			// save the current form state (draft), so the user doesn't lose it
			add2history({ input, target, formatParams });
		}
		autocomplete = i;

		const len = ps.history.length;
		// cycle back to beginning or to end
		autocomplete < 0 && (autocomplete = len - 1);
		autocomplete >= len && (autocomplete = 0);
		// and finally, load the entry
		const item = ps.history[autocomplete];
		setInput(item.input);
		setTarget(item.target);
		setFormatParams(item.formatParams);
	};

	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			fullConversion(input, target);
		} else if (e.key === 'ArrowDown') {
			applyAutocomplete(autocomplete + 1);
		} else if (e.key === 'ArrowUp') {
			applyAutocomplete(autocomplete - 1);
		}
	};

	// copy the verbatim output to clipboard (with a visual effect to show it happened)
	const copyOutput = () => {
		doCopyUIEffect();
		navigator.clipboard.writeText(printedResult).then();
	};

	return (
		<div style={{ minWidth: 400 }}>
			<b>
				<Cz>Vstup:</Cz>
				<En>Input:</En>
			</b>
			<br />
			<input
				type="text"
				className="inputBox"
				value={input}
				onKeyUp={handleKeyUp}
				onChange={(e) => {
					setInput(e.target.value);
					autocomplete = -1;
				}}
				tabIndex={1}
				autoFocus
			/>
			{ps.history.length > 1 && (
				<select
					value={autocomplete} // only to highlight the selected option, if exact match
					onChange={(e) => applyAutocomplete(parseInt(e.target.value))}
					id="inputAutocomplete"
				>
					{ps.history.map((opt, i) => (
						<option key={`${opt.input}>${opt.input}:${i}`} value={i}>
							{opt.input + (opt.target ? ' > ' + opt.target : '')}
						</option>
					))}
				</select>
			)}
			<a onClick={flip} className="flipButton" role="button">
				⇅
			</a>
			<br />

			<b>
				<Cz>Cílové jednotky:</Cz>
				<En>Target units:</En>
			</b>
			<br />
			<input
				type="text"
				className="inputBox"
				value={target}
				onKeyUp={handleKeyUp}
				onChange={(e) => {
					setTarget(e.target.value);
					autocomplete = -1;
				}}
				tabIndex={2}
			/>
			<br />
			<button type="button" onClick={() => fullConversion(input, target)} className="bigButton" tabIndex={3}>
				<Cz>Převést</Cz>
				<En>Convert</En>
			</button>
			<br />
			<br />
			<b>
				<Cz>Výstup:</Cz>
				<En>Output:</En>
			</b>
			{wasCopiedNow && (
				<span className={copyClass}>
					<Cz>úspěšně zkopírováno</Cz>
					<En>copied successfully</En>
				</span>
			)}
			<br />
			<span className="inputBox outputBox">{printedResult}</span>
			{isAvailableCtrlC && result?.output && result.status < 2 && (
				<span onClick={copyOutput} style={{ cursor: 'copy' }} title="Ctrl+C">
					📋
				</span>
			)}
			<br />
		</div>
	);
};

const Tools = ({ input, target, formatParams, showTutorialExamples, setResult, setFormatParams }: CommonProps) => {
	const { spec } = formatParams;
	const [showParams, setShowParams] = useState(false);
	const [showShareLink, setShowShareLink] = useState(false);
	const shareLink = getShareLink({ input, target, formatParams });
	const { wasCopiedNow, copyClass, doCopyUIEffect } = useCopyUIEffects();
	const copyShareLink = () => {
		setShowShareLink(false);
		doCopyUIEffect();
		navigator.clipboard.writeText(shareLink).then();
	};

	const [digits, setDigits] = useState(defaultDigits);
	const [fixed, setFixed] = useState(defaultFixed);
	const reformat = (newParams: FormatParams) => {
		newParams = { exp: formatParams.exp, ...newParams };
		setFormatParams(newParams);
		add2history({ input, target, formatParams: newParams });
		setResult((prev) => {
			if (prev === null || prev.status === 2) return prev;
			return { ...prev, output: format(prev.output, newParams) };
		});
	};
	const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = parseInt(e.target.value);
		setDigits(newVal);
		reformat({ spec: 'digits', digits: newVal });
	};
	const handleFixedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = parseInt(e.target.value);
		setFixed(newVal);
		reformat({ spec: 'fixed', fixed: newVal });
	};
	const handleExpChange = () => reformat({ ...formatParams, exp: !formatParams.exp });

	return (
		<div style={{ padding: 8 }}>
			<a onClick={showTutorialExamples} style={{ cursor: 'pointer' }} role="button">
				<span className="expandable">?</span>
				<Cz>Příklady</Cz>
				<En>Examples</En>
			</a>
			<br />

			<a onClick={() => setShowParams((prev) => !prev)} style={{ cursor: 'pointer' }} role="button">
				<span className="expandable">{showParams ? '–' : '+'}</span>
				<Cz>Formát výstupu</Cz>
				<En>Output format</En>
			</a>
			{showParams &&
				// prettier-ignore
				<div>
					<label>
						<input type="radio" checked={spec === 'none'} onChange={() => reformat({ spec: 'none' })} />{' '}
						<Cz>automatický</Cz>
						<En>automatic</En>
					</label>
					<br />
					<label>
						<input type="radio" checked={spec === 'digits'} onChange={() => reformat({ spec: 'digits', digits })} />{' '}
						<Cz>počet platných cifer</Cz>
						<En>significant digits</En>:{' '}
					</label>
					<input type="number" className="numSelector" value={digits} min={1} max={20} onChange={handleDigitsChange} />
					<br />
					<label>
						<input type="radio" checked={spec === 'fixed'} onChange={() => reformat({ spec: 'fixed', fixed })} />{' '}
						<Cz>počet desetinných míst</Cz>
						<En>number of decimals</En>:{' '}
					</label>
					<input type="number" className="numSelector" value={fixed} min={0} max={20} onChange={handleFixedChange} />
					<br />
					<br />
					<label>
						<input type="checkbox" checked={formatParams.exp === true} onChange={handleExpChange} />{' '}
						<Cz>vždy vědecký zápis</Cz>
						<En>always scientific notation</En>
					</label>
				</div>}
			<br />
			<a onClick={() => setShowShareLink((prev) => !prev)} style={{ cursor: 'pointer' }} role="button">
				<span className="expandable">≫</span>
				<Cz>Sdílet odkaz</Cz>
				<En>Share link</En>
			</a>
			{wasCopiedNow && (
				<span className={copyClass}>
					<Cz>úspěšně zkopírováno</Cz>
					<En>copied successfully</En>
				</span>
			)}
			<br />
			{showShareLink && (
				<div id="sharelinkBox">
					{isAvailableCtrlC ? (
						<div>
							<Cz>Kliknutím zkopírujete do schránky odkaz na tuto konverzi</Cz>
							<En>Click to copy the link with this conversion to clipboard</En>
							<br />
							<span onClick={copyShareLink} style={{ cursor: 'copy' }} title="Ctrl+C">
								📋{' '}
								<span className="fakeLink" style={{ cursor: 'copy' }}>
									{shareLink}
								</span>
							</span>
						</div>
					) : (
						<div>
							<Cz>❗ Schránka není dostupná, protože spojení je nezabezpečené. Zkuste otevřít v</Cz>
							<En>❗ Clipboard is not available due to unsecured connection. Try opening in</En>
							<a href={currentWebAddress.replace('http', 'https')}>https</a>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const Status = ({ result }: { result: ResultWithId }) => {
	const [statusAppearClass, setStatusAppearClass] = useState<'statusAppear' | ''>('');

	// trigger the statusAppearClass animation on a new unique result
	useLayoutEffect(() => {
		if (statusAppearClass === 'statusAppear') return; // debounce multiple new unique results in quick succession
		setStatusAppearClass('statusAppear');
		setTimeout(() => setStatusAppearClass(''), 500);
	}, [result.id, setStatusAppearClass]);

	return (
		<div className={statusAppearClass}>
			<br />
			<b>
				<Cz>Stav:</Cz>
				<En>Status:</En>
			</b>
			<br />
			<div className={['ok', 'warn', 'err'][result.status]}>
				{result.messages.length === 0 && 'OK'}
				{result.messages.map((m, i) => (
					<Fragment key={`${m.code}:${i}`}>
						{m.message}
						<br />
					</Fragment>
				))}
			</div>
		</div>
	);
};

export const Converter = (props: CommonProps) => (
	<div>
		{!ps.hideTutorialLink && (
			<div style={{ marginBottom: 10 }}>
				<Cz>Jste zde poprvé? Pak doporučuji navštívit záložku Úvod!</Cz>
				<En>First-time visitor? Then I&apos;ll recommend to take a look at the Intro tab!</En>
			</div>
		)}
		<div className="convertContainer">
			<ConverterForm {...props} />
			<Tools {...props} />
		</div>
		{props.result && <Status result={props.result} />}
	</div>
);
