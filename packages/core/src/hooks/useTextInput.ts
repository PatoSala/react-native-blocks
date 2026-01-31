import React, { useMemo } from "react";
import { TextInput, TextInputProps, Platform } from "react-native";
import { useBlocksContext, useBlock } from "../components/BlocksContext";
import { useTextBlocksContext } from "../components/TextBlocksProvider";
import { scheduleOnUI } from "react-native-worklets";
import {
    updateBlockData,
    findPrevTextBlockInContent,
    getPreviousBlockInContent
} from "../core/updateBlock";
import { useScrollContext } from "../components/ScrollProvider";
import { useBlocksMeasuresContext } from "../components/BlocksMeasuresProvider";
import { useBlockRegistrationContext } from "../components/BlockRegistration";
import { useDragPreviewContext } from "../components/DragPreviewProvider";

export function useTextInput(blockId: string) {
    const {
        blocks,
        blocksOrder,
        focusedBlockId,
        setFocusedBlockId,
        updateBlock,
        mergeBlock,
        splitBlock,
        removeBlock,
        getBlockSnapshot
    } = useBlocksContext();
    const {
        registerRef,
        showSoftInputOnFocus,
        inputRefs
    } = useTextBlocksContext();
    const { isScrolling } = useScrollContext();
    const { isDragging } = useDragPreviewContext();
    const { textBasedBlocks, defaultBlockType } = useBlockRegistrationContext();

    const block = getBlockSnapshot(blockId);
    const title = block.properties.title;
    const inputRef = React.useRef<TextInput>(null);
    const selectionRef = React.useRef({ start: title.length, end: title.length });
    const valueRef = React.useRef(title);
    const isFocused = focusedBlockId === blockId;
    const isEditable = isScrolling === false && isDragging.value === false
        ? true
        : focusedBlockId === blockId    // Keep focusd block editable whn scrolling.
            ? true
            : false;

    const api = {
        current: {
            getText: () => valueRef.current,
            setText: (text: string) => {
                valueRef.current = text;
                inputRef.current?.setNativeProps({ text: valueRef.current });
            },
            focus: () => {
                inputRef.current?.focus();
            },
            blur: () => {
                inputRef.current?.blur();
            },
            setSelection: (selection: { start: number; end: number }) => {
                inputRef.current?.setSelection(selection.start, selection.end);
                selectionRef.current = selection;
            },
            getPosition: () => {
                inputRef.current?.measureInWindow((x, y, width, height) => {
                    console.log(x, y, width, height);
                })
            }
        }
    };

    function handleSelectionChange(event: { nativeEvent: { selection: { start: number; end: number; }; }; }) {
        selectionRef.current = event.nativeEvent.selection;
    }

    // Review this: handleOnBlur is messing up with handleSubmit.
    function handleOnBlur() {
       const updatedBlock = updateBlockData(blocks[blockId], {
            properties: {
                title: valueRef.current
            }
        });
        updateBlock(updatedBlock);
    }

    /**
     * @deprecated
     * handleOnKeyPress is now handled within each block component for more flexibility.
     */
    function handleOnKeyPress (event: { nativeEvent: { key: string; }; }) {
        const block = updateBlockData(blocks[blockId], {
            properties:
            { 
                title: valueRef.current
            }
        });

        // This should be handled withing the PageBlock
        if (blocksOrder[0] === blockId) return;
        
        const sourceBlock = block;
        const prevTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);
        const prevBlock = getPreviousBlockInContent(blockId, blocks);
        const targetBlockId = prevTextBlock === undefined ? sourceBlock.parent : prevTextBlock.id;
        /**
         * If the inmediate previous block is a textblock and that block is empty,
         * remove it and keep focus on current block.
         * 
         * Else, merge the current block with the previous block.
         */
        if (blocks[targetBlockId].properties.title.length === 0 && targetBlockId !== sourceBlock.parent && prevBlock.type === defaultBlockType) {
            requestAnimationFrame(() => {
                removeBlock(targetBlockId);
            });
        } else {
            const { mergeResult } = mergeBlock(block, targetBlockId);

            inputRefs.current[mergeResult.id]?.current.setText(mergeResult.properties.title);
            inputRefs.current[mergeResult.id]?.current.setSelection({
                start: mergeResult.properties.title.length - sourceBlock.properties.title.length,
                end: mergeResult.properties.title.length - sourceBlock.properties.title.length
            });
            inputRefs.current[mergeResult.id]?.current.focus();
        }
        
        return;
    }

    /**
     * @deprecated
     * handleSubmitEditing is now handled within each block component for more flexibility.
     */
    const handleSubmitEditing = () => {
        const block = updateBlockData(
            blocks[blockId],
            {
                properties:
                { 
                    title: valueRef.current,
                }
            }
        );
        const selection = selectionRef.current;

        /**
         * This is a hack.
         * When splitting a block into another block type, the current block must rerender to change to the corresponding block component.
         * That rerender can make the keyboard flicker, so to prevent that we need to focus the ghost input and after the render, focus the block again.
         *  */
        if (block.type !== defaultBlockType) {
            inputRefs.current["ghostInput"]?.current.focus();
        }

        /**
         * The timeout is bearly noticeable, but it is needed to prevent the keyboard from flickering.
         * It gives times for the ghost input to be focused before rerendering any block, preventing
         * keyboard flickering.
         */

        const { nextBlock } = splitBlock(block, selection);

        inputRefs.current[nextBlock.id]?.current.setText(nextBlock.properties.title);
        setTimeout(() => {
            inputRefs.current[nextBlock.id]?.current.setSelection({
                start: 0,
                end: 0
            });
            inputRefs.current[nextBlock.id]?.current.focus();
        }, 0);

        return;
    };

    const handleOnFocus = () => {
        setFocusedBlockId(blockId);
    }

    const handleChangeText = (text: string) => {
        valueRef.current = text;
    }

    const getTextInputProps : () => TextInputProps = () => {
        return {
            ref: inputRef,
            defaultValue: valueRef.current,
            /** Disable multiline text input scrolling. */
            scrollEnabled: false,
            multiline: true,
            selectionColor: "black",
            /** Prevents keyboard from flickering when focusing a new block. */
            submitBehavior: "submit",
            selectTextOnFocus: false,
            smartInsertDelete: false,
            /** Prevents the text input being accidentally focused when scrolling/moving a block. */
            editable: isEditable,

            onSelectionChange: handleSelectionChange,
            showSoftInputOnFocus: showSoftInputOnFocus,
            onChangeText: handleChangeText,
            onBlur: handleOnBlur,
            onFocus: handleOnFocus,
            onSubmitEditing: handleSubmitEditing,
            onKeyPress: (event) => {
                if (event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0) {
                    handleOnKeyPress(event);
                }
            }
            
        }
    }

    React.useEffect(() => {
        if (inputRef.current) {
            registerRef(blockId, api);

            /** 
             * PATCH: Know issue on latest react-native version.
             * [#52854](https://github.com/facebook/react-native/issues/52854)
             */
            if (title.length === 0) {
                try {
                    inputRef.current.setNativeProps({ text: " " });
                    inputRef.current.setNativeProps({ text: "" });
                } catch (error) {
                    console.error(error);
                }
            }
        }
        /** Needs review:
         * The below code was commented because some input refs where
         * being unregistered when they where still mounted.
         * It might be related to the text inputs being re rendered.
         *  */
        
        /* return () => {
            unregisterRef(blockId);
            console.log("UnregisterUNREGISTERed block", blockId);
        }; */
    }, []);

    return {
        getTextInputProps,
        isFocused,
        getValue: () => valueRef.current,
        getSelection: () => selectionRef.current
    };
}