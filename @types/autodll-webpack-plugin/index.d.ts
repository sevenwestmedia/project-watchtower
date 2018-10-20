declare module 'autodll-webpack-plugin' {
    import { Plugin, compilation } from 'webpack'
    export = AutoDllPlugin

    declare class AutoDllPlugin extends Plugin {
        constructor(options?: AutoDllPlugin.Options)
    }

    declare namespace AutoDllPlugin {
        interface Options {
            inject: boolean
            debug: boolean
            filename: string
            path: string
            entry: Object
        }
    }
}
