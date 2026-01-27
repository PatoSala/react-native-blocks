import { Pressable, View, StyleSheet, Text } from "react-native";
import { Octicons, Ionicons } from '@expo/vector-icons';
import { ContextMenu, useContextMenu } from "../ContextMenu/ContextMenu";
import { useBlocksContext } from "@react-native-blocks/core";

export function WebControlls({ blockId }) {
    const { show } = useContextMenu();
    const { removeBlock } = useBlocksContext();

    const handleDeleteBlock = () => {
        removeBlock(blockId);
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
                        <ContextMenu.Item>
                            <Text style={styles.itemText}>Turn into</Text>
                            <Ionicons name="chevron-forward" size={16} color="#ada9a3" />
                        </ContextMenu.Item>
                        <ContextMenu.Item onPress={handleDeleteBlock}>
                            <Text style={styles.itemText}>Delete</Text>
                        </ContextMenu.Item>
                        <ContextMenu.Separator/>
                        <View style={{ padding: 2 }}/>
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
        position: "absolute",
        top: 0,
        left: -58,
        zIndex: 99,
        padding: 8
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