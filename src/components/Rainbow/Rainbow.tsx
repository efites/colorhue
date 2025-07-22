import React from 'react'

import Icon from '../Icon/Icon'

import styles from './Rainbow.module.scss'


export const Rainbow = ({}: IProps) => {

	return <div className={styles.rainbow}>
		<div className="panel">
			<div className={styles.model}>
				<select className={styles.select}>
					<option value='Diamond'>Diamond</option>
					<option value='Plastic'>Plastic</option>
				</select>
				<Icon className={styles.arrow} name='arrow-down' />
			</div>
			<div className="rotation"></div>
		</div>
		<div className="line">

		</div>
		<div className="management">
			<div className="headline">
				<div className="title"></div>
				<div className="plus"></div>
			</div>
			<div className="stops"></div>
			<div className="code"></div>
		</div>
	</div>
}
