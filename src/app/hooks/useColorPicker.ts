import { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import ScreenFallback from '../../shared/images/screen.png'
import type { CursorPosition, PipetteCapture } from '../../types/picker'


export function useColorPicker() {
    const [color, setColor] = useState<string>('#FFFFFF')
    const [image, setImage] = useState<string>(ScreenFallback)
    const unlistenRef = useRef<UnlistenFn | null>(null)

    const cleanupListener = useCallback(() => {
        if (unlistenRef.current) {
            unlistenRef.current()
            unlistenRef.current = null
        }
    }, [])

    useEffect(() => {
        return () => {
            cleanupListener()
        }
    }, [cleanupListener])

    const pickColor = useCallback(async () => {
        try {
            await invoke('create_overlay', { windowName: 'picker' })

            // Ensure previous listener is removed before adding new one
            cleanupListener()

            const unlisten = await listen<CursorPosition>('send_cursor_position', async (event) => {
                const { x, y, size } = event.payload
                try {
                    const result = await invoke<PipetteCapture>('capture_cursor_area', { x, y, size })
                    setImage(result.image || ScreenFallback)
                    setColor(result.color)
                } catch (err) {
                    // swallow per event errors; main flow should continue
                    console.error('capture_cursor_area failed:', err)
                }
            })

            unlistenRef.current = unlisten
        } catch (err) {
            console.error('Ошибка выбора цвета:', err)
        }
    }, [cleanupListener])

    return { color, image, pickColor }
}


