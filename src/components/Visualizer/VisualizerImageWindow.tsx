import clsx from 'clsx'
import {MouseEvent, RefObject} from 'react'
import styles from './Visualizer.module.scss'

interface VisualizerImageWindowProps {
	image: string
	crossX: number
	crossY: number
	imgRef: RefObject<HTMLImageElement | null>
	canvasRef: RefObject<HTMLCanvasElement | null>
	onLoad: () => void
	onMouseDown: (event: MouseEvent<HTMLDivElement>) => void
}

export const VisualizerImageWindow = ({
	image,
	crossX,
	crossY,
	imgRef,
	canvasRef,
	onLoad,
	onMouseDown,
}: VisualizerImageWindowProps) => {
	return (
		<div
			className={clsx(styles.window, styles.screenshot)}
			onMouseDown={onMouseDown}
			onDragStart={event => event.preventDefault()}>
			<canvas ref={canvasRef} style={{display: 'none'}} />
			<img
				ref={imgRef}
				alt='screenshot'
				className={styles.screen}
				src={image}
				onLoad={onLoad}
				crossOrigin='anonymous'
			/>
			<div className={styles.cross} style={{left: `${crossX}%`, top: `${crossY}%`}}></div>
		</div>
	)
}
