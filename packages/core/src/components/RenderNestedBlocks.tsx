import React from "react";
import { View } from "react-native";
import { LayoutProvider } from "./LayoutProvider";
import { useBlockRegistrationContext } from "./BlockRegistration";


import { useValue } from "@legendapp/state/react";
import { blocks$ } from "../context/blocks$";

function RenderNestedBlocks(props: { blockId: string }) : React.JSX.Element {
  const { blockTypes } = useBlockRegistrationContext();

  const rootContent = useValue(blocks$.blocks[props.blockId].content);

  console.log("rootContent", rootContent);

  return (
    <>
      {/* Render blocksOrder which is the content of the root block. */}
      {rootContent?.map((blockId: string, index: number) => {
        const Component = blockTypes[blocks$.blocks[blockId].type.peek()].component;
        return (
          <LayoutProvider blockId={blockId} key={`block-${blockId}`}>
            <View style={{ backgroundColor: "transparent" }}>
              <Component blockId={blockId} />
            </View>
          </LayoutProvider>
        );
      })}
    </>
  )
}

export { RenderNestedBlocks };