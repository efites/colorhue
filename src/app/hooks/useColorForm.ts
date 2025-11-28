import {useState, useEffect, useContext, ChangeEvent} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import {useColorPicker} from '../../app/hooks/useColorPicker'
import {validateAndFormatColor} from '@/shared/helpers/colors'

export const useColorForm = () => {
	const {mode, addHistory, color, setColor} = useContext(GlobalContext)
	const {color: pickedColor, image, format, pickColor} = useColorPicker()
	const [code, setCode] = useState<string>(color)
	const [opacity, setOpacity] = useState<number>(100)


	// 1. СИНХРОНИЗАЦИЯ: Глобальный стейт -> Локальный инпут
	// Срабатывает при: клике на Pin, успешном выборе пипеткой, ручном вводе (после блюра)
	useEffect(() => {
		setCode(color)
	}, [color])

	// 2. ПИПЕТКА: Результат пипетки -> Глобальный стейт
	// Убираем 'color' из зависимостей! Этот эффект должен работать только когда pickedColor меняется.
	useEffect(() => {
		// Проверка, чтобы игнорировать инициализацию хука (дефолтный белый)
		// Если реально выбрали белый цвет, он все равно обновится, если до этого был не белый
		if (pickedColor && pickedColor.toUpperCase() !== '#FFFFFF') {
			setColor(pickedColor)
			addHistory(pickedColor, format)
			// setCode(pickedColor) <-- УДАЛЯЕМ. Это сделает первый useEffect автоматически
		}
	}, [pickedColor, format, setColor, addHistory])

	// --- Handlers ---

	const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Здесь мы НЕ обновляем глобальный стейт, чтобы не триггерить перерисовку всего приложения на каждый чих
		setCode(e.target.value)
	}

	const handleCodeBlur = (e: ChangeEvent<HTMLInputElement>) => {
		// Валидация происходит при потере фокуса
		// Используем текущий format из хука пипетки или можно брать из стейта, если ты добавишь выбор формата в UI
		// Пока берем format из useColorPicker, но логичнее хранить выбранный формат в GlobalContext
		const currentFormat = format || 'hex'

		const formatted = validateAndFormatColor(e.target.value, currentFormat)

		if (formatted) {
			setCode(formatted)
			setColor(formatted) // Обновляем глобалку
			addHistory(formatted, currentFormat)
		} else {
			// Если ввели мусор — возвращаем то, что сейчас в глобальном стейте
			setCode(color)
		}
	}

	const handleOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
		const val = parseInt(e.target.value)
		if (isNaN(val) || val > 100) setOpacity(100)
		else if (val < 0) setOpacity(0)
		else setOpacity(val)
	}

	const handleOpacityBlur = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.value === '') setOpacity(0)
	}

	return {
		state: {code, opacity, mode, image},
		actions: {
			pickColor,
			handleCodeChange,
			handleCodeBlur,
			handleOpacityChange,
			handleOpacityBlur
		}
	}
}
