import { createNodeServer } from 'lib/runtime/node-server'
import { consoleLogger } from 'typescript-log'

const log = consoleLogger()

createNodeServer({
    log,
    middlewareHook: app => {
        app.get('/', (_req, res) => {
            res.send('The magic is real')
        })

        app.get('/another', (_req, res) => {
            res.send('another endpoint')
        })
    },
})
