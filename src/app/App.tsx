import {useState} from 'react'

import type {IContex} from './contexts/Global'

import {Layout} from '../components'
import {GlobalContext} from './contexts/Global'

import '../shared/styles/global.scss'
import {IColor} from '../types/picker'

export const App = () => {
	const [mode, setMode] = useState<IContex['mode']>('solid')
	const [history, setHistory] = useState<IColor[]>(() => {
		const historyItem = localStorage.getItem('history')
		const history: IColor[] | null = JSON.parse(historyItem ?? 'null')

		return history || []
	})

	const context: IContex = {
		mode,
		setMode,
		history,
		setHistory,
	}

	return (
		<GlobalContext value={context}>
			<Layout />
		</GlobalContext>
	)
}
