import {IColor} from '@/types/picker'
import {useState, useCallback} from 'react'
import {History_Settings} from '../../shared/consts/colors'


export const useHistory = () => {
	const [history, setHistory] = useState<IColor[]>(() => {
		try {
			const historyItem = localStorage.getItem('history')

			return historyItem ? JSON.parse(historyItem) : []
		} catch (e) {
			console.error('Error parsing history:', e)

			return []
		}
	})

	const addHistory = useCallback((color: IColor["color"], format: IColor["format"]) => {
		setHistory(prevHistory => {
			const normalizedColor = color.toUpperCase()

			if (prevHistory.length > 0 && prevHistory.find(element => element.color.toUpperCase() === normalizedColor)) {
				return prevHistory
			}

			const newHistory = [{color, format}, ...prevHistory].slice(
				0,
				History_Settings.max_colors
			)

			localStorage.setItem('history', JSON.stringify(newHistory))

			return newHistory
		})
	}, [])

	return {history, setHistory, addHistory}
}
