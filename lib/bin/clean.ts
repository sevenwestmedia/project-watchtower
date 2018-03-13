import doClean from '../clean'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const clean = (log: Logger, buildConfig: BuildConfig, ...paths: string[]) => {
    const { OUTPUT } = buildConfig
    return doClean(log, [
        OUTPUT,
        '{client,common,server}/**/*.{js,map}',
        'assets.json',
        'build-stats.csv',
        'coverage',
        ...paths,
    ])
}

export default clean
