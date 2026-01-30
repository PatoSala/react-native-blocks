import { useRef } from "react";
import { useBlocksContext } from "@react-native-blocks/core";
import { Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ContextMenu } from "../../ui/components/ContextMenu/ContextMenu";

/** web */
export function TurnInto({ blockId }) {
    const contextMenuRef = useRef(null);
    const { turnBlockInto, blockTypes } = useBlocksContext();

    return (
        <>
            <ContextMenu.Item onHoverIn={(e) => contextMenuRef.current.show({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}>
                <Text style={styles.text}>Turn into</Text>
                <Ionicons name="chevron-forward" size={16} color="#ada9a3" />
            </ContextMenu.Item>

            <ContextMenu ref={contextMenuRef}>
                {Object.keys(blockTypes).map(blockType => (
                    <ContextMenu.Item key={blockType} onPress={() => turnBlockInto(blockId, blockType)}>
                        <Text style={styles.itemText}>{blockTypes[blockType].options.name}</Text>
                    </ContextMenu.Item>
                ))}
            </ContextMenu>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 8,
    },
    text: {
        color: "#000",
        fontSize: 14,
        flexGrow: 1
    }
});