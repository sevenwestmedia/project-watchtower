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
        lhr: {
            lighthouseVersion: string
            generatedTime: string
            initialUrl: string
            url: string
            audits: {
                [key: string]: Audit
            }
            runtimeConfig: any
            aggregations: any[]
            score: number
            categories: { [key: string]: ReportCategory }
        }
        artifacts: any
        report: string
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

    interface ReportCategory {
        name: string
        description: string
        audits: any
        id: string
        score: number
    }

    type Lighthouse = (
        url: string,
        flags: LighthouseFlags,
        config?: object | null,
    ) => LighthouseResults

    interface ChromeLauncher {
        port: number
        kill(): Promise<void>
    }
}

declare module 'lighthouse' {
    const main: Lighthouse.Lighthouse
    export = main
}
