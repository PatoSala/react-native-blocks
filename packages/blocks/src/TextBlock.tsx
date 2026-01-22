import { useState } from "react";
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

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        if (selection.start === 0 && selection.end === 0) {
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
            return;
        }

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
                inputRefs.current[newBlock.id]?.current.focus();
            });
            return;
        }

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

    // Used to make the text area grow with the content on web
    const [textAreaHeight, settextAreaHeight] = useState(0);

    return (
        <DragProvider blockId={blockId}>
            <View style={styles.container}>
                {Platform.OS === "web" && <WebControlls/>}
                <TextInput
                    // ref={inputRef} ??? 
                    key={`input-${blockId}`}   // Really important to pass the key prop
                    style={[
                        styles.text,
                        Platform.OS === "web" && { height: textAreaHeight }
                    ]}
                    {...getTextInputProps()}
                    onKeyPress={handleOnKeyPress}
                    onSubmitEditing={handleSubmitEditing}
                    /** Web only */
                    onContentSizeChange={(event) => {
                        settextAreaHeight(event.nativeEvent.contentSize.height);
                    }}
                />
            </View>
        </DragProvider>
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
        lineHeight: 24,
        flexWrap: "wrap"
    }
});