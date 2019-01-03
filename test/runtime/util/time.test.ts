import { delay, formatTimeMs, getTimeMs } from '../../../lib/util/time'

describe('util/time', () => {
    it('formatTimeMs', () => {
        expect(formatTimeMs(1.23)).toBe('1')
    })

    it('getTimeMs', () => {
        expect(typeof getTimeMs()).toBe('number')
    })

    it('delay', () => delay(100))
})
