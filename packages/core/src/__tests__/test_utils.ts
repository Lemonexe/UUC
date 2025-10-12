import { expect } from 'vitest';
import { type ErrorCode, UUCError } from '../errors.js';

// Are numbers approximately equal within tolerance?
export const isEqApx = (arg1: number, arg2: number, tol: number): boolean => Math.abs(arg1 - arg2) < tol;

// Own function to test if a function throws a UUCError with specific error code.
// vitest expect().toThrowError() works, but needs an exact error message match, which is cumbersome here.
// mocking the message with expect.any(String) unfortunately does not work in toThrowError!
export const expectToBeErrorCode = (fn: () => any, code: ErrorCode) => {
	try {
		fn();
	} catch (e) {
		expect(e).toBeInstanceOf(UUCError);
		expect((e as UUCError).code).toBe(code);
		return;
	}
	expect('OK').toBe(code);
};
