export {}

declare global {
	interface Window {
		electronAPI?: {
			pickColor: () => string | null
			minimizeWindow: () => void
			closeWindow: () => void
			resizeWindow: (width: number, height: number) => void
		}
	}
}
