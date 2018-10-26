declare module 'http-proxy-middleware' {
    function httpProxyMiddleware(address: string, config?: any): express.RequestHandler
    namespace httpProxyMiddleware {

    }
    export = httpProxyMiddleware
}
