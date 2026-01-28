import { useState } from "react";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { Octicons, Ionicons } from '@expo/vector-icons';
import { ContextMenu, useContextMenu } from "../ContextMenu/ContextMenu";
import { useBlocksContext } from "@react-native-blocks/core";

export function WebControlls({ blockId }) {
    const { show } = useContextMenu();
    const { removeBlock, turnBlockInto } = useBlocksContext();

    const [turnIntoModal, setTurnIntoModal] = useState(false);

    const handleDeleteBlock = () => {
        removeBlock(blockId);
    }

    const handleTurnInto = (blockType) => {
        turnBlockInto(blockId, blockType);
        setTurnIntoModal(false);
    }

    return (
        <>
            <View style={styles.layout}>
                <Pressable style={({ hovered }) => [styles.button, hovered && styles.hover]}>
                    <Ionicons name="add" size={24} color="#ada9a3" />
                </Pressable>

                <Pressable
                    onPress={show}
                    style={({ hovered }) => [styles.button, { width: 20 }, hovered && styles.hover, { cursor: "grabbing" }]}
                >
                    <Octicons name="grabber" size={24} color="#ada9a3" />
                </Pressable>
            </View>

            <ContextMenu.Backdrop>
                    <ContextMenu>
                        <ContextMenu.SubTitle>Text</ContextMenu.SubTitle>
                        <ContextMenu.Item
                            onHoverIn={(e) => setTurnIntoModal(true)}
                            /* onHoverOut={() => setTurnIntoModal(false)} */
                        >
                            <Text style={styles.itemText}>Turn into</Text>
                            <Ionicons name="chevron-forward" size={16} color="#ada9a3" />
                        </ContextMenu.Item>
                        <ContextMenu.Item onPress={handleDeleteBlock}>
                            <Text style={styles.itemText}>Delete</Text>
                        </ContextMenu.Item>
                        <ContextMenu.Separator/>
                        <View style={{ padding: 2 }}/>

                        {turnIntoModal && (
                            <ContextMenu style={{ position: "absolute" }}>
                                <ContextMenu.Item onPress={() => handleTurnInto("text")}>
                                    <Text style={styles.itemText}>Text</Text>
                                </ContextMenu.Item>

                                <ContextMenu.Item onPress={() => handleTurnInto("header")}>
                                    <Text style={styles.itemText}>Heading 1</Text>
                                </ContextMenu.Item>

                                <ContextMenu.Item onPress={() => handleTurnInto("sub_header")}>
                                    <Text style={styles.itemText}>Heading 2</Text>
                                </ContextMenu.Item>

                                <ContextMenu.Item onPress={() => handleTurnInto("sub_sub_header")}>
                                    <Text style={styles.itemText}>Heading 3</Text>
                                </ContextMenu.Item>
                            </ContextMenu>
                        )}
                    </ContextMenu>

                    
                </ContextMenu.Backdrop>
        </>
    )
}

const styles = StyleSheet.create({
    layout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        /* position: "absolute",
        top: 4,
        left: -58, */
        zIndex: 80,
        /* padding: 8 */
    },
    button: {
        width: 24,
        height: 24,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center"
    },
    hover: {
        backgroundColor: "#37352f0f"
    },
    itemText: {
        fontSize: 14,
        color: "#2C2C2B",
        flexGrow: 1
    }
})