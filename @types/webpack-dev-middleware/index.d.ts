declare module "webpack-dev-middleware" {
    import * as webpack from 'webpack'
    import * as express from 'express'

    function webpackDevMiddleware(compiler: webpack.compiler.Compiler, config: any): express.RequestHandler
    namespace webpackDevMiddleware {}
    export = webpackDevMiddleware
}
