import { printWebpackStats } from '../../lib/util/webpack'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()

describe('util/webpack', () => {
    it('printWebpackStats', () => {
        const stats: any = {
            toString: () => 'stats',
            hasErrors: () => false,
            hasWarnings: () => false,
            toJson: () => "{ stats: 'as json' }",
        }
        printWebpackStats(log, stats)
    })
})
