import {action, atom} from '@reatom/core'
import {listen, UnlistenFn} from '@tauri-apps/api/event'
import {invoke} from '@/shared/helpers/tauri'
import ScreenFallback from '@/shared/images/screen.png'
import {initialColor} from './color'
import type {CursorPosition, IColor} from '@/types/picker'

export const pipettePickedColorAtom = atom<IColor>(initialColor, 'pipettePickedColorAtom')
export const pipetteImageAtom = atom<string>(ScreenFallback, 'pipetteImageAtom')

let unlistenCursorPosition: UnlistenFn | null = null

const cleanupCursorListener = () => {
	if (!unlistenCursorPosition) return
	unlistenCursorPosition()
	unlistenCursorPosition = null
}

const handlePipetteCapture = action(async (position: CursorPosition) => {
	try {
		const {x, y, size} = position
		const result = await invoke('capture_cursor_area', {
			x,
			y,
			size: size ?? 0,
			format: 'hex',
		})

		pipetteImageAtom.set(result.image || ScreenFallback)
		pipettePickedColorAtom.set(result)
	} catch (error) {
		console.error('Failed to capture area:', error)
	}
}, 'handlePipetteCapture')

export const pickColor = action(async () => {
	try {
		cleanupCursorListener()

		await invoke('create_overlay', {windowName: 'picker'})

		unlistenCursorPosition = await listen<CursorPosition>('send_cursor_position', event => {
			void handlePipetteCapture(event.payload)
		})
	} catch (error) {
		console.error('Failed to start color picker:', error)
		cleanupCursorListener()
	}
}, 'pickColor')
