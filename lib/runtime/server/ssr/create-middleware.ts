import { Assets } from 'assets-webpack-plugin'
import { Express, Request, RequestHandler } from 'express'
import { renderToString } from 'react-dom/server'
import { HelmetData } from 'react-helmet'
import { Logger } from 'typescript-log'
import URL from 'url'
import { getRuntimeConfig } from '../../config/config'
import { PromiseTracker } from '../../util/promise-tracker'
import { getAssetLocations, getBodyAssets, getHeadAssets } from '../assets'
import { hasLog } from '../middleware/ensure-request-log-middleware'
import {
    PageTags,
    renderPageContents,
    ServerRenderResultType,
    ServerSideRenderOptions,
    StatusServerRenderResult,
    transferState,
} from './'
import { PageTag } from './full-render'

export interface RenderContext<SSRRequestProps = object> {
    /** This holds the app state which needs to be kept between SSR
     * passes. It is essentially a state bag, it could include a redux store,
     * or any other state store which needs to persist between render passes
     */
    ssrRequestProps: SSRRequestProps

    promiseTracker: PromiseTracker
}

export type RenderApp<SSRRequestProps extends object> = (params: {
    log: Logger
    context: RenderContext<SSRRequestProps>
    req: Request
}) => JSX.Element

export interface RenderHtmlParams<SSRRequestProps extends object, RenderResult> {
    head: HelmetData | undefined
    renderResult: RenderResult
    pageTags: PageTags
    context: RenderContext<SSRRequestProps>
    req: Request
}
export type RenderHtml<SSRRequestProps extends object, RenderResult> = (
    params: RenderHtmlParams<SSRRequestProps, RenderResult>,
) => string

export type CreatePageTags<SSRRequestProps> = (options: {
    buildAssets: Assets
    helmetTags: string[]
    stateTransfers: PageTag[]
    renderContext: RenderContext<SSRRequestProps>
}) => PageTags

export interface ServerSideRenderMiddlewareOptions<SSRRequestProps extends object, RenderResult> {
    app: Express & { log: Logger }
    ssrTimeoutMs: number
    setupRequest: (req: Request, promiseTracker: PromiseTracker) => Promise<SSRRequestProps>
    renderApp: RenderApp<SSRRequestProps>
    renderHtml: RenderHtml<SSRRequestProps, RenderResult>
    errorLocation: string
    createPageTags?: CreatePageTags<SSRRequestProps>
    pageNotFoundLocation: string
    renderFn?: (element: React.ReactElement<any>) => RenderResult
}

export const createSsrMiddleware = <SSRRequestProps extends object, RenderResult = string>(
    options: ServerSideRenderMiddlewareOptions<SSRRequestProps, RenderResult>,
): RequestHandler => {
    const runtimeConfig = getRuntimeConfig(options.app.log)
    const buildAssets = getAssetLocations(runtimeConfig)

    return async (req, response, next) => {
        if (!hasLog(req)) {
            // eslint-disable-next-line no-console
            console.error('Skipping SSR middleware due to missing req.log key')
            return next()
        }

        const promiseTracker = new PromiseTracker()
        let appState = await options.setupRequest(req, promiseTracker)
        let renderContext: RenderContext<SSRRequestProps>

        const ssrOptions: ServerSideRenderOptions<RenderResult> = {
            appRender: () => {
                renderContext = {
                    promiseTracker,
                    ssrRequestProps: appState,
                }

                return options.renderApp({
                    context: renderContext,
                    log: req.log,
                    req,
                })
            },
            errorLocation: options.errorLocation,
            events: {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                renderPerformed: () => {},
            },
            log: req.log,
            pageNotFoundLocation: options.pageNotFoundLocation,
            // Not perfect typings, if someone specifies the render result type
            // as something it isn't, that's their own fault
            renderFn: options.renderFn || (renderToString as any),
            resetRequest: async (location: string) => {
                req.url = location
                req.query = URL.parse(req.url, true).query
                appState = await options.setupRequest(req, promiseTracker)
            },
            ssrTimeoutMs: options.ssrTimeoutMs,
        }

        const pageRenderResult = await renderPageContents<SSRRequestProps, RenderResult>(
            appState,
            ssrOptions,
            req.url,
            promiseTracker,
        )

        const createPageMarkup = (
            result: StatusServerRenderResult<SSRRequestProps, RenderResult>,
        ) => {
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
            if (result.renderLocation !== req.originalUrl) {
                stateTransfers.push({
                    tag: transferState('watchtower_hydrate_location', result.renderLocation),
                })
            }

            const pageTags: PageTags = options.createPageTags
                ? options.createPageTags({ buildAssets, helmetTags, stateTransfers, renderContext })
                : {
                      body: [...getBodyAssets(buildAssets)],
                      preBody: [],
                      head: [
                          ...helmetTags.map(tag => ({ tag })),
                          ...getHeadAssets(buildAssets),
                          ...stateTransfers,
                      ],
                  }

            return options.renderHtml({
                context: renderContext,
                head: result.head,
                pageTags,
                renderResult: result.renderedContent,
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
