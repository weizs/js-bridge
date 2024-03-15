import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig((_) => {
    return {
        build: {
            emptyOutDir: false,
            lib: {
                entry: resolve(__dirname, 'index.web.ts'),
                name: 'ReactNativeWebViewBridge',
                formats: ['es', 'cjs', 'umd'],
                fileName: 'web'
            }
        }
    }
})
