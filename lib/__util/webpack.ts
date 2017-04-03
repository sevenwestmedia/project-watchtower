import * as webpack from 'webpack'
import { log } from './log'

export const printWebpackStats = (stats: webpack.Stats) => {

    const statsString = stats.toString({
        errors: true,
        warnings: true,
        timings: true,
        colors: true,
        chunkModules: false,
        children: false,
    })

    log(statsString)
}
