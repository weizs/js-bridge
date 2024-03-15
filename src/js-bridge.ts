import type {
    CallbackMessageBody,
    EventMessageBody,
    InvokeFunction,
    InvokeMessageBody,
    JsBridgeOptions,
    PostMessage
} from './types.ts'
import { EventBus } from './event-bus.ts'
import { MessageType } from './enum.ts'
import { Deffer } from './deffer.ts'
import { deserialize, serialize, uniqueIdCreator } from './helper.ts'

/**
 * support
 * 1、rn -> webview, webview -> callback rn
 * 2、webview -> rn, rn -> callback webview
 * type
 * 1、call method, callback method
 * 2、listener event, dispatch event
 */
export class JsBridge extends EventBus {
    private readonly createId: () => string
    private readonly modules: Record<string, Record<string, InvokeFunction>> = {}
    private readonly postMessage: PostMessage

    private constructor(options: JsBridgeOptions) {
        super()
        if (!options || !options.postMessage) {
            throw new Error('options.postMessage is required')
        }
        this.postMessage = options.postMessage
        this.createId = uniqueIdCreator(options.name || JsBridge.name)
    }

    static create(options: JsBridgeOptions): JsBridge {
        return new JsBridge(options)
    }

    private callback(messageBody: InvokeMessageBody, error?: any, response?: any) {
        const message: CallbackMessageBody = {
            type: MessageType.CALLBACK,
            topicId: messageBody.topicId,
            error,
            response
        }
        this.postMessage(serialize(message))
    }

    private async onInvoke(messageBody: InvokeMessageBody) {
        const modules = this.modules
        const { module, action, payload = [] } = messageBody
        const mod = modules[module] || modules.default
        if (!mod) {
            return this.callback(messageBody, `module '${mod}' not support`)
        }
        if (!mod[action]) {
            return this.callback(messageBody, `method '${mod}.${action}' not support`)
        }
        try {
            const result = await mod[action](...payload)
            this.callback(messageBody, null, result)
        } catch (error: any) {
            this.callback(messageBody, error)
        }
    }

    async onMessage(message: string) {
        const messageBody = deserialize(message)
        const { type } = messageBody
        switch (type) {
            case MessageType.INVOKE:
                await this.onInvoke(messageBody)
                return
            case MessageType.CALLBACK:
                const { topicId, error, response } = messageBody
                this.emit(topicId, error, response)
                return
            case MessageType.EVENT:
                const { event, payload = [] } = messageBody
                this.emit(event, ...payload)
                return
        }
    }

    invoke<T>(module: string, action: string, ...payload: any[]): Promise<T> {
        const deffer = Deffer.create()
        const topicId = this.createId()
        this.once(topicId, (error: any, response: any) => {
            if (error) {
                deffer.reject(error)
            } else {
                deffer.resolve(response)
            }
        })
        const message: InvokeMessageBody = {
            type: MessageType.INVOKE,
            topicId,
            module,
            action,
            payload
        }
        this.postMessage(serialize(message))
        return deffer.promise
    }

    dispatchEvent(event: string, ...payload: any[]): any {
        const message: EventMessageBody = {
            type: MessageType.EVENT,
            event,
            payload
        }
        this.postMessage(serialize(message))
    }

    /**
     * 注册可用于 bridge 间调用的模块
     * @param nameOrModuleMap
     * @param module
     */
    registerModule(nameOrModuleMap: string | Record<string, any>, module?: Record<string, InvokeFunction>) {
        if (typeof nameOrModuleMap === 'string' && module) {
            this.modules[nameOrModuleMap] = module
        } else if (typeof nameOrModuleMap === 'object') {
            Object.entries(nameOrModuleMap).forEach(entries => this.registerModule(...entries))
        }
    }
}
