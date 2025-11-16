import type { Route } from '../types';
import type { Dispatch } from 'react';

type Example = { input: string; target: string };
export const examples = {
	SI: { input: 'min', target: '' },
	simple: { input: '45 kPa', target: 'torr' },
	wrongCase: { input: '45 kPA', target: 'torr' },
	wrongSymbol: { input: '4.186 J/C/g ', target: 'Btu/F/lb' },
	okSymbol: { input: '4.186 J/°C/g ', target: 'Btu/°F/lb' },
	brackets: { input: ' 4.186 J    / (°C* g) ', target: 'Btu / ( °F lb ) ' },
	numbers: { input: '7,42e-3', target: '%' },
	currencies: { input: ' 0.32 $ / (kWh) ', target: 'EUR / cal' },
	tight: { input: 'km / 5min', target: 'km/h' },
	powers: { input: 'kg * m2 * s^(-3)', target: 'W' },
	radioactiveDecay: { input: '500 mg * _e^(-72 h / (8.0197 d))', target: 'mg' },
	volumeABC: { input: '18mm * 6.5cm * 22cm  +  230 ml', target: 'l' },
	charDim: { input: '(1,5 l)^(1/3)', target: 'cm' },
	pythagor: { input: '((53 cm)^2 + (295 mm)^2)^.5', target: 'in' },
	lbft: { input: '_g * lb * ft ', target: 'J' },
	kgcm2: { input: 'kg * _g / cm2 ', target: 'psi' },
	poundal: { input: 'lb * ft / s2 ', target: 'N' },
	oersted: { input: 'T / _mu', target: 'Oe' },
	pi: { input: '45°', target: 'π' },
	targetNumber: { input: '96', target: '12' },
	gasFlow: { input: '7000 Nm3 / h * 28 g/mol', target: 't/h' },
	gasConc: { input: '25 mg / Nm3 / (34 g/mol)', target: 'ppm' },
	barometric: { input: 'atm * _e^(-37000ft * _g * 28 g/mol / (_R * 300K))', target: 'kPa' },
	escape: { input: '( 2 _G * 5.972e24 kg / (6371 km) )^0.5', target: 'mph' },
	gauge2abs: { input: '80 mmHg + atm', target: 'kPa' },
	abs2gauge: { input: '160 mbar - atm', target: 'kPa' },
	dC: { input: '°C', target: 'K' },
	F2K: { input: '{131°F}', target: 'K' },
	F2C: { input: '{131°F}', target: '{°C}' },
	airDenseK: { input: 'atm * 28 g/mol / _R / (298.15 K)', target: 'kg/m3' },
	airDenseC: { input: 'atm * 28 g/mol / _R / {25°C}', target: 'kg/m3' },
	ln: { input: '(27K - 32K) / ( {ln (27K/(32K)) } )', target: '°C' },
} as const satisfies Record<string, Example>;
export type ExId = keyof typeof examples;

export type StepProps = {
	navigate: Dispatch<Route>;
	goToNextStep: () => void;
	closeTutorial: () => void;
	ex: (exId: ExId) => void;
	onlyExamples?: boolean;
};

export type Step = { route?: Route; top?: number; left?: number };
export const steps = {
	intro: { top: 120, left: 420 },
	reference: { route: 'reference', top: 120, left: 480 },
	dimAnalysis: { route: 'converter', top: 120, left: 420 },
	features: { top: 120, left: 420 },
	examples: { top: 120, left: 420 },
	temperature: { top: 120, left: 420 },
	conclusion: { top: 350, left: 420 },
} as const satisfies Record<string, Step>;
export type StepId = keyof typeof steps;

export type TutorialState = {
	id: StepId;
	onlyExamples?: boolean; // if true, only show examples list (skip to step 4)
};

export const initialTutorialState: TutorialState = { id: 'intro' };
