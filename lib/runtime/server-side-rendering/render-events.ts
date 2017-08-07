import { PromiseTracker } from '../server'

export interface WatchtowerEvents {
    beginWaitingForTasks?: (elapsed: string) => void
    // Hook to register additional work with the promise tracker after a render
    renderPerformed?: (promiseTracker: PromiseTracker) => void
}
