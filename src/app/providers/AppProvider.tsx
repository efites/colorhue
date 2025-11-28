import {useState, useMemo, ReactNode} from 'react'
import {useHistory} from '@/hooks/useHistory'
import {GlobalContext, IContex} from '../contexts/Global'


interface AppProviderProps {
	children: ReactNode
}


export const AppProvider = ({children}: AppProviderProps) => {
	const [mode, setMode] = useState<IContex['mode']>('solid')
	const [color, setColor] = useState<string>('#ffffff')
	const {history, setHistory, addHistory} = useHistory()

	const contextValue: IContex = useMemo(() => ({
		mode,
		setMode,
		history,
		color,
		setColor,
		setHistory,
		addHistory,
	}), [mode, history, color, addHistory, setHistory])

	return (
		<GlobalContext value={contextValue}>
			{children}
		</GlobalContext>
	)
}
