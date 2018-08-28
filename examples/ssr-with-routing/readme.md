# SSR with routing example
This example demonstrates Watchtowers integration with `react-router`. On the server Watchtower will setup React Router with a static router using the current express URL.

It also will use the react router context to return the correct status code, meaning it supports redirects. The example also demonstrates how to use other status codes, for example navigating to `localhost:3000/teapot` will return a status code of 418, I'm a Teapot from the server.

## Client note
While Watchtower sets up React Router on the server, you need to wrap your client app in a BrowserRouter for client side routing to work correctly.
