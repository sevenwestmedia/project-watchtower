import { Logger } from 'typescript-log'
import webpack from 'webpack'

export const webpackStatsConfig: webpack.StatsOptions = {
    children: false,
    chunkModules: false,
    chunks: false,
    colors: true,
    errors: true,
    timings: true,
    warnings: true,
}

export const printWebpackStats = (log: Logger, stats: webpack.Stats) => {
    const statsString = stats.toString(webpackStatsConfig)

    log.info(statsString)
}

export const webpackPromise = (log: Logger, config: webpack.Configuration) =>
    new Promise<void>((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                log.error({ err }, 'Failed to compile')
                reject(err)
            } else if(stats) {
                printWebpackStats(log, stats)

                if (stats.hasErrors()) {
                    const info = stats.toJson()

                    reject(info.errors)
                } else {
                    resolve()
                }
            }
        })
    })
