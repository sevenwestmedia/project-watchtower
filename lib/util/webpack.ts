import * as webpack from 'webpack'
import { log, logError } from '../runtime/util/log'

export const webpackStatsConfig: webpack.Stats.ToStringOptionsObject = {
    errors: true,
    warnings: true,
    timings: true,
    colors: true,
    chunks: false,
    chunkModules: false,
    children: false
}

export const printWebpackStats = (stats: webpack.Stats) => {
    const statsString = stats.toString(webpackStatsConfig)

    log(statsString)
}

export const webpackPromise = (config: webpack.Configuration) =>
    new Promise((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                logError(err)
                reject(err)
            } else {
                printWebpackStats(stats)

                if (stats.hasErrors()) {
                    reject()
                } else {
                    resolve()
                }
            }
        })
    })
