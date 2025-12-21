import { createContext, useContext, useState, useRef, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue, SharedValue } from "react-native-reanimated";

interface ScrollContextProps {
    scrollY: SharedValue<number>;
    isScrolling: boolean;
    handleScrollTo: (params: { x?: number; y?: number; animated?: boolean; }) => void;
}

const ScrollContext = createContext({});

export const useScrollContext = () => useContext(ScrollContext);

export function ScrollProvider({ children, contentContainerStyle }) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollY = useSharedValue(0);

    const handleDragStart = () => {
        setIsScrolling(true);
    }

    const handleDragEnd = () => {
        setIsScrolling(false);
    }

    const handleOnScroll = (event: { nativeEvent: { contentOffset: { y: number; }; }; }) => {
        scrollY.value = Math.round(event.nativeEvent.contentOffset.y);
    };

    const handleScrollTo = ({ x, y, animated } : { x: number, y: number, animated: boolean }) => {
        scrollViewRef.current?.scrollTo({
            x: x,
            y: y,
            animated: animated
        });
    }

    const value = {
        scrollY,
        isScrolling,
        setIsScrolling,
        handleScrollTo
    }

    return (
        <ScrollContext.Provider value={value}>
            <ScrollView
                ref={scrollViewRef}
                onScroll={handleOnScroll}
                onScrollBeginDrag={handleDragStart}
                onScrollEndDrag={handleDragEnd}
                onMomentumScrollEnd={handleDragEnd}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 8,
                    ...contentContainerStyle
                }}
                keyboardShouldPersistTaps="always"
                automaticallyAdjustKeyboardInsets
            >
                {children}
            </ScrollView>
        </ScrollContext.Provider>
    );
}