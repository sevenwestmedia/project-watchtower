export const getTimeMs = () => {
    const hrtime = process.hrtime()
    return hrtime[0] * 1000 + hrtime[1] / 1000000
}

export const delay = (ms = 1000) =>
    new Promise((resolve) => setTimeout(() => resolve(), ms))

export const formatTimeMs = (ms: number) => ms.toFixed(0)
