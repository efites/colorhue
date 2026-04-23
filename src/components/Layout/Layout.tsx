import {useAtom} from '@reatom/react'
import {useAutoWindowSize} from '../../app/hooks/useWindowResize'
import {Header, History, Panel, Rainbow, Сompilation} from '../index'
import {modeAtom} from '@/app/model/mode'

import styles from './Layout.module.scss'
import {Visualizer} from '../Visualizer/Visualizer'
import {Console} from '../Console/Console'

export const Layout = () => {
	const [mode] = useAtom(modeAtom)
	const {contentRef} = useAutoWindowSize()

	return (
		<div ref={contentRef} className={styles.solid}>
			<Panel />
			<Header />
			<div className={styles.main}>
				<Visualizer />
				<Console />
			</div>
			{mode === 'solid' && <Сompilation />}
			{mode === 'gradient' && <Rainbow />}
			<History />
		</div>
	)
}
