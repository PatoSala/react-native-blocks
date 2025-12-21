import { useState } from "react";
import { 
    useTextInput,
    useBlocksContext,
    DragProvider,
    useTextBlocksContext,
    createBlock,
    findPrevTextBlockInContent
} from "@react-native-blocks/core";
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    Button,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import FormSheetModal from "./components/Modal/FormSheetModal";

interface Props {
    blockId: string
}

const { width } = Dimensions.get("window");

export function CalloutBlock({ blockId } : Props) {
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState("💡");

    const { getTextInputProps, getValue, getSelection } = useTextInput(blockId);
    const { inputRefs, textBasedBlocks } = useTextBlocksContext();
    const {
        blocks,
        insertBlock,
        selectedBlockId,
        setSelectedBlockId,
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

    const handleRemoveBlock = () => {
        setSelectedBlockId(null);
        setTimeout(() => {
            removeBlock(blockId);
        }, 100);
    };

    return (
        <DragProvider blockId={blockId}>
            <View style={styles.container}>
                <View style={styles.callout}>
                    <TouchableOpacity
                        onPress={() => setShowEmojiSelector(true)}
                        style={styles.iconContainer}>
                        <Text style={styles.icon}>
                            {selectedEmoji}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        key={blockId}
                        style={styles.text}
                        {...getTextInputProps()}
                        onKeyPress={handleOnKeyPress}
                        onSubmitEditing={handleSubmitEditing}
                    />
                </View>
            </View>

            <FormSheetModal
                title="Actions"
                visible={selectedBlockId === blockId}
                onClose={() => setSelectedBlockId(null)}
            >
                <FormSheetModal.Section
                    title="Image"
                    options={[
                        {
                        title: "Remove",
                        style: { color: "red" },
                        onPress: handleRemoveBlock
                        }
                    ]}
                />
            </FormSheetModal>

            <Modal
                visible={showEmojiSelector}
                onRequestClose={() => setShowEmojiSelector(false)}
                presentationStyle="pageSheet"
                animationType="slide"

            >
                <View style={styles.header}>
                    <View style={{ width: 64 }}/>
                    <Text style={styles.headerTitle}>Pick emoji</Text>
                    <Button
                        title="Close"
                        onPress={() => setShowEmojiSelector(false)}
                    />
                </View>

                <EmojiSelector
                    columns={8}
                    showTabs={false}
                    onEmojiSelected={(emoji) => {
                        setShowEmojiSelector(false);
                        setSelectedEmoji(emoji);
                    }}
                />
            </Modal>
        </DragProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    callout: {
        backgroundColor: "#efefef",
        paddingVertical: 16,
        marginBottom: 8,
        borderRadius: 12,
        flexDirection: "row",
        overflow: "hidden",
        boxSizing: "border-box"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 22,
        width: width - 92,
        marginRight: 16,
    },
    iconContainer: {
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
        height: 32,
        width: 32
    },
    icon: {
        fontSize: 16,
    },
    header: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "500"
    }
});