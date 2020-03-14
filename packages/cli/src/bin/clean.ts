import { Logger } from 'typescript-log'

import { clean } from '../clean/clean'
import { BuildConfig } from '@project-watchtower/server'

export function binClean(log: Logger, buildConfig: BuildConfig, ...paths: string[]) {
    const { OUTPUT } = buildConfig
    return clean(log, [
        OUTPUT,
        '{client,common,server}/**/*.{js,map}',
        'assets.json',
        'build-stats.csv',
        ...paths,
    ])
}
