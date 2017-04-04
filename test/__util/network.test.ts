import * as express from 'express'
import {
    waitForConnection,
    checkPortAvailability,
    findFreePort,
} from '../../lib/__util/network'
import { expectPromiseToFail } from '../test-helpers'

describe('__util/network', () => {

    it('waitForConnection', () => {
        const port = 3000
        const app = express()
        const server = app.listen(port)

        return waitForConnection(port)
            .then(() => server.close())
    })

    it('checkPortAvailability', () => (
        checkPortAvailability(3000)
    ))

    it('checkPortAvailability - port occupied', (done) => {
        const port = 3001
        const app = express()
        const server = app.listen(port, () => {
            expectPromiseToFail(checkPortAvailability(port))
                .then(() => {
                    server.close()
                    done()
                })
        })
    })

    it('findFreePort', (done) => {
        const port = 3002
        const app = express()
        const server = app.listen(port, async () => {
            const freePort = await findFreePort(port)
            expect(freePort).toBe(port + 1)
            server.close()
            done()
        })
    })

})
