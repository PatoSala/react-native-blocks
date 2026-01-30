import { Text, StyleSheet } from "react-native";
import { ContextMenu } from "../../ui/components/ContextMenu/ContextMenu";
import { useBlocksContext } from "@react-native-blocks/core";

export function DeleteBlock({ blockId }) {
    const { removeBlock } = useBlocksContext();

    const handleRemoveBlock = () => {
        removeBlock(blockId);
    }

    return (
        <ContextMenu.Item onPress={handleRemoveBlock}>
            <Text style={styles.text}>Delete</Text>
        </ContextMenu.Item>
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