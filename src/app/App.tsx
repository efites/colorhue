import {useState} from 'react'

import type {IContex} from './contexts/Global'

import {Layout} from '../components'
import {GlobalContext} from './contexts/Global'

import '../shared/styles/global.scss'
import {IColor} from '../types/picker'
import {History_Settings} from '../shared/consts/colors'

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
		addHistory(color, format) {
			if (history.at(-1)?.color.toUpperCase() === color.toUpperCase()) return

			const filteredArray = history.filter(item => item.color !== color)
			const newHistory = [{color, format}, ...filteredArray].slice(
				0,
				History_Settings.max_colors,
			)

			localStorage.setItem('history', JSON.stringify(newHistory))
			setHistory(newHistory)
		},
	}

	return (
		<GlobalContext value={context}>
			<Layout />
		</GlobalContext>
	)
}
