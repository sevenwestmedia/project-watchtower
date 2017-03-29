declare module "webpack-hot-middleware" {
    import * as webpack from 'webpack'
    import * as express from 'express'

    function webpackHotMiddleware(compiler: webpack.compiler.Compiler, config?: any): express.RequestHandler
    namespace webpackHotMiddleware {}
    export = webpackHotMiddleware
}
