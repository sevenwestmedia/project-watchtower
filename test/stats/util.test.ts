import {
    formatFileSize,
    formatTimeMs,
    getTimeMs,
    delay,
    average,
    getSequenceAverage,
} from '../../lib/stats/util'

describe('stats/util', () => {

    it('formatFileSize', () => {
        expect(formatFileSize(2048)).toBe('2.0')
    })

    it('formatTimeMs', () => {
        expect(formatTimeMs(1.23)).toBe('1')
    })

    it('getTimeMs', () => {
        expect(typeof getTimeMs()).toBe('number')
    })

    it('delay', () => delay(100))

    it('average', () => {
        expect(average([1])).toBe(1)
        expect(average([1, 2])).toBe(1.5)
    })

    it('getSequenceAverage', async function testSequenceAverage() {
        let i = 1
        const iteration = () => i++
        const average = await getSequenceAverage(iteration, 2)
        expect(average).toBe(1.5)
    })

})
