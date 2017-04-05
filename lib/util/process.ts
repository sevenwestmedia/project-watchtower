import { fork, ForkOptions, spawn, SpawnOptions, ChildProcess } from 'child_process'

export const spawnPromise = (
    command: string,
    args: string[],
    options?: SpawnOptions,
    longRunning = false,
) => (
    new Promise<ChildProcess>((resolve, reject) => {
        const proc = spawn(command, args, options)

        proc.on('exit', (code) => {
            if (code === 0) {
                resolve(proc)
            } else {
                reject(code)
            }
        })

        proc.on('error', (err) => reject(err))

        if (longRunning) {
            setTimeout(() => resolve(proc), 1000)
        }
    })
)

export const forkPromise = (
    command: string,
    args: string[],
    options?: ForkOptions,
    longRunning = false,
) => (
    new Promise<ChildProcess>((resolve, reject) => {
        const proc = fork(command, args, options)

        proc.on('exit', (code) => {
            if (code === 0) {
                resolve(proc)
            } else {
                reject(code)
            }
        })

        proc.on('error', (err) => reject(err))

        if (longRunning) {
            setTimeout(() => resolve(proc), 1000)
        }
    })
)
