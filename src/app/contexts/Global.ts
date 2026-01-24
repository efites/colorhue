import {createContext, Dispatch, SetStateAction} from 'react'
import {IColor} from '../../types/picker'

type Mode = 'gradient' | 'solid'
type Harmony =
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
	setColor: Dispatch<SetStateAction<IColor>>
	setHistory: Dispatch<SetStateAction<IColor[]>>
	addHistory: (color: IColor) => void
}

const initialColor: IColor = {
	base: '#ffffff',
	displayed: '#ffffff',
	format: 'hex',
	alpha: 100,
	luminance: {tint: 0, shade: 0},
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => { },
	harmony: 'monochrome',
	setHarmony: () => { },
	color: initialColor,
	setColor: () => { },
	history: [],
	setHistory: () => { },
	addHistory: () => { },
}

const GlobalContext = createContext<IContex>(initialGlobalContext)

export type {IContex, Mode, Harmony}
export {GlobalContext, initialGlobalContext, initialColor}
