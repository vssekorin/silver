import { state } from "./state";
import { BulletNode, NodeValue, RootNode, SilverNode } from "./tree";

export function clearTree() {
    state.nodes = new Map();
    state.mainRoot = new RootNode();
}

export function setDefaultTree() {
    clearTree();
    addNode({id: "hello-0", type: "text", meta: new Map<string, any>(), content: "Hello!"}, state.mainRoot);
}

export function addNode(value: NodeValue, parent: SilverNode): BulletNode {
    let node = new BulletNode(value, parent);
    parent.addChild(node);
    state.nodes.set(value.id, node);
    return node;
}
