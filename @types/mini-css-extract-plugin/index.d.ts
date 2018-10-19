declare module 'mini-css-extract-plugin' {
    import { Loader, Plugin } from 'webpack'

    /**
     * Lightweight CSS extraction webpack plugin
     * This plugin extract CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
     * Configuration Detail: https://github.com/webpack-contrib/mini-css-extract-plugin#configuration
     */
    declare class MiniCssExtractPlugin extends Plugin {
        /** webpack loader used always at the end of loaders list */
        static loader: Loader

        constructor(options?: MiniCssExtractPlugin.PluginOptions)
    }

    declare namespace MiniCssExtractPlugin {
        interface PluginOptions {
            /**
             * Options similar to the same options in webpackOptions.output, both options are optional
             * May contain `[name]`, `[id]`, `hash` and `[chunkhash]`
             */
            filename?: string
            chunkFilename?: string
        }
    }

    export = MiniCssExtractPlugin
}
