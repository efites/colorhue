export interface IColor {
	base: string
	displayed: string
	format: 'hex' | 'rgb'
	alpha: number
	luminance: {
		tint: number
		shade: number
	}
}

export interface PipetteCapture extends IColor {
	image: string
}

export interface CursorPosition {
	x: number
	y: number
	size?: number
	format?: string
}
