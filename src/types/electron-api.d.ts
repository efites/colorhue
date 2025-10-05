export {}

declare global {
	interface Window {
		electronAPI?: {
			minimizeWindow: () => void
			resizeWindow: (width: number, height: number) => void
			closeWindow: () => void

			getColor: (x: number, y: number) => Promise<string>
			getScreenshot: (x: number, y: number, size?: number) => Promise<string>
			getPickerData: (x: number, y: number) => Promise<{color: string; image: string}>
			openPicker: () => Promise<{color: string; image: string}>
			closePicker: (data?: any) => void
		}
	}
}
