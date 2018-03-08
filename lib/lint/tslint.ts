import * as fs from 'fs'
import * as path from 'path'
import { ChildProcess } from 'child_process'
import { forkPromise } from '../util/process'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const tslint = (
    log: Logger,
    buildConfig: BuildConfig,
    ...paths: string[]
): Promise<ChildProcess> => {
    // we have to wrap all glob patterns in single quotes
    // see https://github.com/palantir/tslint/issues/2204

    const usePaths = paths.length ? paths : [`'**/*.ts?(x)'`]

    const executable = resolveTsLint(buildConfig.BASE)
    if (!executable) {
        throw new Error('Cannot locate tslint executable')
    }

    const exclude = ['**/*.d.ts', '**/node_modules/**', ...buildConfig.LINT_EXCLUDE]

    const args = [...usePaths, '--type-check', '--project', './tsconfig.json']

    exclude.forEach(x => {
        args.push('-e')
        args.push(`'${x}'`)
    })

    return forkPromise(log, executable, args)
}

function resolveTsLint(root: string): string | undefined {
    if (root === '/') {
        return undefined
    }
    const tslintPath = path.resolve(root, 'node_modules', 'tslint', 'bin', 'tslint')
    if (fs.existsSync(tslintPath)) {
        return tslintPath
    }

    return resolveTsLint(path.resolve(root, '..'))
}

export default tslint
