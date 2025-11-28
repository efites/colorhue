import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './Panel.module.scss'
import {invoke} from '@/shared/helpers/tauri'

export const Panel = () => {
	const minimazeHandler = async () => {
		await invoke('minimize_window')
	}

	const closeHandler = async () => {
		await invoke('exit_app')
	}

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
