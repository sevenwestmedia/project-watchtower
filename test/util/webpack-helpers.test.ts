import * as webpack from 'webpack'
import { printWebpackStats } from '../../lib/util/webpack-helpers'

describe('util/webpack-helpers', () => {

    it('printWebpackStats', () => {
        const stats = {
            toString: () => 'stats',
        } as webpack.Stats

        printWebpackStats(stats)
    })

})
