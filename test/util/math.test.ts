import { average, getSequenceAverage } from '../../lib/util/math'

describe('util/math', () => {

    it('average', () => {
        expect(average([1])).toBe(1)
        expect(average([1, 2])).toBe(1.5)
    })

    it('getSequenceAverage', async () => {
        let i = 1
        const iteration = async () => i++
        const average = await getSequenceAverage(iteration, 2)
        expect(average).toBe(1.5)
    })

})
