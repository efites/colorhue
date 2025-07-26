import {app, BrowserWindow, ipcMain} from 'electron'
import started from 'electron-squirrel-startup'
import path from 'node:path'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit()
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('minimize-window', () => {
	if (mainWindow) {
		mainWindow.minimize();
	}
});

// Обработчик IPC для изменения размера окна
ipcMain.on('resize-window', (event, width, height) => {
	if (mainWindow) {
		mainWindow.setSize(width, height);
	}
});

// Обработчик IPC для закрытия окна
ipcMain.on('close-window', () => {
	if (mainWindow) {
		mainWindow.close();
	}
});

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 600,
		height: 700,
		transparent: true,
		frame: false,
		resizable: true, // Запрещаем пользователю изменять размеры
		useContentSize: true, // Размеры окна будут основаны на размерах контента
		backgroundMaterial: 'acrylic', // или 'blurbehind'
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'), // путь к вашему preload-скрипту
			contextIsolation: true,
			nodeIntegration: false,
		}
	})

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	// Open the DevTools.
	if (process.env.VITE_MODE === 'dev') {
		mainWindow.webContents.openDevTools()
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
