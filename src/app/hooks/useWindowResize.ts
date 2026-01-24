import {useCallback, useEffect, useRef} from 'react'
import {getCurrentWindow, LogicalSize} from '@tauri-apps/api/window'
// import {invoke} from '@/shared/helpers/tauri'

export const useAutoWindowSize = () => {
	const contentRef = useRef<HTMLDivElement>(null)

	const setWindowSize = useCallback(async () => {
		if (!contentRef.current) return

		// Проверка: запущены ли мы внутри Tauri
		// @ts-ignore
		if (!window.__TAURI_INTERNALS__) {
			console.warn('Tauri API not found. Are you running in a browser?')
			return
		}

		try {
			const appWindow = getCurrentWindow()

			// 1. Получаем реальные размеры контента
			const {width, height} = contentRef.current.getBoundingClientRect()

			// Добавляем небольшой запас (по желанию), чтобы не было полос прокрутки
			const windowWidth = Math.ceil(width)
			const windowHeight = Math.ceil(height)

			// 2. Используем встроенный метод setSize вместо invoke
			// Мы используем LogicalSize, чтобы на Retina/4K мониторах размер был корректным
			await appWindow.setSize(new LogicalSize(windowWidth, windowHeight))

			// Показываем окно, если оно было скрыто при запуске
			await appWindow.show()

		} catch (error) {
			console.error('Failed to set window size:', error)
		}
	}, [])

	useEffect(() => {
		// Используем ResizeObserver, чтобы окно адаптировалось,
		// если контент изменится динамически (например, открылся список)
		if (!contentRef.current) return

		const resizeObserver = new ResizeObserver(() => {
			setWindowSize()
		})

		resizeObserver.observe(contentRef.current)

		return () => resizeObserver.disconnect()
	}, [setWindowSize])

	return {
		contentRef,
		setWindowSize,
	}
}
