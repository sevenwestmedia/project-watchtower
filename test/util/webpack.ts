import * as webpack from 'webpack'
import { printWebpackStats } from '../../lib/util/webpack'

describe('util/webpack', () => {

    it('printWebpackStats', () => {
        const stats = {
            toString: () => 'stats',
        } as webpack.Stats

        printWebpackStats(stats)
    })

})
