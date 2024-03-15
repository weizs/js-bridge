import { JsBridge } from './src/js-bridge'

export default JsBridge.create({
    postMessage: function (message: string) {
        // @ts-ignore
        (window as Record<string, any>).ReactNativeWebView?.postMessage(message)
    }
})
