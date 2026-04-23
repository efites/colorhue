import {convertColor, parseRgb, rgbToString} from '@/shared/helpers/colors'
import {IColor} from '@/types/picker'

interface Position {
	x: number
	y: number
}

interface PixelColor {
	r: number
	g: number
	b: number
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export const getRelativePercentPosition = (
	rect: DOMRect,
	clientX: number,
	clientY: number,
): Position => ({
	x: clampPercent(((clientX - rect.left) / rect.width) * 100),
	y: clampPercent(((clientY - rect.top) / rect.height) * 100),
})

export const toLuminanceColor = (
	baseColor: IColor,
	position: Position,
	baseRgbString: string,
): IColor => {
	const tint = 1 - position.x / 100
	const shade = position.y / 100
	const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

	const white = {r: 255, g: 255, b: 255}
	const black = {r: 0, g: 0, b: 0}
	const base = parseRgb(baseRgbString) ?? white

	const topR = lerp(base.r, white.r, tint)
	const topG = lerp(base.g, white.g, tint)
	const topB = lerp(base.b, white.b, tint)

	const rgb: PixelColor = {
		r: Math.round(lerp(topR, black.r, shade)),
		g: Math.round(lerp(topG, black.g, shade)),
		b: Math.round(lerp(topB, black.b, shade)),
	}

	return {
		...baseColor,
		format: 'rgb',
		base: baseRgbString,
		displayed: rgbToString(rgb),
		luminance: {tint, shade},
	}
}

export const toImageSampledColor = (
	position: Position,
	pixel: PixelColor,
	currentFormat: IColor['format'],
): IColor => {
	const rgbString = rgbToString(pixel)

	return convertColor(
		{
			alpha: 100,
			base: rgbString,
			format: 'rgb',
			displayed: rgbString,
			luminance: {tint: position.x, shade: position.y},
		},
		currentFormat,
	)
}
