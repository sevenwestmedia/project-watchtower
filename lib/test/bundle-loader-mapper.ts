import * as React from 'react'

const component: any = () => React.createElement('div', {}, 'bundle-loader')
component.default = component

// This simulates the behaviour of bundle-loader
const moduleLoadFn = (cb: (module: any) => void) => cb(component)

module.exports = moduleLoadFn
