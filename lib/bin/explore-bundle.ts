import * as webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import extendWebpackConfig from '../build/extend'
import { getWebpackConfig } from '../build/build'
import { printWebpackStats } from '../__util/webpack'

const exploreBundle = () => {
    const baseConfig = getWebpackConfig('client', 'prod')

    if (!baseConfig) {
        return
    }

    const config = extendWebpackConfig(
        baseConfig,
        {
            plugins: [
                new BundleAnalyzerPlugin()
            ],
        },
    )

    webpack(config).run((err, stats) => {
        if (err) {
            console.error(err)
        } else {
            printWebpackStats(stats)
        }
    })
}

export default exploreBundle
