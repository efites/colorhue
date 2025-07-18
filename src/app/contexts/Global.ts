import {createContext} from 'react'


type Mode = 'solid' | 'gradient'

interface IContex {
	mode: Mode,
	setMode: (mode: Mode) => void
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => { }
}

const GlobalContext = createContext<IContex>(initialGlobalContext)

export type {Mode, IContex}
export {
	GlobalContext,
	initialGlobalContext,
}

