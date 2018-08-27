import { createStore, applyMiddleware, Middleware } from 'redux'

import thunk from 'redux-thunk'
import rootReducer, { AppState } from './App.redux'

export default (state?: AppState, middlewares: Middleware[] = []) => {
    if (state) {
        return createStore(rootReducer, state, applyMiddleware(thunk, ...middlewares))
    }

    return createStore(rootReducer, applyMiddleware(thunk, ...middlewares))
}
