import { logError } from './log'
import { delay } from './time'

export const average = (nums: number[]) => nums.reduce((prev, cur) => prev + cur, 0) / nums.length

export const getSequenceAverage = async (fn: () => Promise<number>, times = 5) => {
    const results: number[] = []

    for (let i = 0; i < times; i++) {
        try {
            const nextResult = await fn()
            results.push(nextResult)
        } catch (e) {
            logError('getSequenceAverage error: ', e)
        }
        await delay(500)
    }

    return average(results)
}
