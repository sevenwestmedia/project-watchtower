import React from 'react'
import { Helmet } from 'react-helmet'

export const Home: React.SFC = () => (
    <div>
        {/* Watchtower has inbuilt support for react-helmet for page metadata */}
        <Helmet title="Home!" />Home
    </div>
)
