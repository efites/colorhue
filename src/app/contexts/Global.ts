import {createContext} from 'react'
import {IColor} from '../../types/picker'

type Mode = 'gradient' | 'solid'

interface IContex {
	mode: Mode
	setMode: (mode: Mode) => void
	history: IColor[]
	color: string
	setColor: (color: string) => void
	setHistory: (history: IColor[]) => void
	addHistory: (color: IColor['color'], format: IColor['format']) => void
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => {},
	color: '#ffffff',
	setColor: () => {},
	history: [],
	setHistory: () => {},
	addHistory: () => {},
}

const GlobalContext = createContext<IContex>(initialGlobalContext)

export type {IContex, Mode}
export {GlobalContext, initialGlobalContext}
