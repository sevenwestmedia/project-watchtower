import * as React from 'react'
import { Helmet } from 'react-helmet'
import { RouteComponentProps, Redirect } from 'react-router'

export const Topic: React.SFC<RouteComponentProps<{ topic: string }>> = props => {
    // Watchtower will handle status codes properly
    if (props.match.params.topic === 'tv') {
        return <Redirect to="/topic/television" />
    }

    return (
        <div>
            <Helmet title={props.match.params.topic} />
            Topic: {props.match.params.topic}
        </div>
    )
}
