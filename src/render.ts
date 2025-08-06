import { BulletNode, SilverTree } from "./tree";

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
    container.id = "bullet-" + node.id;
    const header = document.createElement("div");
    header.className = "node-header";

    const nodeContent = document.createElement("div");
    nodeContent.className = "node-content";
    nodeContent.textContent = node.content;
    nodeContent.contentEditable = "true";
    nodeContent.addEventListener("blur", () => {
        const newContent = nodeContent.textContent || "";
        if (newContent !== node.content) {
            node.content = newContent;
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
