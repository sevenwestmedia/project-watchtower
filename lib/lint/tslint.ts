import * as path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../util/process'
import CONFIG from '../config/config'

const { LINT_EXCLUDE } = CONFIG

const tslint = (...paths: string[]): Promise<ChildProcess> => {

    // we have to wrap all glob patterns in single quotes
    // see https://github.com/palantir/tslint/issues/2204

    const usePaths = paths.length
            ? paths
            : [ `'**/*.ts?(x)'` ]

    const executable = path.resolve(process.cwd(), 'node_modules', 'tslint', 'bin', 'tslint')

    const exclude = [
        '**/*.d.ts',
        '**/node_modules/**',
        ...LINT_EXCLUDE,
    ]

    const args = [
        ...usePaths,
        // TODO add after upgrading to tslint 5.1.0
        /*
        '--type-check',
        '--project',
        './tsconfig.json',
        */
    ]

    exclude.forEach((x) => {
        args.push('-e')
        args.push(`'${x}'`)
    })

    return forkPromise(executable, args)
}

export default tslint
