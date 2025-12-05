import {
    useTextInput,
    useBlocksContext,
    useTextBlocksContext,
    createBlock,
    updateBlockData,
    findPrevTextBlockInContent,
    DragProvider
} from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";

interface Props {
    blockId: string
}

export function HeaderBlock({ blockId } : Props) {
    const { getTextInputProps, isFocused, getValue, getSelection } = useTextInput(blockId); // Maybe in the future we can pass a ref to use useImperativeHandle
    const {
        blocks,
        turnBlockInto,
        insertBlock,
        updateBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();
    const { inputRefs, textBasedBlocks } = useTextBlocksContext();
    const placeholder = "Header 1";

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        if (value.length === 0) {
            inputRefs.current["ghostInput"]?.current.focus();
            // This timeout prevents the keyboard flicker
            setTimeout(() => {
                turnBlockInto(blockId, "text"); // Maybe this type should be thee defaultBlockType (?)

                requestAnimationFrame(() => {
                    inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
                });
            }, 0);
            return;
        }

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

        inputRefs.current["ghostInput"]?.current.focus();

        const updatedBlock = updateBlockData(blocks[blockId], {
            properties: {
                title: textBeforeSelection
            }
        });
        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blocks[blockId].parent,
            content: []
        });

       updateBlock(updatedBlock);
       insertBlock(newBlock, {
           prevBlockId: blockId
       });

       requestAnimationFrame(() => {
           inputRefs.current[updatedBlock.id]?.current.setText(updatedBlock.properties.title);
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

            inputRefs.current["ghostInput"]?.current.focus();

            const previousTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);
            
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
                        inputRefs.current[parentBlock.id]?.current.setText(parentBlock.properties.title + value); // Find a way so that blocks update their content automatically
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
                inputRefs.current[previousTextBlock.id]?.current.setText(previousTextBlock.properties.title + value); // Find a way so that blocks update their content automatically
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
                <TextInput
                    // ref={inputRef}
                    key={blockId}
                    style={styles.header}
                    {...getTextInputProps()}
                    placeholder={placeholder}
                    onSubmitEditing={handleSubmitEditing}
                    onKeyPress={handleOnKeyPress}
                />
            </View>
        </DragProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        marginTop: 32,
        marginBottom: 8,
        lineHeight: 34,
        flexWrap: "wrap"
    }
});