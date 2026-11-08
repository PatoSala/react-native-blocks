import * as Crypto from 'expo-crypto';

type UUIDv4 = string;

class Block {
  id?: string;
  type: string;
  properties: {
    title: string;
  };
  format?: {

  };
  content?: string[] | [];
  parent: string;

  constructor({
    type,
    properties,
    content = [],
    parent,
  }: Block) {
    this.id = Crypto.randomUUID();;
    this.type = type;
    this.properties = properties;
    this.content = content;
    this.parent = parent;
  }
}

const createBlock = (block: Block) => {
  return new Block(block);
}

export { createBlock };

export { Block, UUIDv4 };

// Blocks already handle structure, maybe the storage should only be responsible for storing all blocks