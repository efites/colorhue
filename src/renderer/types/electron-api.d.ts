export {}

declare global {
	interface Window {
		electronAPI?: {
			pickColor: () => {color: string; image: string | undefined}
			minimizeWindow: () => void
			closeWindow: () => void
			resizeWindow: (width: number, height: number) => void
		}
	}
}
