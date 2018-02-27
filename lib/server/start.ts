import { createServer } from '../runtime/server/server'
import { log } from '../runtime/util/log'

export const startServer = (startDir: string) => {
    log('Starting Project Watchtower internal server...')

    createServer(startDir)
}
