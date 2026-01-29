import { useContext, createContext, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";

const ContextMenuContext = createContext(null);

export const useContextMenu = () => useContext(ContextMenuContext);

export function ContextMenu({ children, style }) {
    const { position } = useContextMenu();

    return (
        <View style={[styles.container, { left: position.x, top: position.y }, style]}>
            {children}
        </View>
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

ContextMenu.Backdrop = ({ children }) => {
    const { hide, visible } = useContextMenu();

    return (
        <Pressable
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                display: visible ? "flex" : "none",
                flex: 1,
                zIndex: 98,
                width: "100%",
                height: "100%",
            }}
            onPress={() => hide(false)}
        >
            {children}
        </Pressable>
    )
}

ContextMenu.Provider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [context, setContext] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    console.log("position", position);

    const handleShow = (event) => {
        console.log("event", event);
        setVisible(true);
        setPosition({ x: event.nativeEvent.pageX - 265 - 12, y: event.nativeEvent.pageY - 100 });
    }

    const  value = {
        visible,
        show: handleShow,
        hide: () => setVisible(false),
        context,
        setContext,
        position
    }

    return (
        <ContextMenuContext.Provider value={value}>
            {children}
        </ContextMenuContext.Provider>
    )
}

ContextMenu.Assambled = ({ options, position }) => {
    return (
        <ContextMenu.Provider>
            <ContextMenu.Backdrop>
                <ContextMenu>
                    
                </ContextMenu>
            </ContextMenu.Backdrop>
        </ContextMenu.Provider>
    );
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