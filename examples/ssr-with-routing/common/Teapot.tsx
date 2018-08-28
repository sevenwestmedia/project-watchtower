import * as React from 'react'
import { RouteStatus } from './RouteStatus'

export const Teapot: React.SFC = () => <RouteStatus statusCode={418}>I'm a Teapot</RouteStatus>
