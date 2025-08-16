import { SilverTree } from "./tree";

export const FILEPATH_KEY = "filepath";
export const DEFAULT_TREE = (tree: SilverTree) => { tree.addNode("hello-0", "text", new Map<string, any>(), "Hello!", tree.root) }
