import {useState, useMemo, ReactNode} from 'react'
import {useHistory} from '@/hooks/useHistory'
import {GlobalContext, IContex} from '../contexts/Global'
import {IColor} from '@/types/picker'

interface AppProviderProps {
	children: ReactNode
}

export const AppProvider = ({children}: AppProviderProps) => {
	const [mode, setMode] = useState<IContex['mode']>('solid')
	const [harmony, setHarmony] = useState<IContex['harmony']>('monochrome')
	const [color, setColor] = useState<IColor>({color: '#ffffff', format: 'hex', alpha: 100})
	const {history, setHistory, addHistory} = useHistory()

	const contextValue: IContex = useMemo(
		() => ({
			mode,
			setMode,
			harmony,
			setHarmony,
			history,
			color,
			setColor,
			setHistory,
			addHistory,
		}),
		[mode, history, color, harmony, addHistory, setHistory],
	)

	return <GlobalContext value={contextValue}>{children}</GlobalContext>
}
