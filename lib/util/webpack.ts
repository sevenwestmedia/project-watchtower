import * as webpack from 'webpack'
import { log, logError } from './log'

/*
 * This file cannot be named 'webpack.ts' as the import of the 'webpack'
 * module will not work in the ts-jest environment!
 */

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

export const webpackPromise = (config: webpack.Configuration) => (
    new Promise((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                logError(err)
                reject(err)
            } else {
                printWebpackStats(stats)
                resolve()
            }
        })
    })
)
