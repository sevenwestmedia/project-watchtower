import * as express from 'express'
import { addAssetsToHtml } from 'project-watchtower/lib/server/assets'
import { getHotReloadMiddleware, openBrowser } from 'project-watchtower/lib/server/dev'

const port = process.env.PORT || 3000
const isProduction = process.env.NODE_ENV === 'production'
const watchMode = process.env.START_WATCH_MODE === 'true'

const createServer = () => {
    const app = express()

    if (!isProduction && watchMode) {
        app.use(getHotReloadMiddleware())
    }

    app.use(express.static('public', {
        index: false,
    }))

    app.get('*', (_req, res) => {
        const content = addAssetsToHtml(`<!DOCTYPE html>
    <html>
    <head>
        <title>Demo Server</title>
    </head>
    <body>
        <div id="app-root"></div>
    </body>
    </html>`)

        res.send(content)
    })

    app.listen(port, () => {
        // tslint:disable-next-line no-console
        console.log(`Server listening on port ${port}`)
        if (!production) {
            openBrowser(port)
        }
    })
}

export default createServer
