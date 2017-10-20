import { fork, ForkOptions, spawn, SpawnOptions, ChildProcess } from 'child_process'
import { log } from './log'

// make sure all child processes are killed when the process exits
// https://stackoverflow.com/questions/15833047/how-to-kill-all-child-processes-on-exit

let childProcesses: ChildProcess[] = []

const killAllChildProcesses = () => {
    childProcesses.forEach(proc => {
        try {
            proc.kill()
        } catch (err) {}
    })
    childProcesses = []
}

process.on('exit', killAllChildProcesses)

process.on('SIGINT', () => process.exit())
process.on('SIGTERM', () => process.exit())

export const spawnPromise = (
    command: string,
    args: string[],
    options?: SpawnOptions,
    longRunning = false,
) =>
    new Promise<ChildProcess>((resolve, reject) => {
        log(`[pwt] ${command} ${args.join(' ')}`)

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
    command: string,
    args: string[],
    options?: ForkOptions,
    longRunning = false,
) =>
    new Promise<ChildProcess>((resolve, reject) => {
        log(`[pwt] node ${command} ${args.join(' ')}`)

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
