import { HelmetData } from 'react-helmet'

export enum ServerRenderResultType {
    Success,
    Failure,
    Redirect,
    PageNotFound,
}
export interface ServerRenderResultBase {
    type: ServerRenderResultType
    elapsed: string
    head: HelmetData | undefined
}
export interface StatusServerRenderResult<SSRRequestProps extends object, RenderResult>
    extends ServerRenderResultBase {
    type: ServerRenderResultType.Success
    renderedContent: RenderResult
    ssrRequestProps: SSRRequestProps
    /** The final render location */
    renderLocation: string
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

export type ServerRenderResult<T extends object, RenderResult> =
    | StatusServerRenderResult<T, RenderResult>
    | FailedRenderResult
    | RedirectServerRenderResult
