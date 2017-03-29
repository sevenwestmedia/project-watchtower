import tslint from '../lint/tslint'
import sassLint from '../lint/sass-lint'

const lint = (...paths: string[]) => {
    const tslintPaths = paths.filter((p) => p.indexOf('.ts') !== -1)
    const sassLintPaths = paths.filter((p) => p.indexOf('.scss') !== -1)

    return Promise.all([
        tslint(...tslintPaths),
        sassLint(...sassLintPaths),
    ]).then(() => {
        // tslint:disable-next-line no-console
        console.log('Linting finished without errors.')
    }).catch((e) => {
        console.error('Linting finished with errors!')
        throw e
    })
}

export default lint
