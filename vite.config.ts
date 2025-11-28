import {defineConfig, loadEnv} from "vite"
import react from "@vitejs/plugin-react"
import path from 'node:path'
import {fileURLToPath} from 'node:url'


const host = process.env.TAURI_DEV_HOST

console.log('check', fileURLToPath(new URL('./src', import.meta.url)))
// https://vite.dev/config/
export default defineConfig(async ({mode}) => {
	const env = loadEnv(mode, process.cwd(), "")
	const appMode = env.VITE_ENV || mode
	process.env.VITE_ENV = appMode
	return ({
		plugins: [react()],

		// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
		//
		// 1. prevent Vite from obscuring rust errors
		clearScreen: false,
		// 2. tauri expects a fixed port, fail if that port is not available
		server: {
			port: 1420,
			strictPort: true,
			host: host || false,
			hmr: host
				? {
					protocol: "ws",
					host,
					port: 1421,
				}
				: undefined,
			watch: {
				// 3. tell Vite to ignore watching `src-tauri`
				ignored: ["**/src-tauri/**"],
			},
		},
		resolve: {
			alias: {
				'@/components': path.resolve(__dirname, './src', './components'),
				'@/shared': path.resolve(__dirname, './src', './shared'),
				'@/app': path.resolve(__dirname, './src', './app'),
				'@/types': path.resolve(__dirname, './src', './types'),
				'@/hooks': path.resolve(__dirname, './src', './app', './hooks'),
				'@': path.resolve(__dirname, './src')
			}
		}
	})
})
