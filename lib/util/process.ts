import { ChildProcess, fork, ForkOptions, spawn, SpawnOptions } from 'child_process'
import { Logger } from 'typescript-log'

// make sure all child processes are killed when the process exits
// https://stackoverflow.com/questions/15833047/how-to-kill-all-child-processes-on-exit

let childProcesses: ChildProcess[] = []

const killAllChildProcesses = () => {
    childProcesses.forEach(proc => {
        try {
            proc.kill()
            // eslint-disable-next-line no-empty
        } catch (err) {}
    })
    childProcesses = []
}

process.on('exit', killAllChildProcesses)

process.on('SIGINT', () => process.exit())
process.on('SIGTERM', () => process.exit())

export const spawnPromise = (
    log: Logger,
    command: string,
    args: string[],
    options?: SpawnOptions,
    longRunning = false,
) =>
    new Promise<ChildProcess>((resolve, reject) => {
        log.info(`[pwt] ${command} ${args.join(' ')}`)

        const proc = spawn(command, args, options)

        proc.on('exit', code => {
            if (code === 0) {
                resolve(proc)
            } else {
                reject(code)
            }
        })

        proc.on('error', err => reject(err))

        if (longRunning) {
            setTimeout(() => resolve(proc), 1000)
        }

        childProcesses.push(proc)
    })

export const forkPromise = (
    log: Logger,
    command: string,
    args: string[],
    options?: ForkOptions,
    longRunning = false,
) =>
    new Promise<ChildProcess>((resolve, reject) => {
        log.info(
            `[pwt] node ${
                options && options.execArgv ? `${options.execArgv.join(' ')} ` : ''
            }${command} ${args.join(' ')}`,
        )

        const proc = fork(command, args, options)

        proc.on('exit', code => {
            if (code === 0) {
                resolve(proc)
            } else {
                reject(code)
            }
        })

        proc.on('error', err => reject(err))

        if (longRunning) {
            setTimeout(() => resolve(proc), 1000)
        }

        childProcesses.push(proc)
    })
