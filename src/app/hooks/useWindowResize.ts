import {useCallback, useEffect, useRef} from 'react'
import {getCurrentWindow} from '@tauri-apps/api/window'
import {invoke} from '@tauri-apps/api/core'

export const useAutoWindowSize = () => {
	const contentRef = useRef<HTMLDivElement>(null)

	// Функция для установки размера окна по контенту
	const setWindowSize = useCallback(async () => {
		if (!contentRef.current) return

		try {
			const appWindow = getCurrentWindow()

			// Получаем размеры контента
			const {width, height} = contentRef.current.getBoundingClientRect()
			const windowWidth = Math.ceil(width)
			const windowHeight = Math.ceil(height)

			// Устанавливаем размер окна
			await invoke('set_window_size', {
				window: appWindow,
				width: windowWidth,
				height: windowHeight,
			})
			await invoke('show_window', {window: appWindow})

			return {width: windowWidth, height: windowHeight}
		} catch (error) {
			console.error('Failed to set window size:', error)
		}
	}, [])

	// Автоматическая установка размера при монтировании
	useEffect(() => {
		const initializeWindow = async () => {
			// Небольшая задержка для гарантии рендера контента
			// await new Promise(resolve => setTimeout(resolve, 10));
			await setWindowSize()
		}

		initializeWindow()
	}, [setWindowSize])

	// ResizeObserver для автоматического изменения размера при изменении контента
	useEffect(() => {
		const resizeObserver = new ResizeObserver(async entries => {
			for (const entry of entries) {
				await setWindowSize()
			}
		})

		if (contentRef.current) {
			resizeObserver.observe(contentRef.current)
		}

		return () => {
			resizeObserver.disconnect()
		}
	}, [setWindowSize])

	return {
		contentRef,
		setWindowSize,
	}
}
