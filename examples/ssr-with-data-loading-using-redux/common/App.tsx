import * as React from 'react'
import { connect } from 'react-redux'
import { AppState } from './App.redux'

import './App.scss'

export type Props = AppState

export const App = connect((state: AppState) => state)(
    class extends React.Component<Props> {
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
