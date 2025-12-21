
/**
 * Maybe this component should be renamed to something like BlockGestureHandler
 * and be exported from the coree library so that users could decide whether fi theey want
 * a certain block to have the drag or longpressed gestures.
 */

import {
    useSharedValue,
    useAnimatedReaction,
} from "react-native-reanimated";
import { Dimensions, View } from "react-native";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { useBlocksContext } from "./BlocksContext";
import { useBlocksMeasuresContext } from "./BlocksMeasuresProvider";
import { useScrollContext } from "./ScrollProvider";
import { useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("screen");

// SCROLLING THRESHOLDS
const TOP_THRESHOLD = 100;
const BOTTOM_THRESHOLD = screenHeight - 100;

export function DragProvider({
    children,
    blockId,
}) {
    const {
        movingBlockId,
        setMovingBlockId,
        moveBlock,
        blocks,
        setSelectedBlockId,
    } = useBlocksContext();
    const {
        // Offset is actually ghost block poosition
        setOffset,
        isDragging,
        setIsDragging,
        setStartPosition,
        indicatorPosition,
        setIndicatorPosition,
        blockMeasuresRef
    } = useBlocksMeasuresContext();
    const { scrollY, handleScrollTo } = useScrollContext();
    const insets = useSafeAreaInsets();

    const scrollDirection = useSharedValue<null | "UP" | "DOWN">(null);
    

    /** Auto scroll interval */
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollUp = () => {
        handleScrollTo({ y: scrollY.value - 200, animated: true });
    };

    const scrollDown = () => {
        handleScrollTo({ y: scrollY.value + 200, animated: true });
    };

    const startAutoScrollUp = () => {
        if (intervalRef.current) return; // already scrolling
        intervalRef.current = setInterval(scrollUp, 100); // gentle, continuous scroll
    };

    /** Stop scrolling */
    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            scrollDirection.value = null;
        }
    };

    const startAutoScrollDown = () => {
        if (intervalRef.current) return; // already scrolling
        intervalRef.current = setInterval(scrollDown, 100); // gentle, continuous scroll
    };

    useAnimatedReaction(
        () => {
            return {
                scrollDirection: scrollDirection.value,
                isDragging: isDragging.value
            }
        },
        (currentValue) => {
            if (currentValue.scrollDirection === "UP") {
                scheduleOnRN(startAutoScrollUp);
            }

            if (currentValue.scrollDirection === "DOWN") {
                scheduleOnRN(startAutoScrollDown);
            }

            if (currentValue.scrollDirection === null) {
                scheduleOnRN(stopAutoScroll);
            }

            if (currentValue.isDragging === false) {
                scheduleOnRN(stopAutoScroll);
            }
            
        }
    );

    /**
     *  Given a y coordinate, returns the block at that position and a "start" or "end"
     *  string that indicates if the position is closer to the start or end of the block.
     * 
     * Note: Maybe this could be turned into a worklet? It would have to look something like this:
     * findBlockAtPosition = (blocksMeasures: object, y: number) reutns { blockId: string, closestTo: "start" | "end" }
     * 
     * */

    const findBlockAtPosition = (y: number) : { blockId: string, closestTo: "start" | "end" } => {
        const withScrollY = y + scrollY.value;

        for (const blockId in blockMeasuresRef.current) {
            const { start, end } = blockMeasuresRef.current[blockId];
            if (withScrollY >= start && withScrollY <= end) {
                const closestTo = withScrollY - start > end - withScrollY ? "end" : "start";

                return {
                    blockId,
                    closestTo
                };
            }
        }

        return {
            blockId: null,
            closestTo: null
        };
    }

    const handleMoveBlock = () => {
        if (!movingBlockId) return;

        const blockToMove = blocks[movingBlockId];
        const targetBlock = findBlockAtPosition(indicatorPosition.value.y); // Passing the indicator position fixes de out of bounds error since the indicator value will always be positioned at the start ot end of a block
        if (blockToMove.id !== targetBlock.blockId) {
            moveBlock(blockToMove.id, blockToMove.parent, targetBlock.blockId, targetBlock.closestTo);
        }
    }

    const handleOnDragStart = () => {
        console.log("BLOCK MEASURES", blockMeasuresRef.current);
        setIsDragging(true);
        setMovingBlockId(blockId);
        // mesure in window does not include safe areas
        blockMeasuresRef.current[blockId].ref.current.measureInWindow((x, y, width, height, pageX, pageY) => {
            setStartPosition({
                x,
                y: y
            })
        })
    }


    const handleOnDragUpdate = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        /** Update scroll direction */
        if (e.absoluteY > BOTTOM_THRESHOLD) {
            scrollDirection.value = "DOWN";
        } else if (e.absoluteY < TOP_THRESHOLD) {
            scrollDirection.value = "UP";
        } else {
             scrollDirection.value = null;
        }
        
        // translationX/Y equals how much the finger has moved from its starting point (offset)
        // We need to substract the insets to make sure the indicator is positioned correctly
        setOffset({
            x: e.translationX,
            y: e.translationY - insets.top 
        })
        /** Update indicator position */
        const { blockId, closestTo } = findBlockAtPosition(e.absoluteY);
        console.log(blockId, closestTo);

        if (blockId) {
            /**
             * Since block measures when taken are relative to the scrollY = 0,
             *  we need to substract it to make sure the indicator is positioned correctly.
             */
            setIndicatorPosition({
                y: blockMeasuresRef.current[blockId][closestTo] - scrollY.value    // We need to substract the scrollY to make sure 
            });
        }
    }

    const handleOnDragEnd = () => {
        handleMoveBlock();
        setIsDragging(false);
        setMovingBlockId(null);
        setOffset({ x: 0, y: 0 });
        setStartPosition({ x: 0, y: 0 });
        setIndicatorPosition({ y: 0 });
    }

    // scroll, tap
    const nativeGestures = Gesture.Native()

    const longPress = Gesture.LongPress()
            .minDuration(2000)
            .onStart((e) => {
                scheduleOnRN(setSelectedBlockId, blockId);
            })

    const blockDrag = Gesture.Pan()
        .activateAfterLongPress(1000)
        .minDistance(50)
        .onStart((e) => {
            scheduleOnRN(handleOnDragStart);
        })
        .onUpdate((e) => {
            scheduleOnRN(handleOnDragUpdate, e);
        })
        .onFinalize(() => {
            scheduleOnRN(handleOnDragEnd);
        })
        .blocksExternalGesture(nativeGestures)
    
    const composed = Gesture.Simultaneous(nativeGestures, longPress, blockDrag);

    return (
        <GestureDetector gesture={composed}>
            <View>
                {children}
            </View>
        </GestureDetector>
    );
}