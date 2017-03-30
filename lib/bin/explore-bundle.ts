import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getWebpackConfig } from '../build/build'
import { logError } from '../__util/log'
import { printWebpackStats } from '../__util/webpack'

const exploreBundle = () => {
    const baseConfig = getWebpackConfig('client', 'prod')

    if (!baseConfig) {
        return
    }

    const config = merge(
        baseConfig,
        {
            plugins: [
                new BundleAnalyzerPlugin(),
            ],
        },
    )

    webpack(config).run((err, stats) => {
        if (err) {
            logError(err)
        } else {
            printWebpackStats(stats)
        }
    })
}

export default exploreBundle
