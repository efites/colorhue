import {BrowserWindow, screen} from 'electron'
import process from 'node:process'

export const createPickerWindow = () => {
	const {width, height} = screen.getPrimaryDisplay().workAreaSize
	const isDev = process.env.VITE_MODE === 'dev'

	return new BrowserWindow({
		width,
		height,
		transparent: !isDev,
		frame: isDev,
		alwaysOnTop: !isDev,
		resizable: isDev,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	})
}
