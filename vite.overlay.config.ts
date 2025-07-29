import path from 'node:path'
import {defineConfig} from 'vite'


export default defineConfig({
	base: './',
	build: {
		outDir: path.resolve(__dirname, '.vite/build'),
		emptyOutDir: true,
		rollupOptions: {
			input: { // Path to html file
				picker: path.resolve(__dirname, 'src/renderer/overlays/picker.html')
			},
			output: {
				entryFileNames: 'assets/[name].js',
				assetFileNames: 'assets/[name].[ext]'
			}
		}
	},
})
