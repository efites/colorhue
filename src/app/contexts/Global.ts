import {createContext} from 'react'

type Mode = 'gradient' | 'solid'

interface IContex {
	mode: Mode
	setMode: (mode: Mode) => void
}

const initialGlobalContext: IContex = {
	mode: 'solid',
	setMode: () => {},
}

const GlobalContext = createContext<IContex>(initialGlobalContext)

export type {IContex, Mode}
export {GlobalContext, initialGlobalContext}
