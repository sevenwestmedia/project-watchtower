import * as path from 'path'
import { forkPromise } from '../__util/process'

const tslint = (...paths: string[]) => {
    const usePaths = paths.length
            ? paths
            : [ '**/*.ts?(x)' ]

    const executable = path.resolve(process.cwd(), 'node_modules', 'tslint', 'bin', 'tslint')

    const args = [
        ...usePaths,
        '--type-check',
        '--project',
        './tsconfig.json',
        '-e',
        '**/*.d.ts',
        '-e',
        '**/node_modules/**',
    ]

    return forkPromise(executable, args)
}

export default tslint
