import {use, useEffect} from 'react'
import {Pin} from '..'
import styles from './History.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {useColorPicker} from '../../app/hooks/useColorPicker'

export const History = () => {
	const {history, setHistory} = use(GlobalContext)
	const {color: _color, format} = useColorPicker()

	useEffect(() => {
		history.unshift({color: _color, format})

		const newHistory = history.slice(0, 20)

		localStorage.setItem('history', JSON.stringify(newHistory))

		setHistory(newHistory)
	}, [_color])

	return (
		<div className={styles.history}>
			<div className={styles.pins}>
				{history.map(({color, format}, index) => {
					return <Pin key={index} color={color} format={format} />
				})}
			</div>
		</div>
	)
}
