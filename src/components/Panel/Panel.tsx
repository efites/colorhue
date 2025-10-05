import clsx from 'clsx'

import Icon from '../Icon/Icon'

import styles from './Panel.module.scss'

export const Panel = () => {
	const minimazeHandler = () => {}

	const closeHandler = () => {}

	return (
		<div className={styles.panel}>
			<h1 className={styles.title}>Colorhue</h1>
			<div className={styles.actions}>
				<button
					className={clsx(styles.button, styles.minimize)}
					type='button'
					onClick={() => minimazeHandler()}>
					<Icon className={styles.icon} name='minus' />
				</button>
				<button
					className={clsx(styles.button, styles.close)}
					type='button'
					onClick={() => closeHandler()}>
					<Icon className={styles.icon} name='close' />
				</button>
			</div>
		</div>
	)
}
