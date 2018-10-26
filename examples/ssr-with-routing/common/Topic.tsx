import React from 'react'
import { Helmet } from 'react-helmet'
import { RouteComponentProps, Redirect } from 'react-router'
import { Status404Error } from '../../../lib/runtime/server/ssr/errors'

export const Topic: React.SFC<RouteComponentProps<{ topic: string }>> = props => {
    // Watchtower will handle status codes properly
    if (props.match.params.topic === 'tv') {
        return <Redirect to="/topic/television" />
    }

    // Just an example to show 404
    if (props.match.params.topic === 'missing') {
        throw new Status404Error()
    }

    return (
        <div>
            <Helmet title={props.match.params.topic} />
            Topic: {props.match.params.topic}
        </div>
    )
}
