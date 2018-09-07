/**
 * Returns the state transferred by the transferState function
 * @param key The key to use to read the state
 */
export function getTransferredState<T = any>(key: string) {
    return typeof window !== 'undefined' ? ((window as any)[key] as T) : undefined
}
