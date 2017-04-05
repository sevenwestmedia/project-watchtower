import * as path from 'path'
import bundleSize from './bundle-size'
import ssrStats from './ssr-stats'
import { writeFile } from '../util/fs'

const root = process.cwd()

export interface BuildMetrics {
    [key: string]: string
}

const buildStats = async () => {

    const keys: string[] = []
    const values: string[] = []

    const addMetrics = (obj: BuildMetrics) => {
        Object.keys(obj).forEach((key) => {
            keys.push(key)
            values.push(obj[key])
        })
    }

    const bundleMetrics = await bundleSize()
    addMetrics(bundleMetrics)

    const ssrMetrics = await ssrStats()
    addMetrics(ssrMetrics)

    const titleRow = keys.join(',')
    const valueRow = values.join(',')

    const fileContent = titleRow
        + '\n'
        + valueRow

    const statsFilePath = path.resolve(root, 'build-stats.csv')

    return writeFile(statsFilePath, fileContent)
}

export default buildStats
