import {IColor, PipetteCapture} from '@/types/picker'
import {invoke as tauriInvoke} from '@tauri-apps/api/core'
import {Window} from '@tauri-apps/api/window'

type WindowName = 'picker'

type TauriCommands = {
	minimize_window: {args: undefined; return: void}
	exit_app: {args: undefined; return: void}
	set_window_size: {args: {window: Window; width: number; height: number}; return: void}
	show_window: {args: {window: Window}; return: void}
	create_overlay: {args: {windowName: WindowName}; return: void}
	update_capture_limits: {args: {minSize: number; maxSize: number}; return: void}
	start_capture_stream: {
		args: {windowName: WindowName; fps: number; size: number; format: IColor['format']}
		return: void
	}
	update_capture_size: {args: {size: number}; return: void}
	send_cursor_position: {args: {x: number; y: number; size: number}; return: void}
	close_overlay: {args: {windowName: WindowName}; return: void}
	stop_capture_stream: {args: undefined; return: void}
	capture_cursor_area: {
		args: {x: number; y: number; size: number; format: IColor['format']}
		return: PipetteCapture
	}
}

export const invoke = <K extends keyof TauriCommands>(
	command: K,
	...args: TauriCommands[K]['args'] extends undefined
		? [] // Если аргументов нет, ничего не передаем
		: [TauriCommands[K]['args']] // Если есть, требуем объект аргументов
): Promise<TauriCommands[K]['return']> => {
	// Tauri gets args like second param
	return tauriInvoke(command, args[0])
}
