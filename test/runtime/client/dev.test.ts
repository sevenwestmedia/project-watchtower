/**
 * @testEnvironment jsdom
 */

import { cssHotReload } from '../../../lib/runtime/client/dev'
import { delay } from '../../../lib/util/time'

describe('lib/client/dev', () => {
    it('cssHotReload', async () => {
        const origSuccess = () => {}

        /*
         * TODO remove in the next version of jest when the
         * @testEnvironment comment setting is released:
         * https://github.com/facebook/jest/commit/62c4e9a7f5e9c36d2427843d933250cf1909336a
         */
        const window = ((global as any).window = {
            setTimeout,
        })

        const reporter = ((window as any).__webpack_hot_middleware_reporter__ = {
            success: origSuccess,
        })

        cssHotReload()

        // wait for setTimeout to complete
        await delay(100)

        expect(reporter.success).not.toBe(origSuccess)

        // TODO actually call function once we have a JSDOM environment
    })
})
