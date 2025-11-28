import {use, useEffect} from 'react'
import {Pin} from '..'
import styles from './History.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {useColorPicker} from '../../app/hooks/useColorPicker'

export const History = () => {
	const {history, addHistory} = use(GlobalContext)
	const {color: _color, format} = useColorPicker()

	useEffect(() => {
		addHistory(_color, format)
	}, [_color])

	return (
		<div className={styles.history}>
			<div className={styles.pins}>
				{history.map(({color, format}) => {
					return <Pin key={color} color={color} format={format} />
				})}
			</div>
		</div>
	)
}
