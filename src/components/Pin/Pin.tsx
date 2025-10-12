import styles from './Pin.module.scss'
import {IColor} from '../../types/picker'

const standard = '#fff'

export const Pin = ({color}: IColor) => {
	return <div className={styles.pin} style={{backgroundColor: color || standard}}></div>
}
