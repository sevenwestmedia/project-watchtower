import * as React from 'react'
import { PageLifecycle } from '../PageLifecycleProvider/PageLifecycleProvider'
import { Logger } from 'pino'

export interface State { error: boolean }
export interface Props {
    errorComponent: React.ReactType
}

export class Page extends React.Component<Props, State> {
    static contextTypes = {
        // Seems like context cannot be exported, this is a runtime react thing anyways
        pageLifecycle: React.PropTypes.object as any,
    }

    state: State = { error: false }

    context: {
        pageLifecycle: PageLifecycle,
        logger: Logger,
    }

    // This is using React error boundaries which were added in v15
    // v16 may add official support
    // Info at:
    // tslint:disable-next-line:max-line-length
    // https://github.com/facebook/react/blob/15-stable/src/renderers/shared/stack/reconciler/tests/ReactErrorBoundaries-test.js
    // https://github.com/facebook/react/issues/2461
    // TODO Move to stable error boundaries API
    unstable_handleError(e: Error) {
        e.message = 'Render error: ' + e.message
        this.context.logger.error({ err: e })
        this.setState({ error: true })
    }

    componentDidMount() {
        this.context.pageLifecycle.pageRenderComplete()
        this.context.pageLifecycle.onRouteChanged(this.routeChanged)
    }

    componentWillUnmount() {
        this.context.pageLifecycle.offRouteChanged(this.routeChanged)
    }

    routeChanged = () => {
        if (this.state.error) {
            this.setState({ error: false })
        }
    }

    componentDidUpdate() {
        this.context.pageLifecycle.pageRenderComplete()
    }

    render() {
        if (this.state.error) {
            return (
                <div className="js-page-contents">
                    <this.props.errorComponent />
                </div>
            )
        }

        return (
            <div className="js-page-contents">
                {this.props.children}
            </div>
        )
    }
}
