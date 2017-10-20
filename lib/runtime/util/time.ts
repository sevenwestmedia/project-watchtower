export const getTimeMs = () => {
    const hrtime = process.hrtime()
    return hrtime[0] * 1000 + hrtime[1] / 1000000
}

export const delay = (ms = 1000) => new Promise(resolve => setTimeout(() => resolve(), ms))

export const formatTimeMs = (ms: number) => ms.toFixed(0)

export const timeout = <P>(promise: Promise<P>, time: number): Promise<P> => {
    let timer: any // can't set to NodeJS.Timer because of webpack

    return Promise.race([
        promise,
        new Promise<P>((_resolve, reject) => {
            timer = setTimeout(() => reject(new Error(`Timeout after ${time} ms`)), time)
        })
    ]).then(result => {
        clearTimeout(timer)
        return result
    })
}
