export type TrackedPromise = PromiseLike<any>

export class PromiseTracker {
    promises: TrackedPromise[] = []

    track(promise: PromiseLike<any>) {
        this.promises.push(promise)
    }

    untrack(promise: PromiseLike<any>) {
        const index = this.promises.indexOf(promise)
        if (index === -1) {
            return
        }
        this.promises.splice(index, 1)
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
        return this.promises.length > 0
    }

    waitForCompletion() {
        const all = Promise.all([...this.promises])
            // Use setTimeout to put the resolution of this
            //  promise back onto the event loop, this can fix
            //  issues where tests have not re-rendered before
            //  trying to find elements
            .then(() => new Promise(setTimeout))
        this.promises = []
        return all
    }
}
