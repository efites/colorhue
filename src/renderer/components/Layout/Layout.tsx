import React, {use} from 'react'

import {GlobalContext} from '../../app/contexts/Global'
import {useWindowResize} from '../../app/hooks/useWindowResize'
import {Header, History, Main, Panel, Rainbow, Сompilation} from '../index'

import styles from './Layout.module.scss'

export const Layout = () => {
	const {mode} = use(GlobalContext)
	const {contentRef} = useWindowResize()

	const isDevMode = import.meta.env.VITE_MODE === 'dev'

	return (
		<div ref={isDevMode ? undefined : contentRef} className={styles.solid}>
			<Panel />
			<Header />
			<Main />
			{mode === 'solid' && <Сompilation />}
			{mode === 'gradient' && <Rainbow />}
			<History />
		</div>
	)
}
