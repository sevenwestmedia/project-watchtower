import { Reducer, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

export interface AppState {
    loading: boolean
    failed: boolean
    myData?: string
}

export type LoadDataStart = Action<'load-data-start'>
export type LoadDataFailed = Action<'load-data-failed'>
export interface LoadDataComplete extends Action<'load-data-complete'> {
    payload: string
}

export type Actions = LoadDataStart | LoadDataComplete | LoadDataFailed

const defaultState: AppState = { loading: false, failed: false }

export const loadData: ThunkAction<any, AppState, any, Actions> = async dispatch => {
    dispatch({
        type: 'load-data-start',
    })

    // Fake loading of data
    const data = await new Promise<string>(resolve =>
        setTimeout(() => resolve('Loaded data!'), 5000),
    )

    dispatch({
        type: 'load-data-complete',
        payload: data,
    })
}

const reducer: Reducer<AppState, Actions> = (state = defaultState, action) => {
    switch (action.type) {
        case 'load-data-start':
            return {
                ...state,
                loading: true,
                failed: false,
                myData: undefined,
            }
        case 'load-data-failed':
            return {
                ...state,
                loading: false,
                failed: true,
            }
        case 'load-data-complete':
            return {
                ...state,
                loading: false,
                failed: false,
                myData: action.payload,
            }
    }

    return state
}

export default reducer
