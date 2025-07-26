import React from 'react'

import Icon from '../Icon/Icon'

import styles from './Panel.module.scss'


export const Panel = () => {

	const minimazeHandler = () => {
		window.electronAPI?.minimizeWindow();
	}

	const closeHandler = () => {
		window.electronAPI?.closeWindow();
	}

	return <div className={styles.panel}>
		<h1 className={styles.title}>Colorhue</h1>
		<div className={styles.actions}>
			<button className={styles.button} type='button' onClick={() => minimazeHandler()}>
				<Icon className={styles.icon} name='minus' />
			</button>
			<button className={styles.button} type='button' onClick={() => closeHandler()}>
				<Icon className={styles.icon} name='close' />
			</button>
		</div>
	</div>
}
