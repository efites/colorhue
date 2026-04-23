import {useCallback, useRef} from 'react'

type onDrag = (x: number, y: number) => void
type onStop = () => void

export const useDraggable = (onDrag: onDrag, onStop?: onStop) => {
	const isDragging = useRef(false)

	const handleUpdate = useCallback(
		(e: MouseEvent | React.MouseEvent) => {
			onDrag(e.clientX, e.clientY)
		},
		[onDrag],
	)

	const startDrag = useCallback(
		(event: React.MouseEvent) => {
			isDragging.current = true
			handleUpdate(event)

			const onMouseMove = (ev: MouseEvent) => handleUpdate(ev)
			const onMouseUp = () => {
				isDragging.current = false
				onStop?.()
				window.removeEventListener('mousemove', onMouseMove)
				window.removeEventListener('mouseup', onMouseUp)
			}

			window.addEventListener('mousemove', onMouseMove)
			window.addEventListener('mouseup', onMouseUp)
		},
		[handleUpdate, onStop],
	)

	return {startDrag}
}
