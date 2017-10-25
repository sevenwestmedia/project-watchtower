# CHANGELOG

## [v0.10.0] - 25/10/2017
- `./create-middleware.ts`
  - Deprecate SuccessServerRenderResult, PageNotFoundRenderResult and their union type ResultType in favor of single `StatusServerRenderResult`
- `./full-render.ts`
      - 
- `./router-context-handler.ts`
  - refactor `success` to take an object with a new status parameter
  - rename `success` -> `createResponse`
  - deprecate `notFound` and add status to success arg.
  - rework default export to named export `routerContextHandler`