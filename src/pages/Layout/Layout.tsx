import React, {use} from 'react'

import {GlobalContext} from '../../app/contexts/Global'
import {useWindowResize} from '../../app/hooks/useWindowResize'
import {Header, History, Main, Panel, Rainbow, Сompilation} from '../../components/index'

import styles from './Layout.module.scss'

export const Layout = () => {
	const {mode} = use(GlobalContext)
	const {contentRef} = useWindowResize()

	return (
		<div ref={contentRef} className={styles.solid}>
			<Panel />
			<Header />
			<Main />
			{mode === 'solid' && <Сompilation />}
			{mode === 'gradient' && <Rainbow />}
			<History />
		</div>
	)
}
