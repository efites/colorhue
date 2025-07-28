export {}

declare global {
	interface Window {
		electronAPI?: {
			pickColor: () => {color: string; image: string}
			minimizeWindow: () => void
			closeWindow: () => void
			resizeWindow: (width: number, height: number) => void
		}
	}
}
