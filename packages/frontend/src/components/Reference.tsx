import { useMemo, useState } from 'react';
import { type Unit, type V, parseQ, units, vector2text } from 'uuc-core';
import { Cz, En, trans, useLang } from '../lang';
import { ps } from '../state';

type ReferenceParams = {
	currencyTimestamp: string;
};

export const Reference = ({ currencyTimestamp }: ReferenceParams) => {
	const lang = useLang();
	const [filter, setFilter] = useState<string>('');
	const databaseCount = units.length; // constant total unit count

	const { unitList, exactMatch } = useMemo(() => getUnitList(filter.trim()), [filter]);

	const filteredCount = unitList.length;

	return (
		<div>
			<p>
				<Cz>
					V databázi je {databaseCount} položek, z toho {filteredCount} je právě zobrazeno.
					<br />
					Kurzy měn byly aktualizovány v {currencyTimestamp}.
				</Cz>
				<En>
					There are {databaseCount} items in database with {filteredCount} currently listed.
					<br />
					Currency exchange rates were updated at {currencyTimestamp}.
				</En>
			</p>
			<b>
				<Cz>Vyhledat jednotky:</Cz>
				<En>Search units:</En>
			</b>
			<br />
			<input
				type="text"
				className="inputBox"
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				style={{ marginBottom: '4px' }}
			/>
			<br />
			<div className="subtle" style={{ marginBottom: '24px' }}>
				<Cz>(filtruje jednotky se stejným rozměrem, 1 pro bezrozměrné, _ pro seznam vestavěných konstant)</Cz>
				<En>(filters units with the same dimension, 1 for dimensionless, _ for list of built-in constants)</En>
			</div>

			{unitList.map((u, i) => (
				<p key={u.id}>
					<span className={'reference' + (i === 0 && exactMatch ? ' highlight' : '')}>
						<b>{u.name[lang]}</b>
						{buildUnitEntry(u)}
					</span>
				</p>
			))}
		</div>
	);
};

type GetUnitListResult = {
	unitList: Unit[];
	exactMatch: boolean; // whether the first unit is an exactly matched unit, otherwise the matches are only by dimension
};
function getUnitList(filter: string): GetUnitListResult {
	// sort a given unit id to the top
	const getSortMatchedUnit = (sortId: string) => (a: Unit, b: Unit) =>
		a.id === sortId ? -1 : b.id === sortId ? 1 : 0;

	// filter units by dimension vector
	const getFilterFunction = (fv: V) => (u: Unit) => u.v.every((o, i) => o === fv[i]);

	// No filter, return everything
	if (filter === '') return { unitList: units, exactMatch: false };

	// Filter only constants
	if (filter === '_') {
		const unitList = units.filter((item) => item.constant);
		return { unitList, exactMatch: false };
	}

	// Try to search for a specific dimension
	// First let's try to parse filter string as a Q instance, may be just a unit id, or a complex physical expression
	const { q, id } = parseQ(filter);

	// Q instance successfully parsed, filter by its vector
	if (q) {
		const filteredUnits = units.filter(getFilterFunction(q.v));

		// If the Q was exactly one unit, sort it to the top to highlight it
		if (id && filteredUnits.some((u) => u.id === id)) {
			const sortedUnits = filteredUnits.sort(getSortMatchedUnit(id));
			return { unitList: sortedUnits, exactMatch: true };
		}
		return { unitList: filteredUnits, exactMatch: false };
	}

	// The input isn't a valid Q, so let's find unit by name.

	// Split unit name into words and try to match filter string at beginning of words
	const nameMatch = units.find((u) =>
		u.name[ps.lang]
			.toLowerCase()
			.split(' ')
			.some((word) => word.indexOf(filter.toLowerCase()) === 0)
	);

	// Attempt to find unit by name failed, collection will be empty
	if (!nameMatch) {
		return { unitList: [], exactMatch: false };
	}
	// Unit was found, so filter all units with the same dimension, sort the matched unit to the top to highlight it
	const unitList = units.filter(getFilterFunction(nameMatch.v)).sort(getSortMatchedUnit(nameMatch.id));

	return { unitList, exactMatch: true };
}

// each unit is described by dimension represented by basic SI and info:
// whether it is a constant, SI, basic SI, what prefixes are recommended and possibly a note
function buildUnitEntry(unit: Unit) {
	const aliases = unit.alias ? ', ' + unit.alias.join(', ') : '';
	let text = ` (${unit.id + aliases}) `;
	let dim = vector2text(unit.v);
	dim = dim === '1' ? '' : dim;
	text += unit.basic || isNaN(unit.k) ? '' : ` = ${unit.k} ${dim}\n`;

	if (unit.constant) {
		text += trans('Constant.', 'Konstanta.');
	} else {
		text += unit.basic ? trans('Basic, ', 'Základní, ') : '';
		text += unit.SI ? 'SI, ' : '';
		switch (unit.prefix) {
			case 'all':
				text += trans('all prefixes can be used.', 'všechny předpony mohou být použity.');
				break;
			case '+':
				text += trans(
					'usually only increasing prefixes are used.',
					'většinou se používají jen zvětšující předpony.'
				);
				break;
			case '-':
				text += trans(
					'usually only decreasing prefixes are used.',
					'většinou se používají jen zmenšující předpony.'
				);
				break;
			default:
				text += trans('prefixes are not used.', 'předpony se nepoužívají.');
		}

		// and if you choose the thirty dollar OnlyFuns subscription you get...
		text += unit.onlyUnitfuns
			? trans(
					' Only use in {curly braces}; see tutorial',
					' Použijte pouze ve {složených závorkách}; viz tutoriál'
				)
			: ''; // Silence wench!
	}

	text += unit.note ? ' ' + unit.note[ps.lang] : '';
	return text;
}
