import tslint from '../lint/tslint'
import sassLint from '../lint/sass-lint'
import { log, logError } from '../__util/log'

const lint = (...paths: string[]) => {
    const tslintPaths = paths.filter((p) => p.indexOf('.ts') !== -1)
    const sassLintPaths = paths.filter((p) => p.indexOf('.scss') !== -1)

    return Promise.all([
        tslint(...tslintPaths),
        sassLint(...sassLintPaths),
    ]).then(() => {
        log('Linting finished without errors.')
    }).catch((e) => {
        logError('Linting finished with errors!')
        throw e
    })
}

export default lint
