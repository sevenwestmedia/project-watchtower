import os from 'os'
import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { CreateWebpackConfigOptions } from '../runtime/server'
import { BuildTarget } from '../types'

const disableCaching = String(process.env.BUILD_CACHE_DISABLED).toLowerCase() === 'true'
const disableTypeCheck = process.env.START_FAST_MODE === 'true'

const osCpus = os.cpus().length
const threadLoaderCpus = !disableTypeCheck ? osCpus - 1 : osCpus

const threadLoader = {
    loader: 'thread-loader',
    options: {
        // there should be 1 cpu for the fork-ts-checker-webpack-plugin if its enabled
        workers: threadLoaderCpus,
    },
}

const cacheLoader = (cacheDirectory: string) => {
    return {
        loader: 'cache-loader',
        options: {
            cacheDirectory,
        },
    }
}

export function getTypeScriptWebpackRule(
    plugins: webpack.Plugin[],
    resolvePlugins: webpack.ResolvePlugin[],
    options: CreateWebpackConfigOptions,
    buildTarget: BuildTarget,
): webpack.RuleSetRule {
    if (!disableTypeCheck) {
        plugins.push(new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true })) // fork ts checking
    }

    const configFile =
        buildTarget === 'server'
            ? options.buildConfig.TS_CONFIG_SERVER
            : options.buildConfig.TS_CONFIG_CLIENT

    const tsConfigPathsPluginConfig: any = {}
    const tsLoaderOptions: any = {
        happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
        transpileOnly: true,
    }

    if (configFile) {
        tsConfigPathsPluginConfig.configFile = configFile
        tsLoaderOptions.configFile = configFile
    }
    resolvePlugins.push(new TsconfigPathsPlugin(tsConfigPathsPluginConfig))

    const tsLoader = {
        loader: 'ts-loader',
        options: tsLoaderOptions,
    }

    return {
        test: /\.tsx?$/,
        use: !disableCaching
            ? [threadLoader, cacheLoader(options.cacheDirectory), tsLoader]
            : [threadLoader, tsLoader],
    }
}
