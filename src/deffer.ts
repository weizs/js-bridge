export class Deffer<T = any> {
    readonly promise: Promise<T>
    resolve!: (res: any) => any
    reject!: (err: any) => any

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }

    static create() {
        return new Deffer()
    }
}
