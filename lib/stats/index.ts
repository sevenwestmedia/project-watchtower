import * as path from 'path'
import bundleSize from './bundle-size'
import ssrStats from './ssr-stats'
import lighthouseStats from './lighthouse'
import { writeFile } from '../runtime/util/fs'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'
import { getRuntimeConfigFromBuildConfig } from '../runtime/config/config'

export interface BuildMetrics {
    [key: string]: string
}

export const measureBuildStats = async (
    log: Logger,
    buildConfig: BuildConfig,
    verbose?: boolean,
): Promise<BuildMetrics> => {
    const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)
    const bundleMetrics = await bundleSize(log, runtimeConfig)
    const ssrMetrics = await ssrStats(log, buildConfig, verbose)
    const lighthouseMetrics = await lighthouseStats(log, buildConfig, verbose)

    return {
        ...bundleMetrics,
        ...ssrMetrics,
        ...lighthouseMetrics,
    }
}

export const writeBuildStats = async (
    log: Logger,
    buildConfig: BuildConfig,
    metrics: BuildMetrics,
) => {
    // TeamCity expects key-value pairs written to the console

    Object.keys(metrics).forEach(key => {
        log.info(`##teamcity[buildStatisticValue key='${key}' value='${metrics[key]}']`)
    })

    // Jenkins wants a CSV file

    const keys: string[] = []
    const values: string[] = []

    Object.keys(metrics).forEach(key => {
        keys.push(key)
        values.push(metrics[key])
    })

    const titleRow = keys.join(',')
    const valueRow = values.join(',')

    const fileContent = titleRow + '\n' + valueRow

    const statsFilePath = path.resolve(buildConfig.BASE, 'build-stats.csv')

    await writeFile(log, statsFilePath, fileContent)
}

const measureAndWriteBuildStats = async (
    log: Logger,
    buildConfig: BuildConfig,
    verbose = false,
) => {
    const metrics = await measureBuildStats(log, buildConfig, verbose)
    await writeBuildStats(log, buildConfig, metrics)
}

export default measureAndWriteBuildStats
