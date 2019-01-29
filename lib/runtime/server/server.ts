import express from 'express'
import { getRuntimeConfig } from '../config/config'
import { createCustomServer, CreateServerOptions } from './custom-server'
import { getDefaultHtmlMiddleware } from './middleware/default-html-middleware'
export { getDefaultHtmlMiddleware }

// if the server does not use server-side rendering, just respond with index.html
// for each request not handled in other middlewares

export const createServer = (options: CreateServerOptions): express.Express =>
    createCustomServer({
        ...options,
        defaultHtmlMiddlewareHook: app => {
            const { log } = options
            const config = getRuntimeConfig(log)
            app.get('*', getDefaultHtmlMiddleware(log, config))
        },
    })
