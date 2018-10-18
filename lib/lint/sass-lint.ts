import path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../util/process'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const sassLint = (
    log: Logger,
    buildConfig: BuildConfig,
    ...paths: string[]
): Promise<ChildProcess> => {
    const usePaths = paths.length ? paths : ['**/*.scss']

    const executable = path.resolve(
        process.cwd(),
        'node_modules',
        'sass-lint',
        'bin',
        'sass-lint.js',
    )

    const ignore = ['**/node_modules/**', ...buildConfig.LINT_EXCLUDE]

    const args = [...usePaths, '--verbose', '--no-exit', '--ignore', ignore.join(', ')]

    return forkPromise(log, executable, args)
}

export default sassLint
