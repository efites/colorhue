import React from 'react'
import {Header, Main, History, Сompilation} from '../../componenets/index'

import styles from './Solid.module.scss'


export const Solid = () => {

	return <div className={styles.solid}>
		<Header />
		<Main />
		<Сompilation />
		<History />
	</div>
}
