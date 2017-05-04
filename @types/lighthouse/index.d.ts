declare namespace Lighthouse {

    interface LighthouseFlags {
        output?: 'html' | 'json'
        port?: number
        skipAutolaunch?: boolean
        disableDeviceEmulation?: boolean
        disableNetworkThrottling?: boolean
        disableCpuThrottling?: boolean
        blockedUrlPatterns?: string[]
        logLevel?: string
        pauseAfterLoad?: number
        maxWaitForLoad?: number
    }

    interface LighthouseResults {
        lighthouseVersion: string
        generatedTime: string
        initialUrl: string
        url: string
        audits: {
            [key: string]: Audit
        }
        artifacts: any
        runtimeConfig: any
        aggregations: any[]
    }

    interface Audit {
        score: number | boolean
        displayValue: string
        rawValue: number | boolean
        error?: any
        debugString?: string
        optimalValue?: string
        extendedInfo?: any
        informative?: any
        name: string
        category: string
        description: string
        helpText: string
    }

    type Lighthouse = (
        url: string,
        flags: LighthouseFlags,
        config: object,
    ) => LighthouseResults

    interface ChromeLauncherOptions {

    }

    interface ChromeLauncherConstructor {
        new(options: ChromeLauncherOptions): ChromeLauncher
    }

    interface ChromeLauncher {
        isDebuggerReady(): Promise<void>
        run(): Promise<void>
        kill(): Promise<void>
        TMP_PROFILE_DIR: string | undefined
    }

}

declare module "lighthouse" {
    const main: Lighthouse.Lighthouse
    export = main
}

declare module "lighthouse/lighthouse-cli/chrome-launcher" {
    export const ChromeLauncher: Lighthouse.ChromeLauncherConstructor
}
