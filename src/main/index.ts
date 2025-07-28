import {config} from 'dotenv'
import {app} from 'electron'
import started from 'electron-squirrel-startup'

import {initIPC} from './ipc'
import {initWindows} from './windows'

config()

if (started) {
	app.quit()
}

initWindows()
initIPC()
