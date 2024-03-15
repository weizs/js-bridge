import { MessageType } from './enum.ts'

export interface PostMessage {
    (message: string): void
}

export interface InvokeMessageBody {
    type: MessageType.INVOKE
    topicId: string
    module: string
    action: string
    payload?: any[]
}

export interface CallbackMessageBody {
    type: MessageType.CALLBACK
    topicId: string
    error?: any
    response?: any
}

export interface EventMessageBody {
    type: MessageType.EVENT
    event: string
    payload?: any[]
}

export type MessageBody = InvokeMessageBody | CallbackMessageBody | EventMessageBody

export interface InvokeFunction {
    (...args: any[]): any
}

export interface CallbackFunction {
    (...args: any[]): any
}

export interface JsBridgeOptions {
    name?: string

    postMessage(message: string): void
}
