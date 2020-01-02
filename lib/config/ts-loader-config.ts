import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { CreateWebpackConfigOptions } from '../runtime/server'
import { BuildTarget } from '../types'

const disableTypeCheck = process.env.DISABLE_TYPE_CHECKING === 'true'

export function getTypeScriptWebpackRule(
    _plugins: webpack.Plugin[],
    resolvePlugins: webpack.ResolvePlugin[],
    options: CreateWebpackConfigOptions,
    buildTarget: BuildTarget,
): webpack.RuleSetRule {
    const configFile =
        (buildTarget === 'server'
            ? options.buildConfig.TS_CONFIG_SERVER
            : options.buildConfig.TS_CONFIG_CLIENT) || 'tsconfig.json'

    options.log.info(`Target ${buildTarget} using ts config file: ${configFile}`)

    const tsConfigPathsPluginConfig: any = {}
    const tsLoaderOptions: any = {
        compilerOptions: {
            noEmit: false,
        },
        transpileOnly: disableTypeCheck,
        experimentalWatchApi: true,
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

    let babelConfig: string | undefined = path.resolve(options.buildConfig.BASE, `.babelrc`)
    if (!fs.existsSync(babelConfig)) {
        babelConfig = path.resolve(process.cwd(), `.babelrc`)
        if (!fs.existsSync(babelConfig)) {
            babelConfig = undefined
        }
    }

    if (babelConfig) {
        options.log.info(`Using babel config: ${babelConfig}`)
    }
    return {
        test: /\.tsx?$/,
        use: [
            {
                loader: 'babel-loader',
                options: {
                    extends: babelConfig,
                },
            },
            tsLoader,
        ],
    }
}
