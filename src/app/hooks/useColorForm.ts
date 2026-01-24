import {useEffect, useContext, ChangeEvent} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import {useColorPicker} from '../../app/hooks/useColorPicker'
// import {convertColor} from '@/shared/helpers/colors'
// import {IColor} from '@/types/picker'

export const useColorForm = () => {
	const {color: customizedColor, addHistory, setColor} = useContext(GlobalContext)
	const {color: pickedColor, image, pickColor} = useColorPicker()

	// Локальное состояние для инпутов (чтобы ввод был плавным)
	// const [code, setCode] = useState<IColor['displayed']>(customizedColor.displayed)

	// 1. Синхронизация: Глобальный стейт -> Локальный
	useEffect(() => {
		// setCode(customizedColor.displayed)
	}, [customizedColor])

	// 2. Пипетка: При выборе цвета обновляем всё
	useEffect(() => {
		if (pickedColor) {
			setColor(pickedColor)
			addHistory(pickedColor)
		}
	}, [pickedColor, setColor, addHistory])

	// Изменение текста в инпуте цвета
	const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
		// TODO: нужно проверить валидность введеного значения
		setColor(prev => ({
			...prev,
			displayed: e.target.value, // Обновляем только отображение при печати
		}))
	}

	// Завершение ввода цвета (Blur или Enter)
	const handleCodeBlur = () => {
		// Здесь должна быть ваша функция валидации, если её нет — сохраняем как есть
		// const updatedColor = {...localCode, base: localCode.displayed}
		// setColor(updatedColor)
		// addHistory(updatedColor)
	}

	// Изменение формата (HEX/RGB/HSL)
	// const handleFormatChange = (color: IColor, ) => {
	// 	const converted = convertColor(localCode, newFormat)
	// 	const newColorState = {...converted, format: newFormat, alpha: localOpacity}

	// 	setLocalCode(newColorState)
	// 	setColor(newColorState)
	// 	addHistory(newColorState)
	// }

	// Изменение прозрачности (только локально)
	const handleOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value)

		if (isNaN(value)) setColor(prev => ({...prev, alpha: 100}))
		else if (value > 100) setColor(prev => ({...prev, alpha: 100}))
		else if (value < 0) setColor(prev => ({...prev, alpha: 0}))
		else setColor(prev => ({...prev, alpha: value}))
	}

	// Сохранение прозрачности в глобальный стейт
	const handleOpacityBlur = () => {
		// const updatedColor = {...localCode, alpha: localOpacity}
		// setColor(updatedColor)
		// addHistory(updatedColor)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.currentTarget.blur()
		}
	}

	return {
		state: {
			color: customizedColor,
			image,
		},
		actions: {
			pickColor,
			handleCodeChange,
			// handleFormatChange,
			handleCodeBlur,
			handleOpacityChange,
			handleOpacityBlur,
			onKeyDown,
		},
	}
}
