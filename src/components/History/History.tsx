import React from 'react'

import {Pin} from '..'

import styles from './History.module.scss'

export const History = () => {
	return (
		<div className={styles.history}>
			<div className={styles.pins}>
				<Pin />
				<Pin />
				<Pin />
			</div>
		</div>
	)
}
