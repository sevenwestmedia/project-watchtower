import { consoleLogger } from 'typescript-log'
import { printWebpackStats } from '@project-watchtower/cli'

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
