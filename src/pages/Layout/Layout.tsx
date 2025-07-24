import React, {use} from 'react'

import {GlobalContext} from '../../app/contexts/Global'
import {Header, History, Main, Rainbow, Сompilation} from '../../components/index'

import styles from './Layout.module.scss'

export const Layout = () => {
	const {mode} = use(GlobalContext)

	return (
		<div className={styles.solid}>
			<Header />
			<Main />
			{mode === 'solid' && <Сompilation />}
			{mode === 'gradient' && <Rainbow />}
			<History />
		</div>
	)
}
