import {useEffect, useRef} from 'react'

export const useWindowResize = () => {
	const contentRef = useRef<HTMLDivElement>(null)
	const isInitialized = useRef(false)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const {width, height} = entry.contentRect

				const windowWidth = Math.ceil(width)
				const windowHeight = Math.ceil(height)

				// Добавляем небольшую задержку для первого изменения размера
				const delay = isInitialized.current ? 0 : 50

				// Очищаем предыдущий таймер, если он был
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}

				timeoutRef.current = setTimeout(() => {
					window.electronAPI?.resizeWindow(windowWidth, windowHeight)
					isInitialized.current = true
				}, delay)
			}
		})

		if (contentRef.current) {
			resizeObserver.observe(contentRef.current)
		}

		return () => {
			resizeObserver.disconnect()
		}
	}, [])

	return contentRef
}
