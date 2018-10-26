import React from 'react'
import styled from 'react-emotion'

import './App.scss'

const Header = styled('div')({
    color: 'red',
})

export class App extends React.Component {
    render() {
        return <Header>Hello Emotion</Header>
    }
}
