interface BlockOptionsProps {
    [key: string]: any;
}

interface BlockProps {
    type: string;
    component: any;
    options?: BlockOptionsProps
}

/**
 * Its only purpose is to register blocks inside the Editor component. It does not render anything.
 */
const Block = (props: BlockProps) => {
    const {
        type,
        component,
        options
    } = props;
    
    return null;
} 

export {
    Block,
    BlockProps,
    BlockOptionsProps
}