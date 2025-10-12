import config from '../../../config.json' assert {type: 'json'}

interface AppConfig {
	mode: 'dev' | 'prod'
	pipette: {
		min: number
		max: number
		step: number
		default: number
	}
	overlay: {
		width: number
		height: number
	}
}

export const APP_CONFIG: AppConfig = config as AppConfig

// export const pipetteConfig = {
// 	minSize: cfg.pipette.minSize,
// 	maxSize: cfg.pipette.maxSize,
// 	step: cfg.pipette.step,
// 	defaultSize: cfg.pipette.defaultSize,
// }

// export const buildMode = cfg.buildMode
// export const overlayDevSize = cfg.overlayDevSize
