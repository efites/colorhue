import React, {useState} from 'react'
import {Solid} from '../pages'
import {GlobalContext, IContex} from './contexts/Global'

import '../shared/styles/null.scss'
import '../shared/styles/colors.scss'

export const App = () => {
	const [mode, setMode] = useState<IContex['mode']>('solid')

	const context: IContex = {
		mode: mode,
		setMode: setMode,
	}

	return <GlobalContext value={context}>
		<Solid />
	</GlobalContext>

}
