import * as Helm from 'react-helmet'
import { RenderMarkup } from './render-app-to-string'

export enum ServerRenderResultType {
    Success,
    Failure,
    Redirect,
    PageNotFound,
}
export interface ServerRenderResultBase {
    type: ServerRenderResultType
    elapsed: string
    head: Helm.HelmetData | undefined
}
export interface StatusServerRenderResult<SSRRequestProps extends object>
    extends ServerRenderResultBase {
    type: ServerRenderResultType.Success
    renderedContent: RenderMarkup
    ssrRequestProps: SSRRequestProps
    statusCode: number
}

export interface FailedRenderResult extends ServerRenderResultBase {
    type: ServerRenderResultType.Failure
    errorMessage: string
}

export interface RedirectServerRenderResult extends ServerRenderResultBase {
    type: ServerRenderResultType.Redirect
    redirectTo: string
    isPermanent: boolean
}

export type ServerRenderResult<T extends object> =
    | StatusServerRenderResult<T>
    | FailedRenderResult
    | RedirectServerRenderResult
