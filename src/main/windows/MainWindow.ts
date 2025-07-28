import {BrowserWindow} from 'electron'
import path from 'node:path'
import process from 'node:process'

export const createMainWindow = () => {
	const isDev = process.env.VITE_MODE === 'dev'

	const window = new BrowserWindow({
		width: 1200,
		height: 800,
		transparent: !isDev,
		frame: isDev,
		resizable: isDev,
		useContentSize: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	})

	if (isDev) {
		window.webContents.openDevTools()
	}

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	return window
}
