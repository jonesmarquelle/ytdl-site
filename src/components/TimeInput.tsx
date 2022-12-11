import React, { useEffect, useRef, useState } from "react";

interface TimeInputProps {
    className?: string,
    maxTimestamp?: string,
    fieldCount: (2|3),
    onChangeTime?: (time?: string) => void,
}

const TimeInput: React.FC<TimeInputProps> = (props) => {

    const itemsRef = useRef<(HTMLInputElement|null)[]>([]);

    const [ timeValid, setTimeValid ] = useState<boolean>(true);
    const [ currentTime, setCurrentTime ] = useState<string>();

    useEffect(() => {
        if(props.onChangeTime) props.onChangeTime(currentTime);
    }, [currentTime, props]);

    const onChangeHandler = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const allValid = itemsRef.current.reduce((p, c) => {return (p && !!c && c.validity.valid)}, true);
        setTimeValid(allValid);
        if (allValid) {
            setCurrentTime(itemsRef.current.map((e) => (e?.value ?? "00")).join(':'));
        }
        nextFieldHandler(index)(e);
    }

    const nextFieldHandler = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextField = itemsRef.current[index + 1];
        if (e.currentTarget.value.length == 2 && nextField) {
            nextField.focus();
        }
    }

    return (
        <div className={`${props.className} ${timeValid ? "border-neutral-400" : "border-pink-500"} `}>
            <div className="flex flex-row gap-1">
            { Array.from({ length: props.fieldCount }, (_, i) =>
                <input 
                    key={i} 
                    ref={e => itemsRef.current[i] = e}
                    onPaste={(e) => e.preventDefault()} 
                    onChange={onChangeHandler(i)} 
                    type="tel"
                    pattern="[0-5][0-9]"
                    defaultValue="00"
                    maxLength={2}
                    onFocus={e => e.currentTarget.select()}
                    className={`text-center w-1/3 outline-none bg-transparent selection:text-white selection:bg-slate-400`}
                />
            )}
            </div>
        </div>
    )
}

export default TimeInput