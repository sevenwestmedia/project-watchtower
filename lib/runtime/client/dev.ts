// TODO Should this be a plugin?
/**
 * CSS hot reloading with ExtractTextWebpack plugin
 * https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-284301283
 */
export function cssHotReload() {
    window.setTimeout(() => {
        const reporter = (window as any).__webpack_hot_middleware_reporter__

        if (!reporter || !reporter.success) {
            // tslint:disable-next-line:no-console
            console.error('Error enabling hot reloading for CSS!')
        } else {
            const originalSuccess = reporter.success

            reporter.success = (...args: any[]) => {
                const linkNodes = document.getElementsByTagName('link')
                let linkNode: HTMLLinkElement | undefined

                // can't use for-of because it is not an array
                // tslint:disable-next-line prefer-for-of
                for (let i = 0; i < linkNodes.length; i++) {
                    const node = linkNodes[i]
                    if (node.href.indexOf('/main') !== -1) {
                        linkNode = node
                        break
                    }
                }

                if (!linkNode) {
                    // tslint:disable-next-line:no-console
                    console.error('Error in CSS hot reload: link element not found!')
                } else {
                    const parentNode = linkNode.parentNode as Node
                    const nextStyleHref = linkNode.href.replace(/(\?\d+)?$/, `?${Date.now()}`)
                    const newLink = linkNode.cloneNode() as HTMLLinkElement
                    newLink.href = nextStyleHref

                    parentNode.appendChild(newLink)

                    // defer removing the old style to prevent flash of unstyled content
                    setTimeout(() => parentNode.removeChild(linkNode as HTMLLinkElement), 1000)
                }

                originalSuccess.apply(reporter, args)
            }
        }
    })
}
