import { fork, ForkOptions, spawn, SpawnOptions } from 'child_process'

export const spawnPromise = (command: string, args: string[], options?: SpawnOptions) => (
    new Promise((resolve, reject) => {
        const proc = spawn(command, args, options)

        proc.on('exit', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(code)
            }
        })

        proc.on('error', (err) => reject(err))
    })
)

export const forkPromise = (command: string, args: string[], options?: ForkOptions) => (
    new Promise((resolve, reject) => {
        const proc = fork(command, args, options)

        proc.on('exit', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(code)
            }
        })

        proc.on('error', (err) => reject(err))
    })
)
