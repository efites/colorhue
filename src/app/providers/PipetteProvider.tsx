import {ReactNode} from 'react'
import {useColorPicker} from '../hooks/useColorPicker'
import {PipetteContext} from '../contexts/Pipette'

interface PipetteProviderProps {
	children: ReactNode
}

export const PipetteProvider = ({children}: PipetteProviderProps) => {
	const picker = useColorPicker()

	return <PipetteContext.Provider value={picker}>{children}</PipetteContext.Provider>
}
