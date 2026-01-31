import { useState } from "react";
import { View } from "react-native";

/**
 * Web only
 */
export function Hoverable({ children, style }) {
    const [hovered, setHovered] = useState(false);

    return (
        <View
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children({ hovered })}
        </View>
    )
}