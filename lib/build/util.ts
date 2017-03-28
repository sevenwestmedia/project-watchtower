import * as webpack from 'webpack'

export const printWebpackStats = (stats: webpack.Stats) => {

    const statsString = stats.toString({
        errors: true,
        warnings: true,
        timings: true,
        colors: true,
        chunkModules: false,
    })

    // tslint:disable-next-line no-console
    console.log(statsString)
}
