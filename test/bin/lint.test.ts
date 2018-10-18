import lint from '../../lib/bin/lint'
import path from 'path'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because linting might take a while
import { createConsoleLogger } from '../../lib/runtime/universal'
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const log = createConsoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getConfig(log, testProjectDir)

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
        await lint(log, buildConfig)
    })

    it('will lint tslint', async () => {
        await lint(log, buildConfig, 'tslint', `'lib/**/*.ts'`)
    })

    it('will lint sass', async () => {
        await lint(log, buildConfig, 'sass-lint')
    })
})
