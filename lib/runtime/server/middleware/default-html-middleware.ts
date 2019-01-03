import express from 'express'
import fs from 'fs'
import path from 'path'
import { Logger } from 'typescript-log'
import { RuntimeConfig } from '../../../'
import { getAssets, getBodyAssets, getHeadAssets } from '../assets'
import { PromiseTracker } from '../ssr/full-render'
import { renderHtml } from '../ssr/helpers/render-html'

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
                context: {
                    promiseTracker: new PromiseTracker(),
                    ssrRequestProps: {},
                },
                head: undefined,
                pageTags: {
                    body: getBodyAssets(buildAssets),
                    head: getHeadAssets(buildAssets),
                },
                renderResult: '',
                req,
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
