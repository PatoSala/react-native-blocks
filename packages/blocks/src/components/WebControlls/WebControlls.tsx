import { Pressable, View, StyleSheet } from "react-native";
import { Octicons, Ionicons } from '@expo/vector-icons';
export function WebControlls() {
    return (
        <View style={styles.layout}>
            <Pressable style={({ hovered }) => [styles.button, hovered && styles.hover]}>
                <Ionicons name="add" size={24} color="#ada9a3" />
            </Pressable>

            <Pressable style={({ hovered }) => [styles.button, { width: 20 }, hovered && styles.hover]}>
                <Octicons name="grabber" size={24} color="#ada9a3" />
            </Pressable>
        </View>
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
    }
})