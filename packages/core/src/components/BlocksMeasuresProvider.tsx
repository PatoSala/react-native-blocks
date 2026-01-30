import { createContext, useContext, useRef, RefObject, useState, useEffect } from "react";
import { StyleSheet, Dimensions, View, Image } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, SharedValue } from "react-native-reanimated";
import { useScrollContext } from "./ScrollProvider";
import { useBlocksContext } from "./BlocksContext";
import { useBlockRegistrationContext } from "./BlockRegistration";

const { width } = Dimensions.get("window");

interface BlockMeasuresContext {
    blockMeasuresRef: RefObject<Record<string, { height: number, start: number, end: number }>>;
    registerBlockMeasure: (blockId: string, measures: { height: number, start: number, end: number, ref: RefObject<View> }) => void;
    removeBlockMeasure: (blockId: string) => void;
    
    indicatorPosition: SharedValue<{ y: number }>;
    setIndicatorPosition: (position: { y: number }) => void;

    isDragging: SharedValue<boolean>;
    setIsDragging: (isDragging: boolean) => void;
    offset: SharedValue<{ x: number, y: number }>;
    setOffset: (offset: { x: number, y: number }) => void;
}

const BlocksMeasuresContext = createContext<BlockMeasuresContext | null>(null);

export function useBlocksMeasuresContext() {
    const context = useContext(BlocksMeasuresContext);
    if (context === null) {
        throw new Error("useBlocksMeasuresContext must be used within a BlocksMeasuresProvider");
    }
    return context;
}

/**
 * Provider for block measures.
 * (Maybe good for refactoring): It also handles the animations for both the indicator and the ghost block when moving a block.
 */
export function BlocksMeasuresProvider({ children }) {
    const blockMeasuresRef = useRef({});
    const indicatorPosition = useSharedValue({ y: 0 });
    const { blockTypes } = useBlockRegistrationContext();
    const { movingBlockId, blocks } = useBlocksContext();

    const registerBlockMeasure = (blockId: string, measures: { height: number, width: number, start: number, end: number }) => {
        blockMeasuresRef.current[blockId] = measures;
    }

    const removeBlockMeasure = (blockId: string) => {
        delete blockMeasuresRef.current[blockId];
    }

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
                display: isDragging.value === false /* || indicatorPosition.value.y === 0 */ ? "none" : "flex"
            }
        ]} />
    )

    // Ghost block
    /** NOTE: It might be better to separate this into its own provider. */
    const isDragging = useSharedValue(false);

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
    const [viewShot, setViewShot] = useState({
        uri: "",
        width: 0,
        height: 0
    });
    const GhostBlock = () => {
        console.log("VIEW SHOT DATA", viewShot);
       /*  const Component = blockTypes[blocks[movingBlockId].type].component; */

        return (
            <Animated.View style={[{
                opacity: 0.5,
                position: "absolute",
                zIndex: 1000,
                width: "100%",
            }, animatedStyles]}>
                {/* <Component blockId={movingBlockId} /> */}
                <Image source={{ uri: `file://${viewShot.uri}` }} style={{ width: viewShot.width, height: viewShot.height }} /> 
            </Animated.View>
        )
    }

    const values = {
        blockMeasuresRef,
        registerBlockMeasure,
        removeBlockMeasure,

        // Ghost block
        isDragging,
        setIsDragging: (value: boolean) => isDragging.value = value,
        startPosition,
        setStartPosition: ({ x, y }) => startPosition.value = { x, y },
        offset,
        setOffset: ({ x, y }) => offset.value = { x, y },
        setViewShot,

        // Move indicator
        indicatorPosition,
        setIndicatorPosition: ({ y }) => indicatorPosition.value = { y },
    };
    
    return (
        <BlocksMeasuresContext.Provider value={values}>
            {children}

            <Indicator />

            {isDragging.value === true && movingBlockId && <GhostBlock />}
        </BlocksMeasuresContext.Provider>
    );
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