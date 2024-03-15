import { CallbackFunction } from './types.ts'

export class EventBus {
    private readonly events: Record<string, CallbackFunction[]> = {}

    emit(event: string, ...args: any[]) {
        const fns = this.events[event] || []
        for (let fn of fns) {
            fn(...args)
        }
    }

    on(event: string, fn: CallbackFunction) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(fn)
        return () => this.off(event, fn)
    }

    once(event: string, fn: CallbackFunction) {
        const off = this.on(event, (...args: any[]) => {
            const res = fn(...args)
            off()
            return res
        })
        return off
    }

    off(event: string, fn?: CallbackFunction) {
        if (event) {
            const fns = this.events[event] || []
            if (fn) {
                const index = fns.indexOf(fn)
                if (index > -1) {
                    fns.splice(index, 1)
                }
            } else {
                this.events[event] = []
            }
        } else {
            for (let eventsKey in this.events) {
                delete this.events[eventsKey]
            }
        }
    }
}
