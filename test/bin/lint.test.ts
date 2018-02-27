import lint from '../../lib/bin/lint'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because linting might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const buildConfig = getConfig(process.cwd())

// When these tests fail, the command which was run will be in the test:verbose logs
// just run them on the command line to get the actual errors

describe('bin/lint', () => {
    it('will lint all', async () => {
        buildConfig.LINT_EXCLUDE = [
            ...buildConfig.LINT_EXCLUDE,
            'client/**',
            'demo/**',
            'server/**',
            'test/**',
        ]
        await lint(buildConfig)
    })

    it('will lint tslint', async () => {
        await lint(buildConfig, 'tslint', `'lib/**/*.ts'`)
    })

    it('will lint sass', async () => {
        await lint(buildConfig, 'sass-lint')
    })
})
