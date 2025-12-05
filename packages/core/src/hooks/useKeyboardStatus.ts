import { useState, useEffect } from "react";
import { Keyboard } from "react-native";

/** Might replace this with a library that handles better this job */

export function useKeyboardStatus() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardY, setKeyboardY] = useState(0);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e) => {
            setIsKeyboardOpen(true);
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardY(e.endCoordinates.screenY);
        }
        );
        const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            setIsKeyboardOpen(false);
        }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return { isKeyboardOpen, keyboardHeight, keyboardY };
}