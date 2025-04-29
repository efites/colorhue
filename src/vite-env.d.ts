/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MODE: 'dev' | 'prod'
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
