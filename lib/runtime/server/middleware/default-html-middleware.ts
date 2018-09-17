import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import { RuntimeConfig } from '../../../'
import { Logger } from '../../universal'
import { renderHtml } from '../ssr/helpers/render-html'
import { getHeadAssets, getAssets, getBodyAssets } from '../assets'
import { PromiseTracker } from '../ssr/full-render'

const isProduction = process.env.NODE_ENV === 'production'

export const expressNoop: express.RequestHandler = (_res, _req, next) => next()

export const getDefaultHtmlMiddleware = (log: Logger, runtimeConfig: RuntimeConfig) => {
    // on production we just serve the generated index.html
    if (isProduction) {
        const indexPath = path.resolve(runtimeConfig.BASE, 'index.html')
        const indexFileMissing = !fs.existsSync(indexPath)
        let loggedMissingIndexFileError = false
        const productionMiddleware: express.RequestHandler = (_req, res) => {
            // We only log the error if we hit this middleware
            // if the consumer has registered their own SSR middleware we will
            // never use this, so no need to log an error
            if (indexFileMissing) {
                if (!loggedMissingIndexFileError) {
                    log.error(
                        'Cannot find index.html file to serve, default watchtower middleware will return 404',
                    )
                    loggedMissingIndexFileError = true
                }
                return res.status(404)
            }
            return res.status(200).sendFile(indexPath)
        }
        return productionMiddleware
    }

    // for development we grab the source index.html and add the assets
    let indexContent: string | undefined
    let missingIndexErrorLogged: boolean = false

    if (runtimeConfig.SERVER_PUBLIC_DIR) {
        const indexPath = path.resolve(runtimeConfig.SERVER_PUBLIC_DIR, 'index.html')
        if (fs.existsSync(indexPath)) {
            indexContent = fs.readFileSync(indexPath, 'utf8')
        }
    }

    const middleware: express.RequestHandler = (req, res) => {
        if (indexContent) {
            const buildAssets = getAssets(runtimeConfig)
            const indexWithAssets = renderHtml({
                head: undefined,
                context: {
                    ssrRequestProps: {},
                    promiseTracker: new PromiseTracker(),
                },
                req,
                renderMarkup: {
                    css: '',
                    html: '',
                    ids: [],
                },
                pageTags: {
                    head: getHeadAssets(buildAssets),
                    body: getBodyAssets(buildAssets),
                },
            })

            return res
                .status(200)
                .contentType('text/html')
                .send(indexWithAssets)
        }

        if (!missingIndexErrorLogged) {
            log.error(
                `Watchtower default middleware requires a html template at ${
                    runtimeConfig.SERVER_PUBLIC_DIR
                }/index.html to add the JS/CSS assets to and serve`,
            )
            missingIndexErrorLogged = true
        }

        return res.status(404).send()
    }

    return middleware
}
