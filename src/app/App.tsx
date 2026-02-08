import {Layout} from '@/components/index'
import {AppProvider} from './providers/AppProvider'
import '../shared/styles/global.scss'
import {useEffect} from 'react'

export const App = () => {

	useEffect(() => {
		localStorage.clear()
	}, [])

	return (
		<AppProvider>
			<Layout />
		</AppProvider>
	)
}
