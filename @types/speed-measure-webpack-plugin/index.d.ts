declare module 'speed-measure-webpack-plugin' {
    import webpack from 'webpack'
    declare class SpeedMeasurePlugin extends webpack.Configuration {
        constructor()

        wrap: (config: webpack.Configuration) => webpack.Configuration
    }

    export = SpeedMeasurePlugin
}
