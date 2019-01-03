import { Logger } from 'typescript-log'
import webpack from 'webpack'

export const webpackStatsConfig: webpack.Stats.ToStringOptionsObject = {
    children: false,
    chunkModules: false,
    chunks: false,
    colors: true,
    errors: true,
    timings: true,
    warnings: true,
    /* filter export warnings when transpileOnly:true -> https://github.com/TypeStrong/ts-loader/issues/751 */
    warningsFilter: /export .* was not found in/,
}

export const printWebpackStats = (log: Logger, stats: webpack.Stats) => {
    const statsString = stats.toString(webpackStatsConfig)

    log.info(statsString)
}

export const webpackPromise = (log: Logger, config: webpack.Configuration) =>
    new Promise((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                log.error({ err }, 'Failed to compile')
                reject(err)
            } else {
                printWebpackStats(log, stats)

                if (stats.hasErrors()) {
                    reject()
                } else {
                    resolve()
                }
            }
        })
    })
