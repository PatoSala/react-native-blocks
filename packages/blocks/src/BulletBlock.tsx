import { useState } from "react";
import {
    useTextInput,
    useBlocksContext,
    findPrevTextBlockInContent,
    useTextBlocksContext,
    createBlock,
    DragProvider
} from "@react-native-blocks/core";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    blockId: string
}

export function BulletBlock({ blockId } : Props) {
    const { getTextInputProps, getValue, getSelection } = useTextInput(blockId);
    const { inputRefs, textBasedBlocks } = useTextBlocksContext();
    const {
        blocks,
        insertBlock,
        updateBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

         if (value.length === 0) {
            inputRefs.current["ghostInput"]?.current.focus();

            setTimeout(() => {
                updateBlockV2(blockId, {
                    type: "text",
                    properties: {
                        title: value
                    }
                });
                requestAnimationFrame(() => {
                    inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
                });
            }, 0);
            return;
        }

        if (selection.start === 0 && selection.end === 0) {
            const newBlock = createBlock({
                type: "bullet",
                properties: {
                    title: ""
                },
                parent: blocks[blockId].parent,
                content: []
            });

            insertBlock(newBlock, {
                nextBlockId: blockId
            });
            return;
        }

        if (selection.start === value.length && selection.end === value.length) {
            const newBlock = createBlock({
                type: "bullet",
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
                inputRefs.current[newBlock.id]?.current.focus();
            });
            return;
        }

        const textBeforeSelection = value.substring(0, selection.start);
        const textAfterSelection = value.substring(selection.end);

        const newBlock = createBlock({
            type: "bullet",
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

        if (event.nativeEvent.key === "Backspace" && selection.start === 0 && selection.end === 0) {
            // findPrevTextBlock

            if (value.length === 0) {
                inputRefs.current["ghostInput"]?.current.focus();

                setTimeout(() => {
                    updateBlockV2(blockId, {
                        type: "text",
                        properties: {
                            title: value
                        }
                    });
                    requestAnimationFrame(() => {
                        inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
                    });
                }, 0);
                return;
            }

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
                    removeBlock(blockId);

                    requestAnimationFrame(() => {
                        inputRefs.current[parentBlock.id]?.current.setText(parentBlock.properties.title + value);
                        inputRefs.current[parentBlock.id]?.current.setSelection({
                            start: parentBlock.properties.title.length,
                            end: parentBlock.properties.title.length
                        })
                        inputRefs.current[parentBlock.id]?.current.focus();
                    });
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
    };

    return (
        <DragProvider blockId={blockId}>
            <View style={styles.container}>
                <Text style={styles.bullet}>•</Text>
                <TextInput
                    // ref={inputRef} ??? 
                    key={`input-${blockId}`}   // Really important to pass the key prop
                    style={styles.text}
                    {...getTextInputProps()}
                    onKeyPress={handleOnKeyPress}
                    onSubmitEditing={handleSubmitEditing}
                />
            </View>
        </DragProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        flexGrow: 1,
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap",
    },
    bullet: {
        fontSize: 24,
        alignSelf: "center"
    }
});