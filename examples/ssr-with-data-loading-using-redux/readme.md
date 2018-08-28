# SSR with data loading using redux Example
In this example, we emulate needing to load data and store it in redux, then transfer it to the client.

1. In `setupRequest` the redux store is created using the `promiseTracker.middleware()`.  
This middleware will automatically track promises returned from thunks or any other middleware/action creator.
2. Watchtower will wait until the tracked promises are completed, then will re-render to ensure no more fetches are issued. It does this recursively to support data loading as deeper components are rendered.
3. `transferState('STATE', context.ssrRequestProps.store.getState())` serialises the redux store state into the server response
4. The client uses `getTransferredState<AppState>('STATE')` to hydrate the redux state and initialise the store with that initial state

## Setup
1. Make sure you run `yarn` in this folder first to install it's dependencies
