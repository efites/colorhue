import {Layout} from '@/components/index'
import '../shared/styles/global.scss'
import {useEffect} from 'react'

export const App = () => {
	useEffect(() => {
		localStorage.clear()
	}, [])

	return (
		<Layout />
	)
}
