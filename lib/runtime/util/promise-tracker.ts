export type TrackedPromise = PromiseLike<any>

export class PromiseTracker {
    private waitIndex = 1
    private promises: {
        [waitIndex: number]: TrackedPromise[]
    } = {}

    track(promise: PromiseLike<any>) {
        const currentWaitIndex = this.waitIndex
        if (!this.promises[currentWaitIndex]) {
            this.promises[currentWaitIndex] = []
        }
        this.promises[currentWaitIndex].push(promise)
    }

    middleware() {
        return () => (next: (action: any) => any) => (action: any) => {
            const result = next(action)
            // Promise.resolve must return the same promise if the arg is a promise
            // http://www.ecma-international.org/ecma-262/6.0/#sec-promise.resolve
            if (Promise.resolve(result) === result) {
                this.track(result)
            }
            return result
        }
    }

    hasWork() {
        if (!this.promises[this.waitIndex]) {
            return false
        }

        return this.promises[this.waitIndex].length > 0
    }

    waitForCompletion() {
        if (!this.hasWork()) {
            return Promise.resolve()
        }

        const all = Promise.all([...this.promises[this.waitIndex++]])
            // Use setTimeout to put the resolution of this
            //  promise back onto the event loop, this can fix
            //  issues where tests have not re-rendered before
            //  trying to find elements
            .then(() => new Promise(setTimeout))
        return all
    }
}
