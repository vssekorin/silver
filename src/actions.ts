import { state } from "./state";
import { ContentNode, NodeValue, RootNode, SilverNode } from "./tree";
import { v7 as uuidv7 } from "uuid";

export function clearTree() {
    state.nodes = new Map();
    state.mainRoot = new RootNode();
}

export function setDefaultTree() {
    clearTree();
    addNode({id: uuidv7(), type: "text", meta: new Map<string, any>(), content: "Hello!"}, state.mainRoot);
}

export function addNode(value: NodeValue, parent: SilverNode): ContentNode {
    const node = new ContentNode(value, parent);
    parent.addChild(node);
    state.nodes.set(value.id, node);
    return node;
}

export function addNodeAfter(content: string, refNode: ContentNode): ContentNode {
    const node = new ContentNode({id: uuidv7(), type: "text", meta: new Map<string, any>(), content: content}, refNode.parent);
    refNode.parent.addChildAfter(node, refNode);
    state.nodes.set(node.id, node);
    return node;
}

export function addFirstChildNode(content: string, parent: ContentNode): ContentNode {
    const node = new ContentNode({id: uuidv7(), type: "text", meta: new Map<string, any>(), content: content}, parent);
    parent.addChildFirst(node);
    state.nodes.set(node.id, node);
    return node;
}
