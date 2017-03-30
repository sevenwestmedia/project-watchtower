declare module "http-proxy-middleware" {
    import * as express from 'express'

    function httpProxyMiddleware(address: string, config?: any): express.RequestHandler
    namespace httpProxyMiddleware {}
    export = httpProxyMiddleware
}
