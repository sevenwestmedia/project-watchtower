# TODO

## Upgrade to tslint >=5.1.0

Currently rolled back to 4.5.1 because 5.0.0 is unusable

*   Breaking changes: Need to add `--type-check --project ./tsconfig.json`
    *   in `package.json`
    *   in `lib/lint/tslint.ts`

*   bug in 5.0.0 throws false positives for using `undefined`: https://github.com/palantir/tslint/issues/2434
*   tslint 5.0.0 changed behaviour for multiple rules, we have to decide what to do (change code or change config):

```
(jsx-boolean-value) Value must be set for boolean attributes
(prefer-const) Identifier 'dataLayer' is never reassigned; use 'const' instead of 'var'.
(trailing-comma) Missing trailing comma
(jsx-no-lambda) Lambdas are forbidden in JSX attributes due to their rendering performance impact
```
