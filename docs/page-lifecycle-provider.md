# PageLifeCycleProvider
The page lifecycle provider introduces a concept of page lifecycles to route changes. The useful scenario is to raise an event when navigations happen (easy using react-router already), then raise another event once all the data has been loaded for that route (much harder).

**Note** A tracked route is determined by the *pathname* in React Router, query string params and #'s do not trigger lifecycle updates

## Constraints
We cannot use statics/globals, this has to work on the server and requests must be isolated. This constraint is important because the page lifecycle provider is used by the server side rendering middlewares in watchtower to ensure requests complete once data is loaded.

Because we need to know when a component is fully rendered (so we know when to decide if the page is going to load data or not) all pages need to be wrapped in a `<Page>` component which allows us to raise the events with confidence.

## Usage
PageLifecycleProvider has two components, the `PageLifecycleProvider` and the `Page`. The React-Router Router must be above it.

``` ts
const App: React.SFC<{}> = () => (
    <BrowserRouter>
        {/* PageLifecycleProvider relies on withRouter() from react-router */}
        <PageLifecycleProvider onEvent={(event) => { console.log(event) }}
            <Main />
        </PageLifecycleProvider>
    </BrowserRouter>
)
```

Then every route needs to be wrapped in a `Page`, for example:

``` ts
const Route1: React.SFC<{}> = () => (
    <Page
        render={<Route1Component />}
    />
)
const Route2: React.SFC<{}> = () => (
    <Page
        render={<Route2Component />}
    />
)

<Route path='/route1' component={Route1}/>
<Route path='/route2' component={Route2}/>
<Route
    render={(props) => {
        <Page
            render={(
                <YourPage path={props.location.pathname} />
            )}
        />
    }}
/>
```

## API

### PageEvents
Page events are:

``` ts
export interface PageLoadStarted {
    type: 'page-load-started'
    timeStamp: number
    originator: string
    payload: {
        [key: string]: any
    }
}

export interface PageLoadFailed {
    type: 'page-load-failed'
    timeStamp: number
    originator: string
    payload: {
        error: string
        [key: string]: any
    }
}

export interface PageLoadComplete {
    type: 'page-load-complete'
    timeStamp: number
    originator: string
    payload: {
        [key: string]: any
    }
}
```

### withPageLifecycleEvents
Gives access to the page lifecycle events, this way you can register work with the page lifecycle provider which is not directly under the `PageLifecycleProvider` or the `Page`
