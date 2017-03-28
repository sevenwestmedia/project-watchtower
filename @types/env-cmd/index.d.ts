declare module "env-cmd" {
    import * as child_process from 'child_process'
    export function EnvCmd(args: string[]): child_process.ChildProcess
}
