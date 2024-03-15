import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFile } from 'fs/promises'

export default defineConfig(() => {
    const files: string[] = []
    return {
        build: {
            emptyOutDir: false,
            lib: {
                entry: resolve(__dirname, 'index.text.ts'),
                name: 'ReactNativeWebViewBridge',
                formats: ['es', 'cjs'],
                fileName: 'text'
            }
        },
        plugins: [
            {
                name: 'plugin:load-text',
                resolveId: {
                    order: 'pre',
                    handler(id: string) {
                        if (id.endsWith('?type=text')) {
                            const file = resolve(id.replace(/\?type=text$/, ''))
                            files.push(file)
                            return {
                                id: file
                            }
                        }
                    }
                },
                async load(id: string) {
                    if (files.includes(id)) {
                        const code = await readFile(id)
                        return {
                            code: `export default ${JSON.stringify(code.toString())}`
                        }
                    }
                }
            }
        ]
    }
})
