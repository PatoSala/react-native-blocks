import { useTextInput, DragProvider } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";

interface Props {
    blockId: string
}

export function QuoteBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);

    return (
        <DragProvider blockId={blockId}>
            <View style={styles.container}>
                <View style={styles.quote}>
                    <View style={styles.border}/>
                    
                    <TextInput
                        key={blockId}
                        style={styles.text}
                        {...getTextInputProps()}
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