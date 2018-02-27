import * as React from 'react'
import { renderToString } from 'react-dom/server'

import { createServer, getCssAssetHtml, getJsAssetHtml } from '../../lib/runtime/server'

import App from '../common/App'

const html = (ssr: string) =>
    `<!DOCTYPE html>
<html>
<head>
    <title>Demo Server</title>
    ${getCssAssetHtml()}
</head>
<body>
    <div id="app-root">${ssr}</div>
    ${getJsAssetHtml()}
</body>
</html>`

const createAppServer = () => {
    createServer({
        middlewareHook: app => {
            app.get('*', (_req, res) => {
                const ssr = renderToString(React.createElement(App))
                const content = html(ssr)
                res.send(content)
            })
        },
    })
}

export default createAppServer
