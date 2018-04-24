import * as React from 'react'
import * as PropTypes from 'prop-types'

import { LoggerProps } from '../../universal'

export function addLog<T>(
    Component: React.ComponentType<T & LoggerProps>,
): React.ComponentClass<T> {
    return class WithLog extends React.Component<T> {
        static contextTypes = {
            logger: PropTypes.object,
        }

        render() {
            return <Component {...this.props} logger={this.context.logger} />
        }
    }
}
