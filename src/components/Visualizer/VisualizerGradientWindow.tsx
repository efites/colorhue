import clsx from 'clsx'
import {MouseEvent, RefObject} from 'react'
import styles from './Visualizer.module.scss'

interface VisualizerGradientWindowProps {
	baseHex: string
	crossX: number
	crossY: number
	gradRef: RefObject<HTMLDivElement | null>
	onMouseDown: (event: MouseEvent<HTMLDivElement>) => void
}

export const VisualizerGradientWindow = ({
	baseHex,
	crossX,
	crossY,
	gradRef,
	onMouseDown,
}: VisualizerGradientWindowProps) => {
	return (
		<div
			ref={gradRef}
			className={clsx(styles.window, styles.screenshot)}
			style={{
				background: `linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(255, 255, 255, 0)),
                        linear-gradient(90deg, #ffffff, ${baseHex})`,
			}}
			onMouseDown={onMouseDown}
			onDragStart={event => event.preventDefault()}>
			<div className={styles.cross} style={{left: `${crossX}%`, top: `${crossY}%`}}></div>
		</div>
	)
}
