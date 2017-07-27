declare module 'glamor' {
    export function rehydrate(ids: string[]): void
}

declare module 'glamor/server' {
    import * as React from 'react'

    export interface GlamorServerResult {
        html: string
        css: string
        ids: string[]
    }

    export function renderStatic(fn: () => string): GlamorServerResult
    export function renderStaticOptimized(fn: () => string): GlamorServerResult
}
