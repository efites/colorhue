import {createContext} from 'react'
import {IColor} from '../../types/picker'

export type Mode = 'gradient' | 'solid'
export type Harmony =
	| 'monochrome'
	| 'complementary'
	| 'analog'
	| 'tetrad'
	| 'triad'
	| 'analog-complementary'

interface IContex {
	mode: Mode
	setMode: (mode: Mode) => void
	harmony: Harmony
	setHarmony: (harmony: Harmony) => void
	history: IColor[]
	color: IColor
	setColor: (color: IColor) => void
	setHistory: (history: IColor[]) => void
	addHistory: (color: IColor['color'], format: IColor['format'], alpha: IColor['alpha']) => void
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => {},
	harmony: 'monochrome',
	setHarmony: () => {},
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
