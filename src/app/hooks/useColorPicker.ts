import {useCallback, useEffect, useRef, useState} from 'react'
import {listen, UnlistenFn} from '@tauri-apps/api/event'
import ScreenFallback from '../../shared/images/screen.png'
import {invoke} from '@/shared/helpers/tauri'
import {initialColor} from '@/app/model/color'

import type {CursorPosition, IColor, PipetteCapture} from '../../types/picker'

export function useColorPicker() {
	const [pickedColor, setPickedColor] = useState<IColor>(initialColor)
	const [image, setImage] = useState<PipetteCapture['image']>(ScreenFallback)

	const unlistenRef = useRef<UnlistenFn | null>(null)

	// 1. Очистка слушателей (выносим, чтобы не дублировать)
	const cleanupListener = useCallback(() => {
		if (unlistenRef.current) {
			unlistenRef.current()
			unlistenRef.current = null
		}
	}, [])

	// Очистка при размонтировании компонента
	useEffect(() => () => cleanupListener(), [cleanupListener])

	// 2. Логика обработки координат (Выделенная ответственность)
	// Эта функция знает ТОЛЬКО как получить данные по координатам и обновить стейт
	const handleCursorCapture = useCallback(async (position: CursorPosition) => {
		try {
			const {x, y, size} = position

			const result = await invoke('capture_cursor_area', {
				x,
				y,
				size: size ?? 0, // Убедимся, что size всегда number
				format: 'hex',
			})

			// Обновляем состояние батчем (React 18+ делает это автоматически)
			setImage(result.image || ScreenFallback)
			setPickedColor(result)
		} catch (err) {
			// Логируем ошибку, но не ломаем приложение, так как это стрим событий
			console.error('Failed to capture area:', err)
		}
	}, [])

	// 3. Инициализация (Точка входа)
	// Эта функция занимается ТОЛЬКО запуском процесса и связыванием событий
	const pickColor = useCallback(async () => {
		try {
			// Сначала убиваем старые подписки, если были
			cleanupListener()

			await invoke('create_overlay', {windowName: 'picker'})

			// Подписываемся, передавая управление в handleCursorCapture
			const unlisten = await listen<CursorPosition>('send_cursor_position', event => {
				handleCursorCapture(event.payload)
			})

			unlistenRef.current = unlisten
		} catch (err) {
			console.error('Failed to start color picker:', err)
			cleanupListener() // Страховка: чистим, если инициализация упала
		}
	}, [cleanupListener, handleCursorCapture])

	return {
		pickedColor,
		image,
		pickColor,
	}
}
