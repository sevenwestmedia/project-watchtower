import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getWebpackConfig } from '../build/build'
import { printWebpackStats } from '../__util/webpack'

/**
 * Opens the webpack-bundle-analyzer for the client production bundle
 */
const exploreBundle = () => {
    const baseConfig = getWebpackConfig('client', 'prod')

    if (!baseConfig) {
        return Promise.reject('Error loading the webpack configuration!')
    }

    const config = merge(
        baseConfig,
        {
            plugins: [
                new BundleAnalyzerPlugin(),
            ],
        },
    )

    return new Promise((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                reject(err)
            } else {
                printWebpackStats(stats)
                resolve()
            }
        })
    })
}

export default exploreBundle
