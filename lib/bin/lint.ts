import tslint from '../lint/tslint'
import sassLint from '../lint/sass-lint'
import { log } from '../util/log'
import { BuildConfig } from '../../lib'

/**
 * Runs TSLint and/or SASS-Lint
 * Paths have to contain ".ts" or ".scss" to be mapped correctly if both linters are called
 */
const lint = (buildConfig: BuildConfig, ...paths: string[]) => {
    let promise: Promise<any>

    if (paths.indexOf('tslint') !== -1) {
        const tslintPaths = paths.filter(p => p !== 'tslint')
        promise = tslint(buildConfig, ...tslintPaths)
    } else if (paths.indexOf('sass-lint') !== -1) {
        const sassLintPaths = paths.filter(p => p !== 'sass-lint')
        promise = sassLint(buildConfig, ...sassLintPaths)
    } else {
        const tslintPaths = paths.filter(p => p.indexOf('.ts') !== -1)
        const sassLintPaths = paths.filter(p => p.indexOf('.scss') !== -1)

        promise = Promise.all([
            tslint(buildConfig, ...tslintPaths),
            sassLint(buildConfig, ...sassLintPaths),
        ])
    }

    return promise.then(() => {
        log('Linting finished without errors.')
    })
}

export default lint
