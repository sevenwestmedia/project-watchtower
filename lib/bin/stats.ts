import { measureAndWriteBuildStats } from '../stats'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const stats = (log: Logger, buildConfig: BuildConfig, ...params: string[]) => {
    const verbose = params.indexOf('verbose') !== -1

    return measureAndWriteBuildStats(log, buildConfig, verbose)
}

export default stats
