import { useTextInput, DragProvider, useTextBlocksContext, useBlocksContext, createBlock, findPrevTextBlockInContent } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";

interface Props {
    blockId: string
}

export function QuoteBlock({ blockId } : Props) {
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
            inputRefs.current["ghostInput"]?.current.focus();

            setTimeout(() => {
                updateBlockV2(blockId, {
                    type: "text",
                    properties: {
                        title: value
                    }
                });
                requestAnimationFrame(() => {
                    inputRefs.current[blockId]?.current.setSelection({
                        start: 0,
                        end: 0
                    })
                    inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
                });
            }, 0);
        }
    };

    return (
        <DragProvider blockId={blockId}>
            <View style={styles.container}>
                <View style={styles.quote}>
                    <View style={styles.border}/>
                    
                    <TextInput
                        key={blockId}
                        style={styles.text}
                        {...getTextInputProps()}
                        onKeyPress={handleOnKeyPress}
                        onSubmitEditing={handleSubmitEditing}
                    />
                </View>
            </View>
        </DragProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        marginVertical: 16,
    },
    quote: {
        flexDirection: "row",
        overflow: "hidden",
        boxSizing: "border-box",
        paddingRight: 16,
        alignItems: "center",
        gap: 12
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 24,
        marginRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        flexGrow: 1
    },
    border: {
        width: 2.5,
        height: "100%",
        backgroundColor: "#000000"
    }
});