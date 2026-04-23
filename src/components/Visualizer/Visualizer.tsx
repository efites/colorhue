import styles from './Visualizer.module.scss'
import {convertColor} from '@/shared/helpers/colors'
import {VisualizerImageWindow} from './VisualizerImageWindow'
import {VisualizerGradientWindow} from './VisualizerGradientWindow'
import {useVisualizerState} from './useVisualizerState'

export const Visualizer = () => {
	const {
		color,
		image,
		imgRef,
		canvasRef,
		gradRef,
		imgCrossPos,
		gradCrossPos,
		handleImageLoad,
		onMouseDown,
	} = useVisualizerState()

	return (
		<div className={styles.selection}>
			<div className={styles.wheel}>
				<div className={styles.circle}>
					<div className={styles.cursor} style={{left: '40%', top: '40%'}}></div>
				</div>
			</div>
			<div className={styles.windows}>
				<VisualizerImageWindow
					image={image}
					crossX={imgCrossPos.x}
					crossY={imgCrossPos.y}
					imgRef={imgRef}
					canvasRef={canvasRef}
					onLoad={handleImageLoad}
					onMouseDown={event => onMouseDown(event, 'image')}
				/>
				<VisualizerGradientWindow
					baseHex={convertColor(color, 'hex').base}
					crossX={gradCrossPos.x}
					crossY={gradCrossPos.y}
					gradRef={gradRef}
					onMouseDown={event => onMouseDown(event, 'gradient')}
				/>
			</div>
		</div>
	)
}
