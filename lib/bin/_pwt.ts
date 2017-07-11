import * as path from 'path'
import { fork } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Increaase UV_THREADPOOL_SIZE to prevent deadlock in SCSS compilation
 * https://github.com/webpack-contrib/sass-loader/issues/100
 */
process.env.UV_THREADPOOL_SIZE = '128'

const filePath = path.resolve(__dirname, 'index.js')

const proc = fork(
    filePath,
    process.argv.slice(2),
    {
        env: process.env,
    },
)

proc.on('error', () => {
    process.exit(1)
})

proc.on('exit', (code) => {
    process.exit(code)
})
