import { createContext, useContext, useRef, RefObject, useState, useEffect, memo, useMemo } from "react";
import { View } from "react-native";

interface BlockMeasuresContext {
    blockMeasuresRef: RefObject<Record<string, { height: number, start: number, end: number }>>;
    registerBlockMeasure: (blockId: string, measures: { height: number, start: number, end: number, ref: RefObject<View> }) => void;
    removeBlockMeasure: (blockId: string) => void;
}

const BlocksMeasuresContext = createContext<BlockMeasuresContext | null>(null);

export function useBlocksMeasuresContext() {
    const context = useContext(BlocksMeasuresContext);
    if (context === null) {
        throw new Error("useBlocksMeasuresContext must be used within a BlocksMeasuresProvider");
    }
    return context;
}

/**
 * Provider for block measures.
 */
export function BlocksMeasuresProvider({ children }) {
    const blockMeasuresRef = useRef({});
    /* const indicatorPosition = useSharedValue({ y: 0 }); */

    const registerBlockMeasure = (blockId: string, measures: { height: number, width: number, start: number, end: number }) => {
        blockMeasuresRef.current[blockId] = measures;
    }

    const removeBlockMeasure = (blockId: string) => {
        delete blockMeasuresRef.current[blockId];
    }

    const values = {
        blockMeasuresRef,
        registerBlockMeasure,
        removeBlockMeasure,
    };
    
    return (
        <BlocksMeasuresContext.Provider value={values}>
            {children}
        </BlocksMeasuresContext.Provider>
    );
}