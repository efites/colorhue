import {Layout} from '@/components/index'
import {AppProvider} from './providers/AppProvider'
import '../shared/styles/global.scss'

export const App = () => {
	return (
		<AppProvider>
			<Layout />
		</AppProvider>
	)
}
