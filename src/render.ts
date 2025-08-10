import {v4 as uuidv4 } from "uuid";
import { BulletNode, SilverTree } from "./tree";
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
        const newContent = nodeContent.textContent || "";
        if (newContent !== node.content) {
            node.content = newContent;
        }
    });
    nodeContent.addEventListener("keydown", (e: KeyboardEvent) => {
        switch (e.key) {
            case 'Enter': {
                e.preventDefault();

                const cursorPosition = window.getSelection()?.getRangeAt(0)?.startOffset || 0;
                const currentText = nodeContent.textContent || "";
                const textBeforeCursor = currentText.substring(0, cursorPosition);
                const textAfterCursor = currentText.substring(cursorPosition);

                nodeContent.textContent = textBeforeCursor;
                node.content = textBeforeCursor;

                let newDiv;
                if (!node.children || node.children.length == 0) {
                    const newBullet = tree.addNodeAfter(uuidv4(), "text", null, textAfterCursor, node.parent, node);
                    newDiv = renderNode(newBullet);
                    if (node.parent instanceof BulletNode) {
                        (document.getElementById(node.parent.id)!!.lastElementChild as HTMLElement).addAfter(newDiv, container);
                    } else {
                        (document.querySelector(".silver-tree") as HTMLDivElement).addAfter(newDiv, container);
                    }
                } else {
                    const newBullet = tree.addNodeFirst(uuidv4(), "text", null, textAfterCursor, node);
                    newDiv = renderNode(newBullet);
                    const childrenContainer = document.getElementById(node.id)?.lastElementChild!!;
                    childrenContainer.insertBefore(newDiv, childrenContainer.firstChild);
                }

                const newContentDiv = newDiv.querySelector('.node-content') as HTMLDivElement;
                if (newContentDiv) {
                    newContentDiv.focus();
                }
                break;
            }
            case 'Tab': {
                e.preventDefault();

                 if (e.shiftKey) {
                     // TODO Shift+Tab Unindent
                 } else {
                    // TODO оптимизировать
                    if (node.parent instanceof BulletNode && node.parent.parent instanceof BulletNode) {
                        const grandParent = node.parent.parent;
                        const grandParentId = grandParent.id;
                        tree.indentBullet(node);
                        const newGrandParendDiv = renderNode(grandParent);
                        document.getElementById(grandParentId)?.replaceWith(newGrandParendDiv);
                    } else {
                        tree.indentBullet(node);
                        const newTreeDiv = renderTree(tree);
                        (document.getElementsByClassName("silver-tree")[0] as HTMLElement).replaceWith(newTreeDiv);
                    }
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

export function renderTree(tree: SilverTree): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "silver-tree";
    if (tree.root.children && tree.root.children.length > 0) {
        for (const child of tree.root.children) {
            container.appendChild(renderNode(child));
        }
    }
    return container;
}
