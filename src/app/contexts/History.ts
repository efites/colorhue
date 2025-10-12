import {createContext} from 'react'
import {IColor} from '../../types/picker'

interface IHistory {
	colors: IColor[]
	setColors: (colors: IColor[]) => void
}

const initialHistoryContext: IHistory = {
	colors: [],
	setColors: () => {},
}

const HistoryContext = createContext<IHistory>(initialHistoryContext)

export type {IHistory}
export {HistoryContext, initialHistoryContext}
