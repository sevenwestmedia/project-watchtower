declare module 'webpack-hot-middleware' {
    import { NextHandleFunction } from 'connect'
    import { compiler } from 'webpack'

    export = WebpackHotMiddleware

    declare function WebpackHotMiddleware(
        compiler: compiler.Compiler,
        options?: WebpackHotMiddleware.Options,
    ): NextHandleFunction

    declare namespace WebpackHotMiddleware {
        interface Options {
            log?: false | Logger
            path?: string
            heartbeat?: number
        }

        type Logger = (message?: any, ...optionalParams: any[]) => void
    }
}
