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

export function indentNode(node: ContentNode): boolean {
    // Find the previous sibling
    const parent = node.parent;
    if (!parent.children) return false;
    
    const currentIndex = parent.children.indexOf(node);
    if (currentIndex <= 0) return false; // No previous sibling
    
    const previousSibling = parent.children[currentIndex - 1];
    
    // Remove node from current parent
    parent.children.splice(currentIndex, 1);
    
    // Add node as child of previous sibling
    previousSibling.addChild(node);
    node.parent = previousSibling;
    
    return true;
}

export function outdentNode(node: ContentNode, rootNode: SilverNode): boolean {
    // Can only outdent if we have a parent that's not the root
    if (node.parent == rootNode) return false;
    
    const parent = node.parent as ContentNode;
    const grandparent = parent.parent;
    
    // Find the position of the parent in the grandparent's children
    if (!grandparent.children) return false;
    const parentIndex = grandparent.children.indexOf(parent);
    if (parentIndex === -1) return false;
    
    // Remove node from current parent
    if (parent.children) {
        const nodeIndex = parent.children.indexOf(node);
        if (nodeIndex !== -1) {
            parent.children.splice(nodeIndex, 1);
        }
    }
    
    // Add node as sibling of parent (after parent)
    grandparent.addChildAfter(node, parent);
    node.parent = grandparent;
    
    return true;
}

export function toggleComplete(node: ContentNode) {
    if (node.type == "text") {
        node.type = "done";
    } else if (node.type == "done") {
        node.type = "text";
    }
}
