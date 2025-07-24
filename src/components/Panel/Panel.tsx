import {ipcMain} from 'electron'
import React from 'react'

import Icon from '../Icon/Icon'

import styles from './Panel.module.scss'


export const Panel = () => {

	const minimazeHandler = (action: string) => {
		window.Electron.mini
		window.electronAPI?.windowAction(action)
	}

	return <div className={styles.panel}>
		<h1 className={styles.title}>Colorhue</h1>
		<div className={styles.actions}>
			<button className={styles.button} type='button' onClick={() => minimazeHandler('minimize')}>
				<Icon className={styles.icon} name='minus' />
			</button>
			<button className={styles.button} type='button'>
				<Icon className={styles.icon} name='plus' />
			</button>
		</div>
	</div>
}
