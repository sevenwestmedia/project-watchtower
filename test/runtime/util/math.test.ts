import { average, getSequenceAverage } from '../../../lib/runtime/util/math'

describe('util/math', () => {
    it('average', () => {
        expect(average([1])).toBe(1)
        expect(average([1, 2])).toBe(1.5)
    })

    it('getSequenceAverage', async () => {
        let i = 1
        const iteration = async () => i++
        const avg = await getSequenceAverage(iteration, 2)
        expect(avg).toBe(1.5)
    })
})
