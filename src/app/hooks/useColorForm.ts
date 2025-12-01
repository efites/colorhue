import {useState, useEffect, useContext, ChangeEvent} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import {useColorPicker} from '../../app/hooks/useColorPicker'
import {validateAndFormatColor, convertColor} from '@/shared/helpers/colors'
import {IColor} from '@/types/picker'

export const useColorForm = () => {
	const {mode, addHistory, color, setColor} = useContext(GlobalContext)
	const {color: pickedColor, image, format: pickedFormat, pickColor} = useColorPicker()

	const [code, setCode] = useState<IColor['color']>(color.color)
	const [format, setFormat] = useState<IColor['format']>(color.format)
	const [opacity, setOpacity] = useState<number>(color.alpha) // Инициализируем из глобального

	// 1. СИНХРОНИЗАЦИЯ: Глобальный стейт -> Локальные инпуты
	useEffect(() => {
		setCode(color.color)
		setFormat(color.format)
		setOpacity(color.alpha) // Синхронизируем прозрачность
	}, [color])

	// 2. ПИПЕТКА: Результат пипетки -> Глобальный стейт
	useEffect(() => {
		if (pickedColor && pickedColor.toUpperCase() !== '#FFFFFF') {
			// При пипетке считаем, что цвет непрозрачный (100%),
			// либо оставляем текущую прозрачность (зависит от логики, тут ставлю 100)
			const newAlpha = 100

			setColor({color: pickedColor, format: pickedFormat, alpha: newAlpha})
			addHistory(pickedColor, pickedFormat, newAlpha)
		}
	}, [pickedColor, pickedFormat, setColor, addHistory])

	const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
		setCode(e.target.value)
	}

	const handleFormatChange = (newFormat: IColor['format']) => {
		// Конвертируем цвет
		const convertedCode = convertColor(code, format, newFormat)

		setFormat(newFormat)
		setCode(convertedCode)

		// Сохраняем в глобалку (сохраняя текущую прозрачность!)
		setColor({color: convertedCode, format: newFormat, alpha: opacity})
	}

	const handleCodeBlur = (e: ChangeEvent<HTMLInputElement>) => {
		const formatted = validateAndFormatColor(e.target.value, format)

		if (formatted) {
			setCode(formatted)
			// Обновляем глобалку, передавая текущую прозрачность
			setColor({color: formatted, format: format, alpha: opacity})
			addHistory(formatted, format, opacity)
		} else {
			setCode(color.color)
		}
	}

	// Просто ввод цифр, не трогаем глобалку, чтобы не фризило интерфейс
	const handleOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
		const val = parseInt(e.target.value)
		if (isNaN(val))
			setOpacity(0) // или пустую строку, если хотите разрешить удаление всего
		else if (val > 100) setOpacity(100)
		else if (val < 0) setOpacity(0)
		else setOpacity(val)
	}

	// Валидация и сохранение прозрачности при потере фокуса
	const handleOpacityBlur = (e: ChangeEvent<HTMLInputElement>) => {
		let val = parseInt(e.target.value)

		if (isNaN(val) || e.target.value === '') {
			val = 100 // Дефолт, если поле пустое
		} else if (val > 100) val = 100
		else if (val < 0) val = 0

		setOpacity(val)

		// Обновляем глобальный стейт только тут
		// Важно: берем текущий валидный code и format из стейта компонента или напрямую из color
		setColor({color: code, format: format, alpha: val})
		// Опционально: добавлять ли изменение прозрачности в историю? Обычно да.
		addHistory(code, format, val)
	}

	return {
		state: {code, format, opacity, mode, image},
		actions: {
			pickColor,
			handleCodeChange,
			handleFormatChange,
			handleCodeBlur,
			handleOpacityChange,
			handleOpacityBlur,
		},
	}
}
