import lint from '../../lib/bin/lint'

// Increase test timeout because linting might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/lint', () => {

    it('will lint', async () => {
        await lint()
        await lint('tslint', `'lib/**/*.ts'`)
        await lint('sass-lint')
    })

})
