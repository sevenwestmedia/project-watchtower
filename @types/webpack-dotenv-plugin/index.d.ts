declare module "webpack-dotenv-plugin" {
    import * as webpack from 'webpack'

    interface Config {
        path?: string
        sample?: string
    }

    const DotenvPlugin: {
        new(config?: Config): webpack.Plugin
    }

    export = DotenvPlugin
}
