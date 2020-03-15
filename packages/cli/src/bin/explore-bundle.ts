import webpack from 'webpack'
import merge from 'webpack-merge'
import { Logger } from 'typescript-log'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

import { getWebpackConfig } from '../build/build'
import { webpackPromise } from '../utils/webpack'
import { BuildConfig } from '@project-watchtower/server'

/**
 * Opens the webpack-bundle-analyzer for the client production bundle
 */
const exploreBundle = (log: Logger, buildConfig: BuildConfig, ...args: string[]) => {
    const baseConfig = getWebpackConfig(log, buildConfig, 'client', 'prod')

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
                (plugin: unknown) =>
                    !(plugin instanceof webpack.optimize.ModuleConcatenationPlugin),
            )
    }

    return webpackPromise(log, config)
}

export default exploreBundle
