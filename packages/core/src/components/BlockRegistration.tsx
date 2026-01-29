import React, { useContext, createContext, useRef, RefObject } from "react";
import { Block, BlockOptionsProps, BlockProps } from "./Block";

interface BlockRegistrationProviderProps {
    blockTypes: RefObject<Record<string, React.FunctionComponent>>;
    textBasedBlocks: Array<string>;
    dfaultBlockType: string,
}

const BlockRegistrationContext = createContext<BlockRegistrationProviderProps | {}>({});

export function useBlockRegistrationContext() : BlockRegistrationProviderProps | {} {
    const context = useContext(BlockRegistrationContext);
    if (context === null) {
        throw new Error("useBlockRegistrationContext must be used within a BlockRegistrationProvider");
    }
    return context;
}

export function BlockRegistration(props: any) {
    const {
        customBlocks,
        /** @deprecate */
        defaultBlockType,
        children
    } = props;

    const blocksMapRef = useRef({});
    const textBasedBlocksRef = useRef([]);
    /** @deprecate */
    const defaultBlockTypeRef = useRef(defaultBlockType);

    const register = React.useCallback(({ type, component, options } : { type: string; component: Function; options?: BlockOptionsProps }) => {
        blocksMapRef.current[type] = {
            component,
            options
        };
        if (options?.isTextBased) {
            textBasedBlocksRef.current = [...textBasedBlocksRef.current, type];
        }
    }, []);

    const unregister = ({ type }) => {
        delete blocksMapRef.current[type];
    }

    React.Children.forEach(customBlocks, (child: BlockProps) => {
        if (React.isValidElement(child)) {
            // Here it should be compared against a BlockConstructor component or sth like that
            if (child.type === Block) {
                // Register block type
                register(child.props);

            } else {
                console.warn("Invalid");
            }
        }
    })

    const value = React.useMemo(() => ({
        blockTypes: blocksMapRef.current,
        textBasedBlocks: textBasedBlocksRef.current,
        defaultBlockType: defaultBlockTypeRef.current
    }), []);

    return (
        <BlockRegistrationContext.Provider value={value}>
            {children}
        </BlockRegistrationContext.Provider>
    );
}