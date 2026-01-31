import { createContext, useContext, useState } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useBlocksContext } from "@react-native-blocks/core";

const { width } = Dimensions.get("screen");

const DragPreviewContext = createContext({});

export const useDragPreviewContext = () => useContext(DragPreviewContext);

export function DragPreviewProvider({ children }) {
    const { blockTypes, blocks } = useBlocksContext();
    const indicatorPosition = useSharedValue({ y: 0 });
    const [movingBlockId, setMovingBlockId] = useState<string | null>(null);

    // Ghost block
    const isDragging = useSharedValue(false);

    const indicatorAnimatedStyles = useAnimatedStyle(() => {
        return {
            top: indicatorPosition.value.y
        }
    });

    const Indicator = () => (
        <Animated.View style={[
            styles.indicator,
            indicatorAnimatedStyles,
            {
                display: isDragging.value === false ? "none" : "flex"
            }
        ]} />
    )

    // startPosition is where the GhostBlock should be absolutely positioned
    const startPosition = useSharedValue({ x: 0, y: 0 });
    // offset is how much the GhostBlock has moved from its start position
    const offset = useSharedValue({ x: 0, y: 0 });
    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: offset.value.y },
                { scaleX: 1.01 },
                { scaleY: 1.01 },
            ],
            top: startPosition.value.y,
            left: startPosition.value.x,
            display: isDragging.value === false ? 'none' : 'flex',
        };
    });
    /** 
     * NOTE: Ghost block only needs to look like the block that is being dragged,
     * but right now its mounting the whole component with all its logic, which is not necessary.
     * I'll leave it like this because its working, but it can be refactored in the future.
     */
    const GhostBlock = () => {
        const Component = blockTypes[blocks[movingBlockId].type].component;

        return (
            <Animated.View style={[{
                opacity: 0.5,
                position: "absolute",
                zIndex: 1000,
                width: "100%"
            }, animatedStyles]}>
                <Component blockId={movingBlockId} />
            </Animated.View>
        )
    }

    const value = {
        movingBlockId,
        setMovingBlockId,

        // Ghost block
        isDragging,
        setIsDragging: (value: boolean) => isDragging.value = value,
        startPosition,
        setStartPosition: ({ x, y }) => startPosition.value = { x, y },
        offset,
        setOffset: ({ x, y }) => offset.value = { x, y },

        // Move indicator
        indicatorPosition,
        setIndicatorPosition: ({ y }) => indicatorPosition.value = { y },
    }
    return (
        <DragPreviewContext.Provider value={value}>
                {children}
                <Indicator />
                {isDragging.value && movingBlockId && <GhostBlock />}
        </DragPreviewContext.Provider>
    )
}

const styles = StyleSheet.create({
    indicator: {
        height: 3,
        width: width - 32,
        marginLeft: 16,
        boxSizing: "border-box",
        opacity: 0.5,
        backgroundColor: "#0277e4ff",
        position: "absolute"
    }
});