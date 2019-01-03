import { Action, ActionCreator, Reducer } from 'redux'
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

export const loadData: ActionCreator<
    ThunkAction<void, AppState, null, Actions>
> = () => async dispatch => {
    dispatch({
        type: 'load-data-start',
    })

    // Fake loading of data
    const data = await new Promise<string>(resolve =>
        setTimeout(() => resolve('Loaded data!'), 500),
    )

    dispatch({
        payload: data,
        type: 'load-data-complete',
    })
}

const reducer: Reducer<AppState, Actions> = (state = defaultState, action) => {
    switch (action.type) {
        case 'load-data-start':
            return {
                ...state,
                failed: false,
                loading: true,
                myData: undefined,
            }
        case 'load-data-failed':
            return {
                ...state,
                failed: true,
                loading: false,
            }
        case 'load-data-complete':
            return {
                ...state,
                failed: false,
                loading: false,
                myData: action.payload,
            }
    }

    return state
}

export default reducer
