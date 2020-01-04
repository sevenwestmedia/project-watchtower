import React from 'react'
import { connect } from 'react-redux'
import { Actions, AppState, loadData } from './App.redux'

import { ThunkDispatch } from 'redux-thunk'

export type Props = AppState & { dispatch: ThunkDispatch<AppState, null, Actions> }

export const App = connect((state: AppState) => state)(
    class extends React.Component<Props> {
        componentWillMount() {
            if (!this.props.myData) {
                this.props.dispatch(loadData())
            }
        }
        render() {
            if (this.props.loading) {
                return <h1>Loading...</h1>
            }

            if (this.props.failed) {
                return <h1>Data load failed</h1>
            }

            return <h1>{this.props.myData}</h1>
        }
    },
)
