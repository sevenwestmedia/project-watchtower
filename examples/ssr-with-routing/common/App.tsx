import React from 'react'
import { Route, Switch } from 'react-router'
import { NavLink } from 'react-router-dom'
import './App.scss'
import { Home } from './Home'
import { NotFound } from './NotFound'
import { Teapot } from './Teapot'
import { Topic } from './Topic'

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
            <Route path="/page-not-found" component={NotFound} />
        </Switch>
    </div>
)
