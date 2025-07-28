import React, {useState} from 'react'

import type {IContex} from './contexts/Global'

import {Layout} from '../components'
import {GlobalContext} from './contexts/Global'

import '../shared/styles/global.scss'

export const App = () => {
	const [mode, setMode] = useState<IContex['mode']>('solid')

	const context: IContex = {
		mode,
		setMode,
	}

	return (
		<GlobalContext value={context}>
			<Layout />
		</GlobalContext>
	)
}
