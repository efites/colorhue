import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	pickColor: () => ipcRenderer.invoke('pick-color'),
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	closeWindow: () => ipcRenderer.send('close-window'),
	resizeWindow: (width: number, height: number) =>
		ipcRenderer.send('resize-window', width, height),
})
