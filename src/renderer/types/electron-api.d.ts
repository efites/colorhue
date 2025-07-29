export {}

declare global {
	interface Window {
		electronAPI?: {
			openPicker: () => {color: string; image: string | undefined}
			captureArea: (x: number, y: number) => void
			pickColor: () => {color: string; image: string | undefined}
			minimizeWindow: () => void
			closeWindow: () => void
			resizeWindow: (width: number, height: number) => void
			captureArea: (x: number, y: number) => string
		}
	}
}
