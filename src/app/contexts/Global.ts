import {createContext} from 'react'
import {IColor} from '../../types/picker'

type Mode = 'gradient' | 'solid'

interface IContex {
	mode: Mode
	setMode: (mode: Mode) => void
	history: IColor[]
	color: IColor
	setColor: (color: IColor) => void
	setHistory: (history: IColor[]) => void
	addHistory: (color: IColor['color'], format: IColor['format'], alpha: IColor['alpha']) => void
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => {},
	color: {
		color: '#ffffff',
		format: 'hex',
		alpha: 100,
	},
	setColor: () => {},
	history: [],
	setHistory: () => {},
	addHistory: () => {},
}

const GlobalContext = createContext<IContex>(initialGlobalContext)

export type {IContex, Mode}
export {GlobalContext, initialGlobalContext}
