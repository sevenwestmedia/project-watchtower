import { spawn, fork } from 'child_process'

export const spawnPromise = (command: string, args: string[]) => (
    new Promise((resolve, reject) => {
        const proc = spawn(command, args)

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

export const forkPromise = (command: string, args: string[]) => (
    new Promise((resolve, reject) => {
        const proc = fork(command, args)

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
