import { MessageBody } from './types.ts'

export function catchError<T>(fn: () => T, defaultValue: T): T {
    try {
        return fn() || defaultValue
    } catch (e) {
        return defaultValue
    }
}

export function serialize(data: Record<string, any>, defaultValue?: string): string {
    return catchError(() => JSON.stringify(data), defaultValue || '')
}

export function deserialize(data: string, defaultValue?: MessageBody): MessageBody {
    return catchError(() => JSON.parse(data), defaultValue || {})
}

export function uniqueIdCreator(...args: string[]): () => string {
    let i = 0
    const prefix = args.join('.')
    return () => [prefix, i++].join('_')
}
