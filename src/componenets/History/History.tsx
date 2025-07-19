import React from 'react'
import styles from './History.module.scss'
import {Pin} from '..'


export const History = () => {

	return <div className={styles.history}>
		<div className={styles.pins}>
			<Pin />
			<Pin />
			<Pin />
		</div>
	</div>
}
