import {useEffect, useState} from 'react'
import {Pin} from '..'

import styles from './History.module.scss'
import {HistoryContext, IHistory, initialHistoryContext} from '../../app/contexts/History'
import {useColorPicker} from '../../app/hooks/useColorPicker'

export const History = () => {
	const [history, setHistory] = useState<IHistory>(() => {
		const historyItem = localStorage.getItem('history')
		const history: IHistory | null = JSON.parse(historyItem ?? 'null')
		return history || initialHistoryContext
	})

	const {color, format} = useColorPicker()

	console.log(color)

	useEffect(() => {
		console.log('update history')
		setHistory(prev => ({
			...prev,
			colors: [...prev.colors, {color, format}],
		}))
	}, [color])

	return (
		<HistoryContext value={history}>
			<div className={styles.history}>
				<div className={styles.pins}>
					{history.colors.map(({color, format}, index) => {
						return <Pin key={index} color={color} format={format} />
					})}
				</div>
			</div>
		</HistoryContext>
	)
}
