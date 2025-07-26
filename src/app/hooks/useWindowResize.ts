import {useCallback, useEffect, useRef} from 'react'

export const useWindowResize = () => {
	const contentRef = useRef<HTMLDivElement>(null)
	const isInitialized = useRef(false)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const resizeObserverRef = useRef<ResizeObserver | null>(null)

	// Функция для принудительного перерасчёта
	const resize = useCallback(() => {
		if (!contentRef.current) return

		const {width, height} = contentRef.current.getBoundingClientRect()
		const windowWidth = Math.ceil(width)
		const windowHeight = Math.ceil(height)

		window.electronAPI?.resizeWindow(windowWidth, windowHeight)
	}, [])

	useEffect(() => {
		resizeObserverRef.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const {width, height} = entry.contentRect
				const windowWidth = Math.ceil(width)
				const windowHeight = Math.ceil(height)

				const delay = isInitialized.current ? 0 : 50

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
			resizeObserverRef.current.observe(contentRef.current)
		}

		return () => {
			resizeObserverRef.current?.disconnect()
		}
	}, [])

	return {
		contentRef,
		resize
	}
}
