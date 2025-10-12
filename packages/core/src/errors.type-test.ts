import { err, type UUCError } from './errors.js';

let e: UUCError;

// STRING MESSAGE, NO EXTRA ARGS
e = err('ERR_brackets_empty');
// @ts-expect-error
e = err('ERR_brackets_empty', 'foo');

// MESSAGE WITH ONE STRING ARG
e = err('ERR_unknown_unitfun', 'foo');
// @ts-expect-error
e = err('ERR_unknown_unitfun', '(', '}');
// @ts-expect-error
e = err('ERR_unknown_unitfun', ['m', 's']);
// @ts-expect-error
e = err('ERR_unknown_unitfun');

// MESSAGE WITH ONE ARRAY ARG
e = err('WARN_target_dim_mismatch', ['m', 's']);
// @ts-expect-error
e = err('WARN_target_dim_mismatch', '(', '}');
// @ts-expect-error
e = err('WARN_target_dim_mismatch', 'foo');
// @ts-expect-error
e = err('WARN_target_dim_mismatch');

// MESSAGE WITH EXACTLY TWO ARGS
e = err('ERR_brackets_mismatch', '(', '}');
// @ts-expect-error
e = err('ERR_brackets_mismatch', '(', '}', ']');
// @ts-expect-error
e = err('ERR_brackets_mismatch');
// @ts-expect-error
e = err('ERR_brackets_mismatch', '(');

// @ts-expect-error (unused variable)
let _e = e;
