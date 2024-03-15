import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig((_) => {
    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'index.ts'),
                name: 'JsBridge',
                formats: ['es', 'cjs'],
                fileName: 'native'
            }
        }
    }
})
