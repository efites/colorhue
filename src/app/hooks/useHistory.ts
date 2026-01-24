import {IColor} from '@/types/picker'
import {useState, useCallback} from 'react'
import {History_Settings} from '../../shared/consts/colors'

export const useHistory = () => {
	const [history, setHistory] = useState<IColor[]>(() => {
		const historyItem = localStorage.getItem('history')

		try {
			return historyItem ? JSON.parse(historyItem) : []
		} catch (e) {
			console.error('Error parsing history:', e)

			localStorage.removeItem('history')
			localStorage.setItem('history', [].toString())

			return localStorage.getItem('history') ?? []
		}
	})

	const addHistory = useCallback(
		(color: IColor) => {
			setHistory(prevHistory => {
				if (
					prevHistory.length > 0 &&
					prevHistory.find(
						element =>
							element.displayed.toUpperCase() === color.displayed.toUpperCase() &&
							element.alpha === color.alpha,
					)
				) {
					return prevHistory
				}

				const newHistory = [color, ...prevHistory].slice(
					0,
					History_Settings.max_colors,
				)

				localStorage.setItem('history', JSON.stringify(newHistory))

				return newHistory
			})
		},
		[],
	)

	return {history, setHistory, addHistory}
}
