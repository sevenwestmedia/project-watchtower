// tslint:disable:max-classes-per-file
// tslint:disable:variable-name

/**
 * Error type which indicates an error which is well understood and
 * can be used to downgrade log levels to info level
 */
export class Information extends Error {
    // tslint:disable-next-line:variable-name
    __proto__: Information
    isInformation = true

    constructor(message: string) {
        super(message)

        // This is required to make `err instanceof Information` work
        this.constructor = Information
        this.__proto__ = Information.prototype
        this.name = 'Information'
    }
}

/**
 * Error type which indicates a warning, can be used to downgrade log levels
 * when errors are caught
 */
export class Warning extends Error {
    __proto__: Warning
    isWarning = true

    constructor(message: string) {
        super(message)

        // This is required to make `err instanceof Warning` work
        this.constructor = Warning
        this.__proto__ = Warning.prototype
        this.name = 'Warning'
    }
}

export class Status404Error extends Information {
    __proto__: Status404Error

    constructor() {
        super('404')

        // This is required to make `err instanceof Status404Error` work
        this.constructor = Status404Error
        this.__proto__ = Status404Error.prototype
        this.name = 'Status404Error'
    }
}
