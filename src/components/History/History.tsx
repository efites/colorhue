import {useContext} from 'react'
import {Pin} from '..'
import styles from './History.module.scss'
import {GlobalContext} from '../../app/contexts/Global'


export const History = () => {
	const {history, setColor} = useContext(GlobalContext)


	return (
		<div className={styles.history}>
			<div className={styles.pins}>
				{history.map(({color, format}) => {
					return <div key={color} onClick={() => setColor(color)}>
						<Pin color={color} format={format} />
					</div>
				})}
			</div>
		</div>
	)
}
