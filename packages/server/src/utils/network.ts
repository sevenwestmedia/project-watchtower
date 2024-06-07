import net from 'net'

export function waitForConnection(port: number, timeout = 30000) {
    return Promise.race([
        new Promise((resolve) => {
            const connect = () => {
                const socket = net.connect({ port }, () => {
                    socket.end()
                    resolve({})
                })
                socket.on('error', () => {
                    setTimeout(connect, 2000)
                })
            }
            connect()
        }),
        new Promise((resolve) => setTimeout(() => resolve({}), timeout)),
    ])
}

const startPort = 3000

export function checkPortAvailability(port: number) {
    return new Promise((resolve, reject) => {
        const server = net.createServer()

        server.on('error', () => reject())

        server.listen(port, () => {
            server.once('close', () => resolve({}))
            server.close()
        })
    })
}

export async function findFreePort(useStartPort?: number) {
    const testPort = useStartPort || startPort

    for (let i = 0; i < 100; i++) {
        try {
            const port = testPort + i
            await checkPortAvailability(port)
            return port
        } catch (e) {
            // do nothing
        }
    }

    throw new Error('Could not find a free port within 100 tries!')
}
