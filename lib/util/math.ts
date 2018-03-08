import { delay } from './time'
import { Logger } from '../runtime/universal'

export const average = (nums: number[]) => nums.reduce((prev, cur) => prev + cur, 0) / nums.length

export const getSequenceAverage = async (log: Logger, fn: () => Promise<number>, times = 5) => {
    const results: number[] = []

    for (let i = 0; i < times; i++) {
        try {
            const nextResult = await fn()
            results.push(nextResult)
        } catch (err) {
            log.error({ err }, 'getSequenceAverage error: ')
        }
        await delay(500)
    }

    return average(results)
}
