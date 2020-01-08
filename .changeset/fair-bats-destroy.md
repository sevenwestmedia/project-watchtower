---
'project-watchtower': major
---

Switched to react-helmet-async for page metadata which does not give lifecycle warnings in React 16+.

If you use `WatchtowerBrowserRouter` you just need to update your imports from `react-helmet` to `react-helmet-async` and you are done. Otherwise you will need to wrap your client application in a `<HelmetProvider>`.
