export function getDisplayName(WrappedComponent: React.ComponentType<any> & { name?: string }) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
