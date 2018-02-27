import * as path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../runtime/util/process'
import { BuildConfig } from '../../lib'

const sassLint = (buildConfig: BuildConfig, ...paths: string[]): Promise<ChildProcess> => {
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

    return forkPromise(executable, args)
}

export default sassLint
