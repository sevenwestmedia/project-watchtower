declare module "assets-webpack-plugin" {
    import * as webpack from 'webpack'

    const AssetsPlugin: {
        new(config?: any): webpack.Plugin
    }

    export = AssetsPlugin
}
