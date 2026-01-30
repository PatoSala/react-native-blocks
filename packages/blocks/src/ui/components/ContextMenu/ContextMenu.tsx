import { useContext, createContext, useState, useImperativeHandle, useRef } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";

export function ContextMenu({ children, style, ref }) {
    const viewRef = useRef(null);
    console.log(viewRef);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useImperativeHandle(ref, () => ({
        show: (position: { x: number, y: number }) => {
            setVisible(true);
            setPosition({ x: position.x, y: position.y });
        },
        hide: () => {
            setVisible(false);
            setPosition({ x: 0, y: 0 });
        }
    }));

    return (
        <>
            <View
                ref={viewRef}
                style={[
                    styles.container,
                    {
                        left: position.x,
                        top: position.y,
                        display: visible ? "flex" : "none",
                        position: visible ? "fixed" : "none"
                    },
                    style
                ]}
            >
                {children}
            </View>
        </>
    )
}

ContextMenu.SubTitle = ({ children }) => {
    return (
        <View style={styles.subtitle}>
            <Text style={{ fontSize: 12, color: "#7D7A75", fontWeight: "500" }}>{children}</Text>
        </View>
    )
}

ContextMenu.Separator = () => {
    return (
        <View style={{ height: 1, backgroundColor: "#2a1c0012", marginHorizontal: 4 }} />
    )
}

ContextMenu.Item = ({ children, onPress, ...rest }) => {
    return (
        <Pressable style={({ hovered }) => [styles.item, hovered && styles.itemActive]} onPress={onPress} {...rest}>
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 265,
        minWidth: 180, 
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 14px 28px -6px #0000001a,0px 2px 4px -1px #0000000f,0 0 0 1px #54483114",
        padding: 4,
        gap: 1,
        zIndex: 99
    },
    subtitle: {
        fontSize: 12,
        color: "#7D7A75",
        paddingHorizontal: 8,
        marginTop: 6,
        marginBottom: 8,
    },
    item: {
        paddingHorizontal: 8,
        minHeight: 28,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    itemActive: {
        backgroundColor: "#37352f0f"
    }
})