import { observable } from "@legendapp/state";

export const inputs$ = observable({
  refs: {},
  register: (id: string, ref: any) => {
    inputs$.refs[id].set(ref);
  },
  unregister: (id: string) => {
    inputs$.inputs[blockId].delete();
  },
  focus: (id: string) => {
    inputs$.refs[id].current?.focus();
  }
});