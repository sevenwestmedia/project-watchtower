import * as React from 'react'
import { PageLifecycle } from './PageLifecycle'
import { PageLifecycleProps } from './withPageLifecycle'

export class ComponentWithLifecycle<P, S> extends React.Component<P & PageLifecycleProps, S> {
    context: {
        pageLifecycle: PageLifecycle
    }
}
