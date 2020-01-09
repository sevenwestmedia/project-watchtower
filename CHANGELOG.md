# project-watchtower

## 2.0.0-beta.6

### Major Changes

-   Add ADDITIONAL_CIENT_ENTRIES config for multiple entry points

## 2.0.0-beta.5

### Major Changes

-   3aa3ace: Switched to react-helmet-async for page metadata which does not give lifecycle warnings in React 16+.

    If you use `WatchtowerBrowserRouter` you just need to update your imports from `react-helmet` to `react-helmet-async` and you are done. Otherwise you will need to wrap your client application in a `<HelmetProvider>`.

## 2.0.0-beta.3

### Minor Changes

-   4ec1a6d: Allow babel config to be specified separately for client and server

## 2.0.0-beta.2

### Patch Changes

-   Add caching back in

## 2.0.0-beta.1

### Patch Changes

-   ba3621d: Set file-loader back to esModule false after default changed

## 2.0.0-beta.0

### Major Changes

-   d66e787: Remove stats function from project watchtower, lighthouse CI is a better option now
-   d66e787: Removed cache loader and enabled TypeScript projects and incremental compilation instead

### Minor Changes

-   d66e787: Enable babel for TypeScript build
