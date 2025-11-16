import { type Dispatch, type ReactNode, createContext, useContext } from 'react';
import { units } from 'uuc-core';
import { type ExId } from './tutorialConfig';
import type { Route } from '../types';

type TutorialContext = {
	navigate: Dispatch<Route>;
	goToNextStep: () => void;
	closeTutorial: () => void;
	ex: (exId: ExId) => void;
	onlyExamples?: boolean;
};
export const TutorialContext = createContext<TutorialContext | null>(null);
export const useTutorialContext = () => {
	const ctx = useContext(TutorialContext);
	if (ctx === null) throw new Error('useTutorialContext must be used within a TutorialContext.Provider');
	return ctx;
};

// EUR is referenced in the 'currencies' example. Meanwhile, USD is a basic unit so it's guaranteed.
export const isEUR = () => units.some(({ id }) => id === 'EUR');

type ExProps = { id: ExId; label: ReactNode };
export const Ex = ({ id, label }: ExProps) => {
	const { ex } = useTutorialContext();
	return (
		<a className="fakeLink" onClick={() => ex(id)}>
			{label}
		</a>
	);
};
