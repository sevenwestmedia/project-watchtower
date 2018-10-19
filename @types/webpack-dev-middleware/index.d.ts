declare module 'webpack-dev-middleware' {
    import webpack from 'webpack'
    import loglevel from 'loglevel'
    import { NextHandleFunction } from 'connect'
    import MemoryFileSystem from 'memory-fs'

    export = WebpackDevMiddleware

    declare function WebpackDevMiddleware(
        compiler: webpack.ICompiler,
        options?: WebpackDevMiddleware.Options,
    ): WebpackDevMiddleware.WebpackDevMiddleware & NextHandleFunction

    declare namespace WebpackDevMiddleware {
        interface Options {
            logLevel?: string
            lazy?: boolean
            watchOptions?: webpack.Options.WatchOptions
            publicPath: string
            index?: string | boolean
            headers?: {
                [name: string]: string
            }
            stats?: webpack.Options.Stats
            reporter?: Reporter | null
            serverSideRender?: boolean
            logger?: Logger
            filename?: string
            writeToDisk?: boolean | ((filename: string) => boolean)
        }

        interface ReporterOptions {
            state: boolean
            stats?: webpack.Stats
            log: Logger
        }

        type Logger = loglevel.Logger
        type Reporter = (middlewareOptions: Options, reporterOptions: ReporterOptions) => void

        interface WebpackDevMiddleware {
            close(callback?: () => void): void
            invalidate(callback?: (stats: webpack.Stats) => void): void
            waitUntilValid(callback?: (stats: webpack.Stats) => void): void
            getFilenameFromUrl: (url: string) => string | false
            fileSystem: MemoryFileSystem
        }
    }
}
