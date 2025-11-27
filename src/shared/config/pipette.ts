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
