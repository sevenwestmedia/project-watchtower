import * as React from 'react'
import './App.scss'
import { Switch, Route } from 'react-router'
import { Home } from './Home'
import { NavLink } from 'react-router-dom'
import { Topic } from './Topic'
import { Teapot } from './Teapot'

export const App: React.SFC = () => (
    <div>
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/topic/sport">Sport</NavLink>
            <NavLink to="/topic/entertainment">Entertainment</NavLink>
            <NavLink to="/topic/tv">Television</NavLink>
        </nav>
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/topic/:topic" component={Topic} />
            <Route path="/teapot" component={Teapot} />
        </Switch>
    </div>
)
