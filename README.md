## Замечания

- luminance - светлота цвета, которая состоит из двух параметров:
    - tint - оттенок (белый) - смешение цвета с белым, где 1 - полностью белый
    - shade - полутон (черный) - смешение цвета с черным, где 1 - полностью черный

## Задачи

1. Создать функцию подбора цветов и оттенков \<Compilation />
2. Стилизовать выпадающий список формата цвета
3. Реализовать выбор комбинаций цвета, триад
4. Реализовать указание цвета на большом, главном круге по коду с ползунком
5. Перейти на страницу градиентов...

```
// components/Visualizer/ImageArea.tsx
const ImageArea = () => {
    const { refs, image, updateFromImage, commit } = useContext(ColorPickerContext);
    const { startDrag } = useDraggable(updateFromImage, commit);

    return (
        <div className={styles.window} onMouseDown={startDrag}>
            <canvas ref={refs.canvas} style={{ display: 'none' }} />
            <img ref={refs.img} src={image} crossOrigin="anonymous" onLoad={syncCanvas} />
            <Crosshair x={...} y={...} /> 
        </div>
    );
};
```

```
// components/Visualizer/GradientArea.tsx
const GradientArea = () => {
    const { refs, color, updateFromGradient, commit } = useContext(ColorPickerContext);
    const { startDrag } = useDraggable(updateFromGradient, commit);

    const bg = `linear-gradient(0deg, #000, transparent), 
                linear-gradient(90deg, #fff, ${convertColor(color, 'hex').base})`;

    return (
        <div ref={refs.grad} className={styles.window} style={{ background: bg }} onMouseDown={startDrag}>
            <Crosshair x={...} y={...} />
        </div>
    );
};

export const Visualizer = () => (
    <div className={styles.selection}>
        <Wheel />
        <div className={styles.windows}>
            <ImageArea />
            <GradientArea />
        </div>
    </div>
);
```
```
// hooks/useColorInputs.ts
export const useColorInputs = () => {
    const { color, setColor, commit } = useContext(ColorPickerContext);
    const [localCode, setLocalCode] = useState(color.displayed.toUpperCase());

    // Синхронизация кода при изменении цвета извне
    useEffect(() => {
        setLocalCode(color.displayed.toUpperCase());
    }, [color.displayed]);

    const handleBlur = () => {
        const result = validateColor(localCode);
        if (result) {
            const newColor = { ...color, base: result.code, displayed: result.code, format: result.format };
            setColor(newColor);
            commit();
        } else {
            setLocalCode(color.displayed.toUpperCase());
        }
    };

    return { localCode, setLocalCode, handleBlur };
};

const ColorSettings = () => {
    const { localCode, setLocalCode, handleBlur } = useColorInputs();
    
    return (
        <div className={styles.codes}>
            <input 
                value={localCode} 
                onChange={e => setLocalCode(e.target.value)} 
                onBlur={handleBlur} 
            />
            <OpacityInput />
        </div>
    );
};

export const Console = () => {
    const { mode } = useContext(GlobalContext);
    return (
        <div className={styles.settings}>
            <GammaSection />
            {mode === 'solid' && <ColorSettings />}
            {mode === 'solid' && <HarmonyButtons />}
        </div>
    );
};
```
