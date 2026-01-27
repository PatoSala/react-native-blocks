import { useRef, useState } from "react";
import {
    useTextInput,
    useWebTextInput,
    useBlocksContext,
    findPrevTextBlockInContent,
    useTextBlocksContext,
    createBlock,
    DragProvider
} from "@react-native-blocks/core";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { WebControlls } from "./components/WebControlls/WebControlls";
import { ContextMenu } from "./components/ContextMenu/ContextMenu";

/**
 * It could be a good idea to create a way to define a block's strucuture (like an interface) and
 * use that structure to register the block.
 * 
 * @example
 * const textBlock = {
 *     {text block properties here}
 * }
 * 
 * Then this structure could be used at the moment of registering the block.
 */

interface Props {
    blockId: string
}

export function TextBlock({ blockId } : Props) {
    const { getTextInputProps, getValue, getSelection } = Platform.OS === "web" ? useWebTextInput(blockId) : useTextInput(blockId);

    const { inputRefs, textBasedBlocks } = useTextBlocksContext();
    const {
        blocks,
        insertBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();

    const handleWebTextInputHeight = (inputRef, minHeight = 24) => {
        inputRef?.current?.setHeight(`${minHeight}px`);
        inputRef?.current?.setHeight(`${inputRef.current.scrollHeight}px`);
    }

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        Platform.OS === "web" && handleWebTextInputHeight(inputRefs.current[blockId]);

        /** Insert a new empty block above */
        if (selection.start === 0 && selection.end === 0) {
            console.log("Insert a new empty block above");
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blocks[blockId].parent,
                content: []
            });

            insertBlock(newBlock, {
                nextBlockId: blockId
            });


            /** Focusing through dom ref works. For some reason using inputRef.current[blockId].current.focus() doesn't work */
            Platform.OS === "web" && inputRefs.current[blockId]?.getRef().current.focus();

            return;
        }

        /** Insert a new empty block below */
        if (selection.start === value.length && selection.end === value.length) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blocks[blockId].parent,
                content: []
            });

            insertBlock(newBlock, {
                prevBlockId: blockId
            });

            requestAnimationFrame(() => {
                inputRefs.current[blockId]?.current.setText("");
                inputRefs.current[newBlock.id]?.current.setSelection({
                    start: 0,
                    end: 0
                });
                inputRefs.current[newBlock.id]?.current.focus();
            });
            return;
        }

        /** Default behavior */
        const textBeforeSelection = value.substring(0, selection.start);
        const textAfterSelection = value.substring(selection.end);

        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blocks[blockId].parent,
            content: []
        });

        updateBlockV2(blockId, {
            properties: {
                title: textBeforeSelection
            }
         });

        insertBlock(newBlock, {
            prevBlockId: blockId
        });

        requestAnimationFrame(() => {
            inputRefs.current[blockId]?.current.setText(textBeforeSelection);
            inputRefs.current[newBlock.id]?.current.setSelection({
                start: 0,
                end: 0
            });
            inputRefs.current[newBlock.id]?.current.focus();
        });
    }

   const handleOnKeyPress = (event: { nativeEvent: { key: string; }; }) => {
        const value = getValue();
        const selection = getSelection();

        /** When cursor is at position 0 and backspace is pressed, merge with previous text block */
        if (event.nativeEvent.key === "Backspace" && selection.start === 0 && selection.end === 0) {
            // findPrevTextBlock
            const previousTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);
            
            inputRefs.current["ghostInput"]?.current.focus();


            if (previousTextBlock === undefined) {
                const parentBlock = blocks[blocks[blockId].parent];
                const isTextBased = textBasedBlocks.includes(parentBlock.type);
                
                if (isTextBased) {
                    updateBlockV2(parentBlock.id, {
                        properties: {
                            title: parentBlock.properties.title + value
                        }
                    });

                    requestAnimationFrame(() => {
                        inputRefs.current[parentBlock.id]?.current.setText(parentBlock.properties.title + value);
                        inputRefs.current[parentBlock.id]?.current.setSelection({
                            start: parentBlock.properties.title.length,
                            end: parentBlock.properties.title.length
                        })
                        inputRefs.current[parentBlock.id]?.current.focus();
                    });
                    removeBlock(blockId);

                }
                return;
            }

            updateBlockV2(previousTextBlock.id, {
                properties: {
                    title: previousTextBlock.properties.title + value
                }
            });
            removeBlock(blockId);

            requestAnimationFrame(() => {
                inputRefs.current[previousTextBlock.id]?.current.setText(previousTextBlock.properties.title + value);
                inputRefs.current[previousTextBlock.id]?.current.setSelection({
                    start: previousTextBlock.properties.title.length,
                    end: previousTextBlock.properties.title.length
                })
                inputRefs.current[previousTextBlock.id]?.current.focus();
            });
        }

        /** 
         * [Experimental]
         * Instead of updating block data onBlur we'll try to do it onKeyPress.
         * We could add a debouncing effect to this onKeyPress event listener.
         */
        /* updateBlockV2(blockId, {
            properties: {
                title: value
            }
        }) */
    };

    return (
        <ContextMenu.Provider>
            <DragProvider blockId={blockId}>
                <View style={styles.container}>
                    <TextInput
                        style={[styles.text]}
                        {...getTextInputProps()}
                        /** Web only */
                        {...Platform.OS === "web" && {
                            onLayout: () => {
                                inputRefs.current[blockId]?.current?.setHeight("0px");
                                inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                            },
                            onChangeText: (text) => {
                                getTextInputProps().onChangeText(text)

                                if (Platform.OS === "web") {
                                    window.requestAnimationFrame(() => {
                                        inputRefs.current[blockId]?.current?.setHeight("0px");
                                        inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                                    })
                                }
                            },
                            onContentSizeChange: () => {
                                window.requestAnimationFrame(() => {
                                    inputRefs.current[blockId]?.current?.setHeight("0px");
                                    inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                                })
                            }
                        }}

                        // ref={inputRef} ??? 
                        key={`input-${blockId}`}   // Really important to pass the key prop
                        
                        onKeyPress={handleOnKeyPress}
                        onSubmitEditing={handleSubmitEditing}
                    />

                    {Platform.OS === "web" && (
                        <>
                            <WebControlls blockId={blockId} />
                        </>
                    )}
                </View>
            </DragProvider>
        </ContextMenu.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        position: "relative"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        paddingHorizontal: 8,
        lineHeight: 24,
        flexWrap: "wrap",
        outline: 'none',
        outlineStyle: 'none',
        boxShadow: 'none',
        border: 'none',
    }
});