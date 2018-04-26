import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Logger } from '../../util/log'

export interface LoggerProps {
    logger: Logger
}

export class LogProvider extends React.Component<LoggerProps, {}> {
    static displayName = 'LogProvider'

    static childContextTypes = {
        logger: PropTypes.object,
    }

    getChildContext() {
        const { logger } = this.props

        return { logger }
    }

    render() {
        return this.props.children ? React.Children.only(this.props.children) : null
    }
}
