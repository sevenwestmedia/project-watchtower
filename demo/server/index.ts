import { createServer } from '../../lib/runtime/server'

const createAppServer = () => {
    createServer({
        middlewareHook: _app => {
            // app.get('*', (_req, res) => {
            //     const ssr = renderToString(React.createElement(App))
            //     const content = html(ssr)
            //     res.send(content)
            // })
        },
    })
}

export default createAppServer
