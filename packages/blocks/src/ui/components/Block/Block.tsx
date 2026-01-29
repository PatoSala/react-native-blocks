import { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";

export function BlockLayout({ children }) {
    const [hovered, setHovered] = useState(false);
    
    return (
        <View
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={[
                Platform.OS === "web" && {
                    paddingHorizontal: "22%",
                }
            ]}
        >
            {children(hovered)}
        </View>
    );
}

const styles = StyleSheet.create({
    layout: {
    }
})