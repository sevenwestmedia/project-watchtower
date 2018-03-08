import { createServer } from '../runtime/server/server'
import { createConsoleLogger } from '../runtime/universal'

const log = createConsoleLogger()
log.info('Starting Project Watchtower internal server...')

createServer({ log })
