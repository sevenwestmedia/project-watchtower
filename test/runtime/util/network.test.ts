import * as express from 'express'
import {
    waitForConnection,
    checkPortAvailability,
    findFreePort,
} from '../../../lib/runtime/util/network'
import { expectPromiseToFail, getTestPort } from '../../test-helpers'

describe('util/network', () => {

    it('waitForConnection', async () => {
        const port = await getTestPort()
        const app = express()
        const server = app.listen(port)

        return waitForConnection(port)
            .then(() => server.close())
    })

    it('checkPortAvailability', async () => {
        const port = await getTestPort()
        return checkPortAvailability(port)
    })

    it('checkPortAvailability - port occupied', async () => {
        const port = await getTestPort()
        const app = express()
        return new Promise((resolve) => {
            const server = app.listen(port, () => {
                expectPromiseToFail(checkPortAvailability(port))
                    .then(() => {
                        server.close()
                        resolve()
                    })
            })
        })
    })

    it('findFreePort', async () => {
        const port = await getTestPort()
        const app = express()
        return new Promise((resolve) => {
            const server = app.listen(port, async () => {
                const freePort = await findFreePort(port)
                expect(freePort).toBeGreaterThan(port)
                server.close()
                resolve()
            })
        })
    })

})
