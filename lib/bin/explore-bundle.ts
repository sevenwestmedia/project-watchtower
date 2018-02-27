import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getWebpackConfig } from '../build/build'
import { webpackPromise } from '../util/webpack'
import { BuildConfig } from '../../lib'

/**
 * Opens the webpack-bundle-analyzer for the client production bundle
 */
const exploreBundle = (buildConfig: BuildConfig, ...args: string[]) => {
    const baseConfig = getWebpackConfig(buildConfig, 'client', 'prod')

    if (!baseConfig) {
        return Promise.reject('Error loading the webpack configuration!')
    }

    const config = merge(baseConfig, {
        plugins: [new BundleAnalyzerPlugin()],
    })

    const disableHoisting = args.indexOf('disableHoisting') !== -1

    if (disableHoisting) {
        config.plugins =
            config.plugins &&
            config.plugins.filter(
                plugin => !(plugin instanceof webpack.optimize.ModuleConcatenationPlugin),
            )
    }

    return webpackPromise(config)
}

export default exploreBundle
