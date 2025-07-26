const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	closeWindow: () => ipcRenderer.send('close-window'),
	resizeWindow: (width, height) => ipcRenderer.send('resize-window', width, height),
})
