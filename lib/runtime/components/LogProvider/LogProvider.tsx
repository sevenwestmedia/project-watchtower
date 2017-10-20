import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Logger } from '../../util/log'

/**
 * Makes the provider logger available through context.logger
 */
export function addLog<T extends React.ComponentClass<any>>(component: T): T {
    ;(component as any).contextTypes = {
        logger: PropTypes.any,
        ...component.contextTypes
    }
    return component
}

export interface LoggerProps {
    logger: Logger
}

export class LogProvider extends React.Component<LoggerProps, {}> {
    static childContextTypes = {
        logger: PropTypes.any
    }

    getChildContext() {
        const { logger } = this.props

        return { logger }
    }
    render() {
        return React.Children.only(this.props.children)
    }
}
