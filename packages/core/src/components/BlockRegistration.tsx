import React, { useContext, createContext, useRef, RefObject } from "react";
import { Block, BlockOptionsProps, BlockProps } from "./Block";

interface BlockRegistrationProviderProps {
    /** Key value pair of block types and their corresponding component. */
    blockTypes: RefObject<Record<string, React.FunctionComponent>>;

    /** Array of block types that are text-based. */
    // To do: deprecate
    textBasedBlocks: Array<string>;
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
        children
    } = props;

    const blocksMapRef = useRef({});
    // Deprecate
    const textBasedBlocksRef = useRef([]);

    const register = React.useCallback(({ type, component, options } : { type: string; component: Function; options?: BlockOptionsProps }) => {
        blocksMapRef.current[type] = {
            component,
            options
        };
        // To do: deprecate
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
        textBasedBlocks: textBasedBlocksRef.current
    }), []);

    return (
        <BlockRegistrationContext.Provider value={value}>
            {children}
        </BlockRegistrationContext.Provider>
    );
}