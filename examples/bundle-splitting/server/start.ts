import path from 'path'
import { consoleLogger } from 'typescript-log'
import { createServer, getRuntimeConfig, getHeadAssets } from '../../../lib/runtime/server'
import { createSsrMiddleware } from '../../../lib/runtime/server/ssr'
import { renderHtml } from '../../../lib/runtime/server/ssr/helpers/render-html'
import { renderApp } from './render-app'
import { ChunkExtractor } from '@loadable/server'

const log = consoleLogger()

createServer({
    log,
    middlewareHook: app => {
        // To enable SSR simply register the SSR middleware as the default
        // express handler.
        const ssrMiddleware = createSsrMiddleware<{ extractor: ChunkExtractor }>({
            app,
            errorLocation: '/error',
            pageNotFoundLocation: '/page-not-found',
            renderApp: ({ log, context }) => {
                const loadableManifest = path.join(
                    getRuntimeConfig(log).BASE,
                    'loadable-stats.json',
                )
                context.ssrRequestProps.extractor = new ChunkExtractor({
                    statsFile: loadableManifest,
                })

                return context.ssrRequestProps.extractor.collectChunks(renderApp())
            },
            createPageTags: ({ renderContext, helmetTags, buildAssets, stateTransfers }) => {
                const tags = renderContext.ssrRequestProps.extractor.getScriptTags()

                return {
                    head: [
                        ...helmetTags.map(tag => ({ tag })),
                        ...getHeadAssets(buildAssets),
                        ...stateTransfers,
                    ],
                    body: [{ tag: tags }],
                    preBody: [],
                }
            },
            renderHtml,
            setupRequest: async () => {
                // Extractor setup in render fn
                return { extractor: undefined as any }
            },
            ssrTimeoutMs: 1000,
        })

        app.get('*', ssrMiddleware)
    },
})
