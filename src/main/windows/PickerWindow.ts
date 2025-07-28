import {BrowserWindow} from 'electron'

export const createPickerWindow = (width: number, height: number) => {
	return new BrowserWindow({
		width,
		height,
		transparent: true,
		frame: false,
		alwaysOnTop: true,
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	})
}
