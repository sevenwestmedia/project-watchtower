import express from 'express'
import { createCustomServer, CreateServerOptions } from './custom-server'

export const createNodeServer = (options: CreateServerOptions): express.Express =>
    createCustomServer({ ...options, nodeOnlyServer: true })
