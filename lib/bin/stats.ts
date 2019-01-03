import { Logger } from 'typescript-log'
import { BuildConfig } from '../../lib'
import { measureAndWriteBuildStats } from '../stats'

const stats = (log: Logger, buildConfig: BuildConfig, ...params: string[]) => {
    const verbose = params.indexOf('verbose') !== -1

    return measureAndWriteBuildStats(log, buildConfig, verbose)
}

export default stats
