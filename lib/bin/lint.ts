import tslint from '../lint/tslint'
import sassLint from '../lint/sass-lint'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

/**
 * Runs TSLint and/or SASS-Lint
 * Paths have to contain ".ts" or ".scss" to be mapped correctly if both linters are called
 */
const lint = (log: Logger, buildConfig: BuildConfig, ...paths: string[]) => {
    let promise: Promise<any>

    if (paths.indexOf('tslint') !== -1) {
        const tslintPaths = paths.filter(p => p !== 'tslint')
        promise = tslint(log, buildConfig, ...tslintPaths)
    } else if (paths.indexOf('sass-lint') !== -1) {
        const sassLintPaths = paths.filter(p => p !== 'sass-lint')
        promise = sassLint(log, buildConfig, ...sassLintPaths)
    } else {
        const tslintPaths = paths.filter(p => p.indexOf('.ts') !== -1)
        const sassLintPaths = paths.filter(p => p.indexOf('.scss') !== -1)

        promise = Promise.all([
            tslint(log, buildConfig, ...tslintPaths),
            sassLint(log, buildConfig, ...sassLintPaths),
        ])
    }

    return promise.then(() => {
        log.info('Linting finished without errors.')
    })
}

export default lint
