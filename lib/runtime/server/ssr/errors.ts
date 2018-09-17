export class Status404Error extends Error {
    // tslint:disable-next-line:variable-name
    __proto__: Status404Error
    constructor() {
        super('404')

        // This is required to make `err instanceof Status404Error work
        this.constructor = Status404Error
        this.__proto__ = Status404Error.prototype
        this.name = 'Status404Error'
    }
}
