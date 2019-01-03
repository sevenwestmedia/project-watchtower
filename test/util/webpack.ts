import { consoleLogger } from 'typescript-log'
import { printWebpackStats } from '../../lib/util/webpack'

const log = consoleLogger()

describe('util/webpack', () => {
    it('printWebpackStats', () => {
        const stats: any = {
            hasErrors: () => false,
            hasWarnings: () => false,
            toJson: () => "{ stats: 'as json' }",
            toString: () => 'stats',
        }
        printWebpackStats(log, stats)
    })
})
