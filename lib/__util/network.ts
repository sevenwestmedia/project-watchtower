import * as net from 'net'

export const waitForConnection = (port: number) => (
    new Promise((resolve) => {
        const connect = () => {
            const socket = net.connect({ port }, () => {
                socket.end()
                resolve()
            })
            socket.on('error', () => {
                setTimeout(connect, 2000)
            })
        }
        connect()
    })
)
