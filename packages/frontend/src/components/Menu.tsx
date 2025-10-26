import { Cz, En } from '../lang';
import type { Route } from '../types';
import type { Dispatch } from 'react';

type MenuProps = { route: Route; navigate: Dispatch<Route> };

export const Menu = ({ route, navigate }: MenuProps) => {
	const converterClass = route === 'converter' ? ' activeTab' : '';
	const referenceClass = route === 'reference' ? ' activeTab' : '';
	const introClass = ['intro', 'search'].includes(route) ? ' activeTab' : '';

	return (
		<div id="tabButtonContainer">
			<span onClick={() => navigate('converter')} className={'tabButton' + converterClass}>
				<Cz>Převodník</Cz>
				<En>Converter</En>
			</span>
			<span onClick={() => navigate('reference')} className={'tabButton' + referenceClass}>
				<Cz>Reference</Cz>
				<En>Reference</En>
			</span>
			<span onClick={() => navigate('intro')} className={'tabButton' + introClass}>
				<Cz>Úvod</Cz>
				<En>Intro</En>
			</span>
		</div>
	);
};
