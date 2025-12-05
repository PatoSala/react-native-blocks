import { useEffect, useState, createContext, useContext, useRef, RefObject, SetStateAction } from "react";
import { View, Text, StyleSheet, Pressable, Keyboard, FlatList } from "react-native";
import { MaterialCommunityIcons, Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useKeyboardStatus } from "../../hooks/useKeyboardStatus";

import InsertBlockSection from "./tabs/InsertBlockSection";
import ReplaceBlockSection from "./tabs/ReplaceBlockSection";
import { ScrollView } from "react-native-gesture-handler";
import { useBlocksContext } from "../BlocksContext";
import { useTextBlocksContext } from "../TextBlocksProvider";
import { findPrevTextBlockInContent } from "../../core";
import { useBlockRegistrationContext } from "../BlockRegistration";

interface FooterButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    style?: any;
}

interface FooterProps {
    children: React.ReactNode;
    style?: StyleSheet;
}

interface FooterContext {
    activeTab: "none" | "keyboard" | "add-block" | "turn-block-into";
    hidden: boolean;
    inputRefs: RefObject<any>;
    setShowSoftInputOnFocus?: SetStateAction<boolean>;
    setActiveTab: (tab: string) => void;
    setHidden: (hidden: boolean) => void;
}

const FooterContext = createContext({
    activeTab: "none",
    hidden: true,
    setActiveTab: (tab: string) => {},
    setHidden: (hidden: boolean) => {}
});

export const useFooterContext = () => {
    const context = useContext(FooterContext);
    if (!context) {
        throw new Error("useFooterContext must be used within a FooterProvider");
    }
    return context;
}

Footer.ContextProvider = ({ children/* , refs, setShowSoftInputOnFocus */ }) => {
    const [footerContext, setFooterContext] = useState({
        activeTab: "",
        hidden: true,
    });

    const value = {
        activeTab: footerContext.activeTab,
        hidden: footerContext.hidden,
        setActiveTab: (tab: string) => {
            setFooterContext(prevState => ({
                ...prevState,
                activeTab: tab
            }));
        },
        setHidden: (hidden: boolean) => {
            setFooterContext(prevState => ({
                ...prevState,
                hidden
            }));
        }
    };
    
    return (
        <FooterContext.Provider value={value}>
            {children}
        </FooterContext.Provider>
    );
};

export default function Footer({
    children,
    style,
} : FooterProps) {
    const { isKeyboardOpen, keyboardHeight } = useKeyboardStatus();
    const { hidden, setActiveTab, setHidden, activeTab } = useFooterContext();

    useEffect(() => {
        if (isKeyboardOpen) {
            setActiveTab("keyboard");
            setHidden(false);
        }
    }, [isKeyboardOpen]);

    return (
        <View style={{
            position: "absolute",
            bottom: hidden ? -keyboardHeight - 100 : 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "white"
        }}>
            <View style={[styles.container, {
                width: "100%",
            }]}>
                <ScrollView
                    keyboardShouldPersistTaps="always"
                    horizontal
                >
                    {children}
                </ScrollView>

                {/* Needs revision. The ideal would be this to happen on the Editor component */}
                <View style={{ paddingHorizontal: 4 }}>
                    {activeTab === "keyboard"
                    ? <Footer.DismissKeyboard/>
                    : <Footer.OpenKeyboard/>}
                </View>
            </View>


            {activeTab && (
                <View style={[styles.tabSectionContainer, { height: keyboardHeight }]}>
                    {activeTab === "add-block"
                        ? <InsertBlockSection 
                            setActiveTab={setActiveTab}
                            setHidden={setHidden}/>
                        : null}
                    {activeTab === "turn-block-into"
                        ? <ReplaceBlockSection/>
                        : null}
                </View>
            )}
        </View>
    )
}

Footer.Button = ({ children, onPress, style } : FooterButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.5 : 1 },
                style
            ]}
        >
            {children}
        </Pressable>
    )
}

Footer.AddBlock = () => {
    const { activeTab, setActiveTab } = useFooterContext();
    const { inputRefs, setShowSoftInputOnFocus } = useTextBlocksContext();
    const { focusedBlockId } = useBlocksContext();

    const handleOnPress = () => {
        setShowSoftInputOnFocus(false);
        setActiveTab("add-block");
        Keyboard.dismiss();
        requestAnimationFrame(() => {
            inputRefs.current[focusedBlockId].current.focus();
        })
    };

    return (
        <Footer.Button onPress={handleOnPress}>
            <FontAwesome6 name="add" size={20} color="black" />
        </Footer.Button>
    )
}

Footer.TurnBlockInto = () => {
    const { activeTab, setActiveTab } = useFooterContext();
    const { inputRefs, setShowSoftInputOnFocus } = useTextBlocksContext();
    const { focusedBlockId, blocksOrder } = useBlocksContext();

    const handleOnPress = () => {
        setShowSoftInputOnFocus(false);
        setActiveTab("turn-block-into");
        Keyboard.dismiss();
        requestAnimationFrame(() => {
            inputRefs.current[focusedBlockId].current.focus();
        })
    };

    if (blocksOrder[0] === focusedBlockId) return null;

    return (
        <Footer.Button onPress={handleOnPress}>
            <Feather name="repeat" size={20} color="black" />
        </Footer.Button>
    )
}

Footer.RemoveBlock = () => {
    const { setHidden, setActiveTab } = useFooterContext();
    const { focusedBlockId, setFocusedBlockId, removeBlock, blocksOrder, blocks } = useBlocksContext();
    const { inputRefs } = useTextBlocksContext();
    const { textBasedBlocks } = useBlockRegistrationContext(); 

    const handleOnPress = () => {
        const prevTextBlock = findPrevTextBlockInContent(focusedBlockId, blocks, textBasedBlocks);
        if (prevTextBlock) {
            setActiveTab("keyboard");
            inputRefs.current[prevTextBlock.id].current.focus();

        } else {
            setActiveTab("none");
            setHidden(true);
        };
        
        requestAnimationFrame(() => {
            removeBlock(focusedBlockId);
        });
    }

    if (blocksOrder[0] === focusedBlockId) return null;

    return (
        <Footer.Button onPress={handleOnPress}>
            <FontAwesome6 name="trash-can" size={20} color="black" />
        </Footer.Button>
    )
}

Footer.DismissKeyboard = () => {
    const { setHidden, setActiveTab } = useFooterContext();
    const { setShowSoftInputOnFocus } = useTextBlocksContext();
    const { setFocusedBlockId } = useBlocksContext();

    const handleOnPress = () => {
       setShowSoftInputOnFocus(true);
       setHidden(true);
       setActiveTab("none");
       setFocusedBlockId("");
       Keyboard.dismiss();
    };

    return (
        <Footer.Button style={[styles.keyboardDown]} onPress={handleOnPress}>
            <FontAwesome6 name="keyboard" size={20} color="black" />
                <View style={styles.keyboardArrowContainer}>
                    <FontAwesome6 name="chevron-down" size={10} color="black"/>
                </View>
        </Footer.Button>
    )
}

Footer.OpenKeyboard = () => {
    const { setActiveTab } = useFooterContext();
    const { setShowSoftInputOnFocus, inputRefs } = useTextBlocksContext();
    const { focusedBlockId } = useBlocksContext();

    const handleOpenKeyboard = () => {
        setActiveTab("keyboard");
        inputRefs.current[focusedBlockId].current.focus();
        setShowSoftInputOnFocus(true);
    };


    return (
        <Footer.Button onPress={handleOpenKeyboard}>
            <FontAwesome6 name="circle-xmark" size={20} color="black" />
        </Footer.Button>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        flexDirection: "row",
        boxShadow: "0px -1px 0px rgba(0, 0, 0, 0.1)"
    },
    button: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    tabSectionContainer: {
        backgroundColor: "#f5f5f5",
    },
    keyboardDown: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        paddingBottom: 4
    },
    keyboardArrowContainer: {
        position: "absolute",
        bottom: 8
    }
});