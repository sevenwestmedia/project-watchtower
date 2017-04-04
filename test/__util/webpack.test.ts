import * as webpack from 'webpack'
import { printWebpackStats } from '../../lib/__util/webpack'

describe('__util/webpack', () => {

    it('printWebpackStats', () => {
        const stats = {
            toString: () => 'stats',
        } as webpack.Stats

        printWebpackStats(stats)
    })

})
