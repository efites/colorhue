import {initPanelHandlers} from './panel'
import {initPickColor} from './pick-color'

export const initIPC = () => {
	initPanelHandlers()
	initPickColor()
}
