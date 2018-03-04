import { prettyJson } from '../../../lib/util/log'
import { createConsoleLogger } from '../../../lib/runtime/universal'

const recursive = {}
;(recursive as any).recursive = recursive
const log = createConsoleLogger()

describe('util/log', () => {
    it('log', () => {
        log.info({ recursive, foo: 'bar' }, 'a')
    })

    it('logError', () => {
        log.error({ recursive, foo: 'bar' }, 'a')
        log.error(
            {
                err: new Error('Oops'),
            },
            'Oops',
        )
    })

    it('prettyJson', () => {
        const obj = {
            foo: 'bar',
        }
        const json = prettyJson(obj)
        expect(json).toBe(
            `{
  "foo": "bar"
}`,
        )

        expect(prettyJson(undefined)).toBe(undefined)
        expect(prettyJson(false)).toBe('false')
        expect(prettyJson(null)).toBe('null')
    })
})
