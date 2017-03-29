declare module "webpack-bundle-analyzer" {
    import * as webpack from 'webpack'

    export const BundleAnalyzerPlugin: {
        new(config?: any): webpack.Plugin
    }
}
