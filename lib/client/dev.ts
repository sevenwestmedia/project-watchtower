/**
 * CSS hot reloading with ExtractTextWebpack plugin
 * https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-284301283
 */
export function cssHotReload() {
    window.setTimeout(() => {
        const reporter = (window as any).__webpack_hot_middleware_reporter__

        if (!reporter || !reporter.success) {
            console.error('Error enabling hot reloading for CSS!')
        } else {
            const originalSuccess = reporter.success

            reporter.success = (...args: any[]) => {
                const linkNode = document.getElementById('css-main') as HTMLLinkElement

                if (!linkNode) {
                    console.error('Error in CSS hot reload: link element not found!')
                } else {
                    const parentNode = linkNode.parentNode as Node
                    const nextStyleHref = linkNode.href.replace(/(\?\d+)?$/, `?${Date.now()}`)
                    const newLink = linkNode.cloneNode() as HTMLLinkElement
                    newLink.href = nextStyleHref

                    parentNode.appendChild(newLink)

                    // defer removing the old style to prevent flash of unstyled content
                    setTimeout(() => parentNode.removeChild(linkNode), 1000)
                }

                originalSuccess.apply(reporter, args)
            }
        }
    })
}
