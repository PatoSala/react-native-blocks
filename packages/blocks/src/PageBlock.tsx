import React, { useState } from "react";
import {
    useTextInput,
    useBlocksContext,
    useTextBlocksContext,
    useBlock,
    updateBlockData,
    createBlock,
    DragProvider
} from "@react-native-blocks/core";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Modal, Button, Image, Dimensions, Pressable } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");

function containsEmoji(str: string) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;
  return emojiRegex.test(str);
}

interface Props {
    blockId: string
}

export function PageBlock({ blockId } : Props) {
    const {
        getTextInputProps,
        getValue,
        getSelection
    } = useTextInput(blockId);
    const {
        blocks,
        insertBlock,
        updateBlock,
        updateBlockV2,
        blocksOrder,
    } = useBlocksContext();
    const {
        inputRefs
    } = useTextBlocksContext();
    const { properties } = useBlock(blockId);

    // This condition should be renamed to "isFirstBlock" or sth like that.
    const isRootBlock = blocks["root"].content[0] === blockId;
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [pageIcon, setPageIcon] = useState<string | null>(blocks[blockId]?.format?.page_icon || null);
    const [pageCover, setPageCover] = useState<string | null>(blocks[blockId]?.format?.page_cover || null);
    const placeholder = "New page";

    const pickCover = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        });
    
        if (!result.canceled) {
          setPageCover(result.assets[0].uri);
    
          const updatedBlock = updateBlockData(blocks[blockId], {
            format: {
                page_cover: result.assets[0].uri
                /* page_cover_position */
            }
          });
    
          updateBlock(updatedBlock);
        }
    }

    const pickIcon = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 1,
          aspect: [4, 3]
        });
    
        if (!result.canceled) {
          setPageIcon(result.assets[0].uri);
          /* setAspectRatio(result.assets[0].width / result.assets[0].height); */
            setShowEmojiSelector(false);

          const updatedBlock = updateBlockData(blocks[blockId], {
            format: {
                page_icon: result.assets[0].uri,
                ...blocks[blockId]?.format
            }
          });
    
          updateBlock(updatedBlock);
        }
      };

    const handleEmojiSelect = (emoji: string) => {
        setPageIcon(emoji);
        setShowEmojiSelector(false);

        const updatedBlock = updateBlockData(blocks[blockId], {
            format: {
            page_icon: emoji,
            ...blocks[blockId]?.format
            }
        });

        updateBlock(updatedBlock);
    };

    const handleRemoveIcon = () => {
        setPageIcon(null);
        setShowEmojiSelector(false);

        const block = blocks[blockId];
        delete block.format.page_icon;

        updateBlock(block);
    };

    const handleRemoveCover = () => {
        setPageCover(null);

        const block = blocks[blockId];
        delete block.format.page_cover;

        updateBlock(block);
    };

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        if (selection.start === value.length && selection.end === value.length) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blockId,
                content: []
            });

            insertBlock(newBlock, {
                nextBlockId: blocks[blockId].content[0]
            });

            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            })
            return;
        }

        if (selection.start === 0 && selection.end === 0) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: value
                },
                parent: blockId,
                content: []
            });

            updateBlockV2(blockId, {
                properties: {
                    title: ""
                }
            });

            insertBlock(newBlock, {
                nextBlockId: blocks[blockId].content[0]
            });

            requestAnimationFrame(() => {
                inputRefs.current[blockId].current.setText("");
                inputRefs.current[newBlock.id]?.current.setSelection({
                    start: 0,
                    end: 0
                });
                inputRefs.current[newBlock.id]?.current.focus();
            })
            return;
        }

        const textBeforeSelection = value.substring(0, selection.start);
        const textAfterSelection = value.substring(selection.end);

        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blockId,
            content: []
        });

       updateBlockV2(blockId, {
            properties: {
                title: textBeforeSelection
            }
         });

       insertBlock(newBlock, {
           nextBlockId: blocks[blockId].content[0]
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
            return;
        }
    }

    return (
        <>
            { isRootBlock && pageCover
                ? (
                    <View style={styles.cover}>
                        <View style={{
                            position: "absolute",
                            top: 8,
                            right: 16,
                            display: pageCover === null ? "none" : "flex",
                            flexDirection: "row",
                            gap: 8
                        }}>
                            <Pressable style={[styles.coverBtn, { display: pageIcon === null ? "flex" : "none" }]} onPress={() => setShowEmojiSelector(true)}>
                                <Text style={styles.pageBtnText}>Add icon</Text>
                            </Pressable>
                            
                            <Pressable style={styles.coverBtn} onPress={handleRemoveCover}>
                                <Text style={styles.pageBtnText}>Remove cover</Text>
                            </Pressable>
                        </View>

                        <Image
                            source={{ uri: pageCover }}
                            style={{ width: "100%", height: 200 }}
                        />
                    </View>
                )
                : null}
            
            <View style={styles.container}>
                {isRootBlock
                ? (
                    <>
                        <View style={{
                            height: pageIcon ? 136 : 184,
                            display: pageCover === null ? "none" : "flex"
                        }}/>
                        
                        <View style={styles.root}>
                            {pageCover === null
                                ? (
                                    <View
                                        style={[styles.row, {
                                            marginBottom: 8,
                                        }]}
                                    >
                                        {pageIcon === null && (
                                            <TouchableOpacity style={styles.pageBtn} onPress={() => setShowEmojiSelector(true)}>
                                                <Text style={styles.pageBtnText}>Add icon</Text>
                                            </TouchableOpacity>
                                        )}

                                        {pageCover === null && (
                                            <TouchableOpacity style={styles.pageBtn} onPress={pickCover}>
                                                <Text style={styles.pageBtnText}>Add cover</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )
                                : null}

                            {pageIcon !== null ? (
                                <TouchableOpacity
                                    onPress={() => setShowEmojiSelector(true)}
                                    style={{
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        width: 64,
                                        height: 64,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    {containsEmoji(pageIcon) === false
                                        ? (
                                            <Image
                                                source={{ uri: pageIcon }}
                                                style={{ width: 64, height: 64 }}
                                            />
                                        )
                                        : (
                                            <Text style={{
                                                fontSize: 54
                                            }}>
                                                {pageIcon}
                                            </Text>
                                        )}
                                </TouchableOpacity>
                            ) : null}

                            <TextInput
                                key={`input-${blockId}`}   // Really important to pass the key prop
                                style={styles.page}
                                {...getTextInputProps()}
                                onSubmitEditing={handleSubmitEditing}
                                onKeyPress={handleOnKeyPress}
                                placeholder={placeholder}
                            />
                        </View>
                    </>
                )
                : (
                    <DragProvider blockId={blockId}>
                        <View style={styles.row}>
                            <TouchableOpacity
                                onPress={() => setShowEmojiSelector(true)}
                                style={styles.iconContainer}
                            >

                                {pageIcon === null
                                ? (
                                    <Ionicons name="document-text-outline" size={24} color="black" />
                                ) : (
                                    <>
                                        {containsEmoji(pageIcon) === false
                                        ? (
                                            <Image
                                                source={{ uri: pageIcon }}
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                        )
                                        : (
                                            <Text style={styles.icon}>
                                                {pageIcon}
                                            </Text>
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <Text style={styles.text}>
                                {properties.title.length === 0 ? placeholder : properties.title}
                            </Text>
                        </View>
                    </DragProvider>
                )}

                <Modal
                    visible={showEmojiSelector}
                    onRequestClose={() => setShowEmojiSelector(false)}
                    presentationStyle="pageSheet"
                    animationType="slide"
                >
                    <View style={styles.header}>
                        <Button
                            title="Remove"
                            onPress={handleRemoveIcon}
                        />
                        <Text style={styles.headerTitle}>Page Icon</Text>
                        <Button
                            title="Close"
                            onPress={() => setShowEmojiSelector(false)}
                        />
                    </View>

                    <View style={{ alignItems: "flex-start", marginHorizontal: 8 }}>
                        <Button
                            title="Upload image"
                            onPress={() => {
                                setShowEmojiSelector(false);
                                setTimeout(() => {
                                    pickIcon();
                                }, 1000);
                            }}
                        />
                    </View>

                    <EmojiSelector
                        columns={8}
                        showTabs={false}
                        onEmojiSelected={handleEmojiSelect}
                    />
                </Modal>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    root: {
        marginTop: 32,
        gap: 8,
        marginBottom: 4
    },
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    cover: {
        width: width + 32,
        top: 0,
        left: -32,
        height: 100,
        position: "absolute"
    },
    coverBtn: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1,
        padding: 4,
        borderRadius: 4
    },
    page: {
        fontSize: 36,
        fontWeight: "bold",
        lineHeight: 42,
        marginBottom: 4,
        flexWrap: "wrap"
    },
    pageBtn: {
        flexDirection: "row",
        marginRight: 8
    },
    pageBtnText: {
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 22,
        color: "lightgray",
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap"
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 32,
        width: 32,
        borderRadius: 4,
        overflow: "hidden"
    },
    icon: {
        fontSize: 24,
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