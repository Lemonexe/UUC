import { describe, expect, it } from 'vitest';
import { type ParsedLocationHash, parseLocationHash } from '../locationHash';

const resDefault: ParsedLocationHash = { input: '3 kPa', target: 'torr', formatParams: { spec: 'none' }, messages: [] };

describe(parseLocationHash.name, () => {
	it('parse simple location hash', () => {
		expect(parseLocationHash('#!#3 kPa to torr')).toEqual(resDefault);
	});

	it('parse simple URIEncoded location hash', () => {
		expect(parseLocationHash('#!#3%20kPa%20to%20torr')).toEqual(resDefault);
	});

	it('parse complex location hash', () => {
		expect(parseLocationHash('#!#3·%7B3°C%7D%2F(1e-1)%5E2*_g')).toEqual({
			...resDefault,
			input: '3·{3°C}/(1e-1)^2*_g',
			target: '',
		});
	});

	it('parse location hash with format params', () => {
		expect(parseLocationHash('#!#_G&fixed,3')).toEqual({
			input: '_G',
			target: '',
			formatParams: { spec: 'fixed', fixed: 3, exp: false },
			messages: [],
		});
		expect(parseLocationHash('#!#_G&digits,2,exp')).toEqual({
			input: '_G',
			target: '',
			formatParams: { spec: 'digits', digits: 2, exp: true },
			messages: [],
		});
	});

	it('warnings', () => {
		const msgs1 = parseLocationHash('2m to cm > ft').messages;
		expect(msgs1.length).toBe(1);
		expect(msgs1[0].code).toBe('WARN_separators');

		const msgs2 = parseLocationHash('#!#_pi into 1 &auto,2.1').messages;
		expect(msgs2.length).toBe(1);
		expect(msgs2[0].code).toBe('WARN_format_params');
	});
});
