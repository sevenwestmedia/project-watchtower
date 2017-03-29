import * as path from 'path'
import { forkPromise } from '../__util/process'

const sassLint = (...paths: string[]) => {
    const usePaths = paths.length
            ? paths
            : [ '**/*.scss' ]

    const executable = path.resolve(process.cwd(),
        'node_modules', 'sass-lint', 'bin', 'sass-lint.js')

    const args = [
        ...usePaths,
        '--verbose',
        '--no-exit',
        '--ignore',
        '**/node_modules/**',
    ]

    return forkPromise(executable, args)
}

export default sassLint
