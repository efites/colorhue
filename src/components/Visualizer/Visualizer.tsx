import clsx from 'clsx'
import styles from './Visualizer.module.scss'

export const Visualizer = ({image}: {image: string}) => (
	<div className={styles.selection}>
		<div className={styles.wheel}>
			<div className={styles.circle}></div>
		</div>
		<div className={styles.windows}>
			<div className={clsx(styles.window, styles.screenshot)}>
				<img alt='screenshot' className={styles.screen} src={image} />
				<div className={styles.cross}></div>
			</div>
			<div className={clsx(styles.window, styles.brightness)}></div>
		</div>
	</div>
)
