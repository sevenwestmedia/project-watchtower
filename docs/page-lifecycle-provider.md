# PageLifeCycleProvider

The page lifecycle provider introduces a concept of page lifecycles to route changes. The useful scenario is to raise an event when navigations happen (easy using react-router already), then raise another event once all the data has been loaded for that route (much harder).

## Approach
There are two main types of work we want to track

 * Loading data
 * Loading lazy loaded webpack bundles
 * A tracked route is determined by the pathname in React Router, query string params and #'s do not trigger lifecycle updates

## Constraints
We cannot use statics/globals, this has to work on the server and requests must be isolated. This constraint is important because the page lifecycle provider is used by the server side rendering middlewares in watchtower to ensure requests complete once data is loaded.

Because we need to know when a component is fully rendered (so we know when to decide if the page is going to load data or not) all pages need to be wrapped in a `<Page>` component which allows us to raise the events with confidence.

## Usage


## API

### withPageLifecycleEvents
Gives access to the page lifecycle events, this way you can register work with the page lifecycle provider which is not directly under the `PageLifecycleProvider` or the `Page`
