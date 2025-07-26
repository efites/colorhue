import {config} from 'dotenv'
import {app, BrowserWindow, ipcMain} from 'electron'
import started from 'electron-squirrel-startup'
import path from 'node:path'
import process from 'node:process'


config()

if (started) {
	app.quit()
}

let mainWindow: BrowserWindow | null = null

ipcMain.on('minimize-window', () => {
	if (mainWindow) {
		mainWindow.minimize()
	}
})

ipcMain.on('resize-window', (event, width, height) => {
	if (mainWindow) {
		console.log('resize')
		mainWindow.setSize(width, height)
	}
})

ipcMain.on('close-window', () => {
	if (mainWindow) {
		mainWindow.close()
	}
})

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 800,
		transparent: true,
		frame: false,
		resizable: process.env.VITE_MODE === 'dev',
		useContentSize: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		}
	})

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	if (process.env.VITE_MODE === 'dev') {
		mainWindow.webContents.openDevTools()
	}
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
