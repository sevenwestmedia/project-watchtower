import express from 'express'
import { Logger } from '../../universal'

export const createEnsureRequestLogMiddleware = (log: Logger): express.RequestHandler => {
    return (req, _res, next) => {
        if (!hasLog(req)) {
            ;(req as any).log = log
        }

        return next()
    }
}

export function hasLog(req: express.Request): req is express.Request & { log: Logger } {
    return (req as any).log !== undefined
}
