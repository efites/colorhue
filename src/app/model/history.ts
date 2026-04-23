import {action, atom} from '@reatom/core'
import {History_Settings} from '@/shared/consts/colors'
import {IColor} from '@/model/color'

export const readHistoryFromStorage = (): IColor[] => {
	const historyRaw = localStorage.getItem('history')

	if (!historyRaw) return []

	try {
		const parsed = JSON.parse(historyRaw)
		return Array.isArray(parsed) ? parsed : []
	} catch (error) {
		console.error('Error parsing history:', error)
		localStorage.removeItem('history')
		return []
	}
}

export const historyAtom = atom<IColor[]>(readHistoryFromStorage(), 'historyAtom')

export const addHistory = action((color: IColor) => {
	const prevHistory = historyAtom()

	if (
		prevHistory.some(
			item =>
				item.displayed.toUpperCase() === color.displayed.toUpperCase() &&
				item.alpha === color.alpha,
		)
	) {
		return prevHistory
	}

	const nextHistory = [color, ...prevHistory].slice(0, History_Settings.max_colors)
	historyAtom.set(nextHistory)
	localStorage.setItem('history', JSON.stringify(nextHistory))

	return nextHistory
}, 'addHistory')
