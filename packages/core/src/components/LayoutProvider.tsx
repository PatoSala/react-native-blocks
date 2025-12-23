import { useRef, useLayoutEffect, useContext, createContext, useEffect } from "react";
import { View } from "react-native";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useBlocksContext } from "./BlocksContext";
import { useAnimatedReaction } from "react-native-reanimated";

/** Measures and registers the height and position of a block */
export function LayoutProvider({
    children,
    blockId
}) {
    const { blocks } = useBlocksContext();
    const {
        blockMeasuresRef,
        registerBlockMeasure,
        removeBlockMeasure,
    } = useBlocksMeasuresContext();
    const viewRef = useRef<View>(null);

    /** Maybe this computation could be workletized (?) */
    const handleOnLayout = () => {
        /** 
         * Same story as with DragProvider.
         * This condition will be removed
         */
        if (blockId !== blocks["root"].content[0] && viewRef.current) {
            viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
                registerBlockMeasure(blockId, {
                    ref: viewRef,
                    type: blocks[blockId].type,
                    width: width,
                    height: height,
                    start: y,
                    end: y + height
                });
            });
        }
    }

    useEffect(() => {
        handleOnLayout();

        return () => {
            // Remove the block measure when the block is unmounted.
            removeBlockMeasure(blockId);
        }
    });

    return (
        <View ref={viewRef} onLayout={handleOnLayout}>
            {children}
        </View>
    );
}