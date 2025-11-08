import {createContext} from 'react'
import {IColor} from '../../types/picker'

type Mode = 'gradient' | 'solid'

interface IContex {
	mode: Mode
	setMode: (mode: Mode) => void
	history: IColor[]
	setHistory: (history: IColor[]) => void
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => {},
	history: [],
	setHistory: () => {},
}

const GlobalContext = createContext<IContex>(initialGlobalContext)

export type {IContex, Mode}
export {GlobalContext, initialGlobalContext}
