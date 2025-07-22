import React from 'react'

import {Header, History, Main, Rainbow, Сompilation} from '../../components/index'

import styles from './Layout.module.scss'

export const Layout = () => {
	return (
		<div className={styles.solid}>
			<Header />
			<Main />
			<Rainbow />
			<Сompilation />
			<History />
		</div>
	)
}
