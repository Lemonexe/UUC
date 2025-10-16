import { langs } from '../config.js';
import { prefixes } from '../data.js';
import { type Lang } from '../types.js';
import { type UnitIdMapItem, getUnitIdMap } from '../utils.js';

/*
 UTILITY PROCEDURE (side-effectful module), useful for development of UUC itself or consuming applications:
 Find conflicts in parsing a string to unit object = same strings that resolve to different unit objects.
 Not exported through index, though you may still execute it directly, if you wish to know what conflicts to count with :)
 Hard conflicts are unacceptable!!!
 The only known & accepted prefix conflicts are: k gram = kilogram (by design), P ar = pascal (unfortunately).
 Deprecated prefix conflicts are acceptable, and are just FYI.
*/
const scriptOutputLang: Lang = 'en'; // language only to display the console logs
const message = 'Checking unit conflicts';
const line = '-'.repeat(message.length + 4);
console.log(line);
console.log(`| ${message} |`);
console.log(line);
checkUnitConflicts();

function checkUnitConflicts(): void {
	const err = (str: string) => console.log('\x1b[31m%s\x1b[0m', str);
	const warn = (str: string) => console.log('\x1b[33m%s\x1b[0m', str);
	const info = console.log;

	// Get map of all matchable strings (ID, alias or display name), mapping n:1 to unit objects
	const unitIdMap = getUnitIdMap(langs);

	const determineConflict = (u: UnitIdMapItem, i: UnitIdMapItem): void => {
		const uName = u.ref.name[scriptOutputLang];
		const iName = i.ref.name[scriptOutputLang];
		// If multiple matchable strings point to the same original unit object, it's not a conflict. ID may equal display name, that's fine.
		if (u.ref.id === i.ref.id) return;

		// Directly conflicting matchable strings leading to different unit objects, that's the worst that can happen!
		if (u.id === i.id) {
			return err(`CRITICAL! HARD CONFLICT: ${u.id} (${uName}) = ${i.id} (${iName})`);
		}

		// Conflict of a unit with prefix with another unit
		if (i.id.endsWith(u.id)) {
			const maybePrefix = i.id.replace(u.id, ''); // `i` ends with substring `u`. The rest of the `i` is possibly a prefix
			const p = prefixes.find(({ id }) => id === maybePrefix);
			if (!p) return; // no, it's not a prefix of any kind

			if (u.ref.prefix === 'all' || (u.ref.prefix === '+' && p.e > 0) || (u.ref.prefix === '-' && p.e < 0)) {
				warn(`PREFIX CONFLICT: ${p.id}${u.id} (${p.id} ${uName}) = ${i.id} (${iName})`);
			} else {
				info(`deprecated prefix conflict: ${p.id}${u.id} (${p.id} ${uName}) = ${i.id} (${iName})`);
			}
		}
	};

	// two for cycles through unitIdMap, determineConflict is applied to each pair (pair of a unit with itself is excluded)
	for (let u = 0; u < unitIdMap.length; u++) {
		for (let i = 0; i < unitIdMap.length; i++) {
			if (i === u) continue;
			determineConflict(unitIdMap[u], unitIdMap[i]);
		}
	}
}
