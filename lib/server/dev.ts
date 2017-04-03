import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import * as opn from 'opn'
import { addAssetsToHtml } from './assets'
import { getWebpackConfig } from '../build/build'
import { logError } from '../__util/log'
import CONFIG from '../config/config'

const { PUBLIC_PATH, SERVER_PUBLIC_DIR } = CONFIG
const noop: express.RequestHandler = (_res, _req, next) => next()

export type HotReloadMiddleware = () => express.RequestHandler[]

export const getHotReloadMiddleware: HotReloadMiddleware = () => {
    const config = getWebpackConfig('client', 'dev')
    const compiler = webpack(config)

    const dev = webpackDevMiddleware(
        compiler,
        {
            publicPath: PUBLIC_PATH,
            noInfo: true,
            stats: 'minimal',
            watchOptions: {
                ignored: /node_modules/,
            },
        },
    )

    const hot = webpackHotMiddleware(compiler, {
        noInfo: true,
    })

    return [
        dev,
        hot,
    ]
}

export const getDefaultHtmlMiddleware = () => {
    let indexContent: string

    if (SERVER_PUBLIC_DIR) {
        try {
            const indexPath = path.resolve(SERVER_PUBLIC_DIR, 'index.html')
            indexContent = fs.readFileSync(indexPath, 'utf8')
        } catch (e) {
            logError('Reading index.html failed!', e)
            return noop
        }
    }

    const middleware: express.RequestHandler = (_req, res) => {
        const indexWithAssets = addAssetsToHtml(indexContent)
        res
            .status(200)
            .contentType('text/html')
            .send(indexWithAssets)
    }

    return middleware
}

export const openBrowser = (port?: number) => {
    const usePort = port || process.env.PORT || 3000
    opn(`http://localhost:${usePort}`)
}
