import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Logger } from '../../util/log'
import { PageLifecycle } from '../PageLifecycleProvider/PageLifecycle'
import { PageLifecycleProps } from '../PageLifecycleProvider/withPageLifecycle'

export interface Props {
    pageProperties?: object
}

export class PageAdditionalProps extends React.Component<Props, {}> {
    static displayName = 'PageAdditionalProps'

    static contextTypes = {
        // Seems like context cannot be exported, this is a runtime react thing anyways
        pageLifecycle: PropTypes.object as any,
    }

    context: {
        pageLifecycle: PageLifecycle
        logger: Logger
    }

    constructor(
        props: Props & PageLifecycleProps,
        context: {
            pageLifecycle: PageLifecycle
            logger: Logger
        },
    ) {
        super(props, context)

        context.pageLifecycle.updatePageProps(this.props.pageProperties || {})
    }

    componentWillReceiveProps(nextProps: Props & PageLifecycleProps) {
        this.context.pageLifecycle.updatePageProps(nextProps.pageProperties || {})
    }

    render() {
        return this.props.children ? React.Children.only(this.props.children) : null
    }
}
