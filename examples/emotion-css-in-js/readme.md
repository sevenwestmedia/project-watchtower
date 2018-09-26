# Emotion CSS in JS example
Watchtower has a hook to override the render function used on the server.

When creating the SSR middleware, you can add the config key:

``` ts
import { renderStylesToString } from 'emotion-server'
import { renderToString } from 'react-dom/server'

const ssrMiddleware = createSsrMiddleware<SSRState>({
    ...

    renderFn: (element: React.ReactElement<any>) =>
        renderStylesToString(renderToString(element)),
})
```

The above uses emotions renderStylesToString to inject the styles into the rendered html, which will be automatically hydrated.

If you were to use `extractCritical` instead, the `createSsrMiddleware` function has a second generic parameter which you can use to change the expected type of the render function to an object containing `{ ids, css, html }` which can then be used in the render html function in a typesafe way. This example uses the simpler `renderStylesToString` function which still returns a string, making it compatible with the renderToString function react provides.

## Setup
1. Make sure you run `yarn` in this folder first to install it's dependencies
