import React from 'react'
import styled from '@emotion/styled'

const Header = styled('div')({
    color: 'red',
})

export class App extends React.Component {
    render() {
        return <Header>Hello Emotion</Header>
    }
}
