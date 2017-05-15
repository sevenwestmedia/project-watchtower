/**
 * For testing only
 */

import * as express from 'express'

const port = parseInt(process.env.PORT || 3000, 10)

const app = express()

app.get('*', (_req, res) => {
    res.status(200).send(`
        hello world hello world hello world hello world hello world hello world hello world
        hello world hello world hello world hello world hello world hello world hello world
        hello world hello world hello world hello world hello world hello world hello world
    `)
})

app.listen(port)
