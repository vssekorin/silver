import { v7 as uuidv7 } from "uuid";
import { BulletNode, SilverNode } from "./tree";
import { tree } from "./main"

declare global {
    interface HTMLElement {
        addAfter(newNode: HTMLElement, referenceNode: HTMLElement): void;
    }
}

HTMLElement.prototype.addAfter = function(newNode: HTMLElement, referenceNode: HTMLElement): void {
    if (referenceNode.parentNode !== this) {
      throw new Error("Reference node is not a child of this element");
    }
    this.insertBefore(newNode, referenceNode.nextSibling);
};

function createToggleIcon(): HTMLElement {
    const container = document.createElement("span");
    container.className = "toggle-icon";
    container.innerHTML = `
        <svg class="icon-svg" viewBox="0 0 16 16" width="12" height="12">
            <path class="icon-path" d="M5 4L11 8L5 12Z" />
        </svg>
    `;
    return container;
}

function saveNodeContent(nodeDiv: HTMLDivElement, node: BulletNode): void {
    const newContent = nodeDiv.textContent || "";
    if (newContent !== node.content) {
        node.content = newContent;
    }
}

function getPreviousNode(node: BulletNode): BulletNode | null {
    const leftSibling = tree.getLeftSibling(node);
    if (leftSibling) {
        return tree.getDeepestLastDescendant(leftSibling);
    }
    if (node.parent instanceof BulletNode) {
        return node.parent;
    }
    return null;
}

function getNextNode(node: BulletNode): BulletNode | null {
    if (node.children && node.children.length > 0) {
        return node.children[0];
    }
    let current: BulletNode | null = node;
    while (current) {
        const rightSibling = tree.getRightSibling(current);
        if (rightSibling) {
            return rightSibling;
        }
        if (current.parent instanceof BulletNode) {
            current = current.parent;
        } else {
            break;
        }
    }
    return null;
}

export function renderNode(node: BulletNode): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "node";
    container.id = node.id;
    const header = document.createElement("div");
    header.className = "node-header";

    const nodeContent = document.createElement("div");
    nodeContent.className = "node-content";
    nodeContent.textContent = node.content;
    nodeContent.contentEditable = "true";
    nodeContent.addEventListener("blur", async () => {
        saveNodeContent(nodeContent, node);
    });
    nodeContent.addEventListener("keydown", (e: KeyboardEvent) => {
        // используется code вместо key из-за Tab и Shift+Tab
        switch (e.code) {
            case 'Enter': {
                if (!e.shiftKey) {
                    e.preventDefault();
                    
                    const cursorPosition = window.getSelection()?.getRangeAt(0)?.startOffset || 0;
                    const currentText = nodeContent.textContent || "";
                    const textBeforeCursor = currentText.substring(0, cursorPosition);
                    const textAfterCursor = currentText.substring(cursorPosition);
                    
                    nodeContent.textContent = textBeforeCursor;
                    node.content = textBeforeCursor;
                    
                    let newDiv;
                    if (!node.children || node.children.length == 0) {
                        const newBullet = tree.addNodeAfter(uuidv7(), "text", null, textAfterCursor, node.parent, node);
                        newDiv = renderNode(newBullet);
                        if (node.parent instanceof BulletNode) {
                            (document.getElementById(node.parent.id)!!.lastElementChild as HTMLElement).addAfter(newDiv, container);
                        } else {
                            document.getElementById("silver-tree")!!.addAfter(newDiv, container);
                        }
                    } else {
                        const newBullet = tree.addNodeFirst(uuidv7(), "text", null, textAfterCursor, node);
                        newDiv = renderNode(newBullet);
                        const childrenContainer = document.getElementById(node.id)?.lastElementChild!!;
                        childrenContainer.insertBefore(newDiv, childrenContainer.firstChild);
                    }
                    
                    const newContentDiv = newDiv.querySelector('.node-content') as HTMLDivElement;
                    if (newContentDiv) {
                        newContentDiv.focus();
                    }
                }
                break;
            }
            case 'Tab': {
                e.preventDefault();
                saveNodeContent(nodeContent, node);
                if (e.shiftKey) {
                    // TODO оптимизировать else
                    if (node.parent instanceof BulletNode && node.parent.parent instanceof BulletNode) {
                        const grandParent = node.parent.parent;
                        const grandParentId = grandParent.id;
                        tree.unindentBullet(node);
                        const newGrandParendDiv = renderNode(grandParent);
                        document.getElementById(grandParentId)?.replaceWith(newGrandParendDiv);
                    } else {
                        tree.unindentBullet(node);
                        const newTreeDiv = renderTree(tree.root);
                        document.getElementById("silver-tree")!!.replaceWith(newTreeDiv);
                    }
                } else {
                    // TODO оптимизировать else
                    if (node.parent instanceof BulletNode && node.parent.parent instanceof BulletNode) {
                        const grandParent = node.parent.parent;
                        const grandParentId = grandParent.id;
                        tree.indentBullet(node);
                        const newGrandParendDiv = renderNode(grandParent);
                        document.getElementById(grandParentId)?.replaceWith(newGrandParendDiv);
                    } else {
                        tree.indentBullet(node);
                        const newTreeDiv = renderTree(tree.root);
                        document.getElementById("silver-tree")!!.replaceWith(newTreeDiv);
                    }
                }
                (document.getElementById(node.id)?.querySelector('.node-content') as HTMLDivElement).focus();
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const upNode = getPreviousNode(node);
                if (upNode) {
                    (document.getElementById(upNode.id)?.querySelector('.node-content') as HTMLDivElement).focus();
                }
                break;
            }
            case 'ArrowDown': {
                e.preventDefault();
                const downNode = getNextNode(node);
                if (downNode) {
                    (document.getElementById(downNode.id)?.querySelector('.node-content') as HTMLDivElement).focus();
                }
                break;
            }
        }
    });
    header.appendChild(nodeContent);

    if (node.children && node.children.length > 0) {
        const toggleIcon = createToggleIcon();
        header.insertBefore(toggleIcon, nodeContent);
    }

    container.appendChild(header);

    if (node.children && node.children.length > 0) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "node-children";

        for (const bullet of node.children) {
            childrenContainer.appendChild(renderNode(bullet));
        }
        container.appendChild(childrenContainer);
    }

    return container;
}

export function renderTree(root: SilverNode): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "silver-tree";
    container.id = "silver-tree";
    if (root.children && root.children.length > 0) {
        for (const child of root.children) {
            container.appendChild(renderNode(child));
        }
    }
    return container;
}
