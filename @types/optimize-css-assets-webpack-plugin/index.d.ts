declare module 'optimize-css-assets-webpack-plugin' {
    import { Plugin } from 'webpack'

    export = OptimizeCssAssetsPlugin

    declare namespace OptimizeCssAssetsPlugin {
        interface Options {
            assetNameRegExp?: RegExp
            cssProcessor?: any
            cssProcessorOptions?: any
            canPrint?: boolean
        }
    }

    declare class OptimizeCssAssetsPlugin extends Plugin {
        constructor(options?: OptimizeCssAssetsPlugin.Options)
    }
}
