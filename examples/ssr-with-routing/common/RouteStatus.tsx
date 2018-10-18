import React from 'react'
import { Route } from 'react-router-dom'

export interface Props {
    statusCode: number
}

export const RouteStatus: React.SFC<Props> = props => (
    <Route
        render={({ staticContext }: any) => {
            if (staticContext) {
                staticContext.statusCode = props.statusCode
            }

            return props.children
        }}
    />
)
