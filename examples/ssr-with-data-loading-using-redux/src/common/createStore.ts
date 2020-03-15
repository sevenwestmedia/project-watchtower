import { applyMiddleware, createStore, Middleware } from 'redux'

import thunk from 'redux-thunk'
import rootReducer, { AppState } from './App.redux'

export default (state?: AppState, middlewares: Middleware[] = []) => {
    if (state) {
        return createStore(rootReducer, state, applyMiddleware(...middlewares, thunk))
    }

    return createStore(rootReducer, applyMiddleware(...middlewares, thunk))
}
