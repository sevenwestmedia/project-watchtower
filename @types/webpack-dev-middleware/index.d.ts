declare namespace webpack {
    // @TODO Figure out how to augment the webpack configuration
    interface Configuration {
        webpackMiddleware: any
    }
}

declare module "webpack-dev-middleware" {
    import * as webpack from 'webpack'
    import * as express from 'express'

    function webpackDevMiddleware(compiler: webpack.compiler.Compiler, config: any): express.RequestHandler
    namespace webpackDevMiddleware {}
    export = webpackDevMiddleware
}
