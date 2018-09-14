import { Request, RequestHandler, Express } from 'express'
import {
    ServerSideRenderOptions,
    StatusServerRenderResult,
    renderPageContents,
    PageTags,
    RenderMarkup,
    ServerRenderResultType,
    transferState,
} from './'
import { Logger } from '../../universal'
import { HelmetData } from 'react-helmet'
import { hasLog } from '../middleware/ensure-request-log-middleware'
import { getRuntimeConfig } from '../../config/config'
import { PromiseTracker } from '../../util/promise-tracker'
import { getAssetLocations, getHeadAssets, getBodyAssets } from '../assets'
import { Assets } from 'assets-webpack-plugin'
import { PageTag } from './full-render'

export interface RenderContext<SSRRequestProps = object> {
    /** This holds the app state which needs to be kept between SSR
     * passes. It is essentially a state bag, it could include a redux store,
     * or any other state store which needs to persist between render passes
     */
    ssrRequestProps: SSRRequestProps

    promiseTracker: PromiseTracker
}

export type RenderApp<SSRRequestProps extends object> = (
    params: {
        log: Logger
        context: RenderContext<SSRRequestProps>
        req: Request
    },
) => JSX.Element

export type RenderHtmlParams<SSRRequestProps extends object> = {
    head: HelmetData | undefined
    renderMarkup: RenderMarkup
    pageTags: PageTags
    context: RenderContext<SSRRequestProps>
    req: Request
}
export type RenderHtml<SSRRequestProps extends object> = (
    params: RenderHtmlParams<SSRRequestProps>,
) => string

export type CreatePageTags<SSRRequestProps> = (
    options: {
        buildAssets: Assets
        helmetTags: string[]
        renderContext: RenderContext<SSRRequestProps>
    },
) => PageTags

export type ServerSideRenderMiddlewareOptions<SSRRequestProps extends object> = {
    app: Express & { log: Logger }
    ssrTimeoutMs: number
    setupRequest: (req: Request, promiseTracker: PromiseTracker) => Promise<SSRRequestProps>
    renderApp: RenderApp<SSRRequestProps>
    renderHtml: RenderHtml<SSRRequestProps>
    errorLocation: string
    createPageTags?: CreatePageTags<SSRRequestProps>
    pageNotFoundLocation: string
}

export const createSsrMiddleware = <SSRRequestProps extends object>(
    options: ServerSideRenderMiddlewareOptions<SSRRequestProps>,
): RequestHandler => {
    const runtimeConfig = getRuntimeConfig(options.app.log)
    const buildAssets = getAssetLocations(runtimeConfig)

    return async (req, response, next) => {
        if (!hasLog(req)) {
            console.error('Skipping SSR middleware due to missing req.log key')
            return next()
        }

        const promiseTracker = new PromiseTracker()
        const appState = await options.setupRequest(req, promiseTracker)
        let renderContext: RenderContext<SSRRequestProps>

        const ssrOptions: ServerSideRenderOptions = {
            log: req.log,
            errorLocation: options.errorLocation,
            pageNotFoundLocation: options.pageNotFoundLocation,
            ssrTimeoutMs: options.ssrTimeoutMs,
            appRender: () => {
                renderContext = {
                    ssrRequestProps: appState,
                    promiseTracker,
                }

                return options.renderApp({
                    log: req.log,
                    context: renderContext,
                    req,
                })
            },
            events: {
                renderPerformed: () => {},
            },
        }

        const pageRenderResult = await renderPageContents<SSRRequestProps>(
            appState,
            ssrOptions,
            req.url,
            promiseTracker,
        )

        const createPageMarkup = (result: StatusServerRenderResult<SSRRequestProps>) => {
            const helmetTags: string[] = []
            if (result.head && result.head.title) {
                helmetTags.push(result.head.title.toString())
            }
            if (result.head && result.head.base) {
                helmetTags.push(result.head.base.toString())
            }
            if (result.head && result.head.script) {
                helmetTags.push(result.head.script.toString())
            }
            if (result.head && result.head.meta) {
                helmetTags.push(result.head.meta.toString())
            }
            if (result.head && result.head.link) {
                helmetTags.push(result.head.link.toString())
            }

            const stateTransfers: PageTag[] = []
            // When watchtower renders an error, the client needs to know
            // so it can hydrate the error location. The WatchtowerBrowserRouter takes
            // care of this
            if (result.renderLocation !== req.url) {
                stateTransfers.push({
                    tag: transferState('watchtower_hydrate_location', result.renderLocation),
                })
            }

            const pageTags: PageTags = {
                head: [
                    ...helmetTags.map(tag => ({ tag })),
                    ...getHeadAssets(buildAssets),
                    ...stateTransfers,
                ],
                body: [...getBodyAssets(buildAssets)],
            }

            return options.renderHtml({
                head: result.head,
                renderMarkup: result.renderedContent,
                pageTags,
                context: renderContext,
                req,
            })
        }

        switch (pageRenderResult.type) {
            case ServerRenderResultType.Success:
                response
                    .status(pageRenderResult.statusCode)
                    .header('Content-Type', 'text/html')
                    .send(createPageMarkup(pageRenderResult))
                return
            case ServerRenderResultType.Redirect:
                response.redirect(
                    pageRenderResult.isPermanent ? 301 : 302,
                    pageRenderResult.redirectTo,
                )
                return
            case ServerRenderResultType.Failure:
            default:
                // tslint:disable-line:no-switch-case-fall-through
                response.status(500).send()
        }
    }
}
