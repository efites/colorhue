import {useState, useRef, useEffect} from 'react'
import Icon, {IconProps} from '../Icon/Icon'
import styles from './Select.module.scss'
import clsx from 'clsx'

export interface IOption {
	value: string | number
	label: string
}

interface IProps {
	selected: IOption | null
	options: IOption[]
	placeholder?: string
	onChange: (option: IOption) => void
	icon?: IconProps['name']
}

export const Select = ({
	selected,
	options,
	placeholder = 'Выберите...',
	onChange,
	icon,
}: IProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)

	const handleHeaderClick = () => {
		setIsOpen(prev => !prev)
	}

	const handleOptionClick = (option: IOption) => {
		onChange(option)
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	return (
		<div
			ref={rootRef}
			className={clsx(styles.select, isOpen && styles.active)}
			onClick={handleHeaderClick}>
			<div className={styles.header}>
				<div className={styles.title}>{selected ? selected.label : placeholder}</div>
				{icon && (
					<Icon name={icon} className={clsx(styles.arrow, {[styles.active]: isOpen})} />
				)}
			</div>
			{isOpen && (
				<div className={styles.body}>
					{options.map(option => (
						<div
							key={option.value}
							className={clsx(
								styles.item,
								selected?.value === option.value && styles.selected,
							)}
							onClick={() => handleOptionClick(option)}>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
