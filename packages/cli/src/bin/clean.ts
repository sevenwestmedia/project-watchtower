import { Logger } from 'typescript-log'

import { clean as doClean } from '../clean/clean'
import { BuildConfig } from '@project-watchtower/server'

const clean = (log: Logger, buildConfig: BuildConfig, ...paths: string[]) => {
    const { OUTPUT } = buildConfig
    return doClean(log, [
        OUTPUT,
        '{client,common,server}/**/*.{js,map}',
        'assets.json',
        'build-stats.csv',
        ...paths,
    ])
}

export default clean
