import * as merge from 'webpack-merge'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getWebpackConfig } from '../build/build'
import { webpackPromise } from '../util/webpack'

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

    return webpackPromise(config)
}

export default exploreBundle
