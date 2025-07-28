export {}

declare global {
	interface Window {
		electronAPI?: {
			openPicker: () => {color: string; image: string}
			captureArea: (x: number, y: number) => string
			pickColor: () => {color: string; image: string | undefined}
			minimizeWindow: () => void
			closeWindow: () => void
			resizeWindow: (width: number, height: number) => void
			captureArea: (x: number, y: number) => string
		}
	}
}
