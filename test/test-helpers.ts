export const expectPromiseToFail = (promise: Promise<any>) => (
    new Promise((resolve, reject) => {
        promise
            .then(() => reject('Promise was meant to fail!'))
            .catch(() => resolve())
    })
)
