import { log, logError, prettyJson } from '../../../lib/runtime/util/log'

describe('util/log', () => {

    it('log', () => {
        log('a', undefined, { foo: 'bar' })
    })

    it('logError', () => {
        logError('a', undefined, { foo: 'bar' })
        logError({
            toString: () => 'error string',
            stack: ['a', 'b', 'c'],
        })
    })

    it('prettyJson', () => {
        const obj = {
            foo: 'bar',
        }
        const json = prettyJson(obj)
        expect(json).toBe(
`{
  "foo": "bar"
}`)

        expect(prettyJson(undefined)).toBe(undefined)
        expect(prettyJson(false)).toBe('false')
        expect(prettyJson(null)).toBe('null')
    })

})
