# Simple SSR Example
In this example, we use server configuration for the greeting which is displayed by our app.

The config is specified by an environmental variable on the server, and that config has to be transferred to the client so it can render the same value as the server.

1) GREETING is defined in .env, or as an environmental variable when running in production
2) In server/start.ts, setupRequest is used to create the request state
    - This is because in a real scenario, config could change on each request, or more likely;
    - The server side render can load data, which will be put onto this state bag
3) In `renderHtml.tsx` the following is interpolated into the rendered html string: `${transferState('STATE', context.additionalState)}`
4) The client can now retreive this data by using `const state = getTransferredState<AppState>('STATE')`
5) The client side render can use this state
