import { open, save } from '@tauri-apps/plugin-dialog';
import * as action from './actions';
import * as component from './components';
import { FILEPATH_KEY } from './constants';
import * as fs from './fs';
import { state } from './state';
import { BulletNode, RootNode, SilverNode } from './tree';

declare global {
    interface HTMLElement {
        insertAfter(newNode: HTMLElement, referenceNode: HTMLElement): void;
    }
}

HTMLElement.prototype.insertAfter = function(newNode: HTMLElement, referenceNode: HTMLElement): void {
    if (referenceNode.parentNode !== this) {
      throw new Error("Reference node is not a child of this element");
    }
    this.insertBefore(newNode, referenceNode.nextSibling);
};

const app = document.querySelector("#app") as HTMLDivElement;

export function render(view: HTMLDivElement) {
    app.innerHTML = "";
    app.appendChild(view);
}

export function openSave(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "open-save";

    const selectFileBtn = document.createElement("button");
    selectFileBtn.className = "select-create-file-btn";
    selectFileBtn.textContent = "Выбрать файл";
    selectFileBtn.addEventListener("click", async () => {
        const filePath = await open({
            multiple: false,
            directory: false,
        });
        if (filePath) {
            localStorage.setItem(FILEPATH_KEY, filePath);
            await fs.read(filePath);
            render(page(state.mainRoot));
        }
    });

    const createFileBtn = document.createElement("button");
    createFileBtn.className = "select-create-file-btn";
    createFileBtn.textContent = "Создать новый";
    createFileBtn.addEventListener("click", () => {
        action.setDefaultTree();
        render(page(state.mainRoot));
        localStorage.removeItem(FILEPATH_KEY);
    });

    container.appendChild(selectFileBtn);
    container.appendChild(createFileBtn);
    return container;
}

export function page(root: SilverNode): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(header());
    container.appendChild(nodePath(root));
    container.appendChild(tree(root));
    return container;
}

function header(): HTMLDivElement {
    const header = document.createElement("div");
    header.className = "app-header";

    const createBtn = document.createElement("button");
    createBtn.textContent = "Новый";
    createBtn.addEventListener("click", () => {
        action.setDefaultTree();
        render(page(state.mainRoot));
        localStorage.removeItem(FILEPATH_KEY);
    });
    header.appendChild(createBtn);

    const openBtn = document.createElement("button");
    openBtn.textContent = "Открыть";
    openBtn.addEventListener("click", async () => {
        const filePath = await open({
            multiple: false,
            directory: false,
        });
        if (filePath) {
            localStorage.setItem(FILEPATH_KEY, filePath);
            await fs.read(filePath);
            render(page(state.mainRoot));
        }
    });
    header.appendChild(openBtn);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Сохранить";
    saveBtn.addEventListener("click", async () => {
        const filePath = localStorage.getItem(FILEPATH_KEY);
        if (filePath) {
            fs.write(filePath);
        } else {
            const newFilePath = await save({
                filters: [{ name: 'Silver Filter', extensions: ['silver']}],
            });
            if (newFilePath) {
                localStorage.setItem(FILEPATH_KEY, newFilePath);
                fs.write(newFilePath);
            }
        }
    });
    header.appendChild(saveBtn);

    const saveAsBtn = document.createElement("button");
    saveAsBtn.textContent = "Сохранить как";
    saveAsBtn.addEventListener("click", async () => {
        const filePath = await save({
            filters: [{ name: 'Silver Filter', extensions: ['silver']}],
        });
        if (filePath) {
            localStorage.setItem(FILEPATH_KEY, filePath);
            fs.write(filePath);
        }
    });
    header.appendChild(saveAsBtn);

    return header;
}

function nodePath(node: SilverNode): HTMLDivElement {
    const path = document.createElement("div");
    path.className = "node-path";

    const homeIcon = component.homeIcon();
    homeIcon.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        render(page(state.mainRoot));
    });
    path.appendChild(homeIcon);

    const pathNodes: BulletNode[] = [];
    let cur = node;
    while (!(cur instanceof RootNode)) {
        pathNodes.push(cur as BulletNode);
        cur = (cur as BulletNode).parent;
    }
    pathNodes.reverse();
    pathNodes.forEach((n: BulletNode) => {
        path.appendChild(component.separator());
        path.appendChild(nodePathItem(n));
    });

    return path;
}

function nodePathItem(node: BulletNode): HTMLElement {
    const item = document.createElement("span");
    item.className = "node-path-item";
    const cleanContent = node.content.replace(/\0/g, '').trim();
    item.textContent = cleanContent.length <= 20 ? cleanContent : (cleanContent.substring(0, 17) + "...");
    item.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        render(page(node));
    });
    return item;
}

function tree(root: SilverNode): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "silver-tree";
    container.id = "silver-tree";
    if (root !== state.mainRoot) {
        container.appendChild(treeHeading(root as BulletNode));
    }
    if (root.children && root.children.length > 0) {
        for (const child of root.children) {
            container.appendChild(treeNode(root, child));
        }
    }
    return container;
}

function treeHeading(node: BulletNode): HTMLDivElement {
    const container = document.createElement("div");
    const h = document.createElement("h3");
    h.textContent = node.content;
    container.appendChild(h);
    return container;
}

function treeNode(rootNode: SilverNode, node: BulletNode): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "node";
    container.id = node.id;

    const header = document.createElement("div");
    header.className = "node-header";

    const collapsedAction = component.toggleIcon();
    collapsedAction.style.visibility = "hidden";
    collapsedAction.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        container.classList.toggle("collapsed");
        container.classList.toggle("expanded");
        if (!node.meta) node.meta = new Map<string, any>;
        node.meta.set("collapsed", container.classList.contains("collapsed"));
    });
    header.appendChild(collapsedAction);

    const menuAction = component.circleIcon();
    header.appendChild(menuAction);

    const zoomAction = component.squareIcon();
    zoomAction.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        render(page(node));
    });
    header.appendChild(zoomAction);

    const nodeContent = document.createElement("div");
    nodeContent.className = "node-content";
    nodeContent.style.whiteSpace = 'pre-wrap';
    nodeContent.textContent = node.content;
    nodeContent.contentEditable = "true";
    nodeContent.addEventListener("blur", async () => {
        saveNodeContent(nodeContent, node);
        nodeContent.textContent = nodeContent.textContent || "";
    });
    nodeContent.addEventListener("keydown", (e: KeyboardEvent) => {
        switch (e.code) {
            case 'Enter': {
                if (!e.shiftKey && !e.ctrlKey) {
                    e.preventDefault();

                    const cursorPosition = window.getSelection()?.getRangeAt(0)?.startOffset || 0;
                    const currentText = nodeContent.textContent || "";
                    const textBeforeCursor = currentText.substring(0, cursorPosition);
                    const textAfterCursor = currentText.substring(cursorPosition);

                    nodeContent.textContent = node.content = textBeforeCursor;

                    let newDiv;
                    if (!node.children || node.children?.length == 0) {
                        const newContentNode = action.addNodeAfter(textAfterCursor, node);
                        newDiv = treeNode(rootNode, newContentNode);
                        if (node.parent === rootNode) {
                            document.getElementById("silver-tree")!!.insertAfter(newDiv, container);
                        } else {
                            (document.getElementById((node.parent as BulletNode).id)!!.lastElementChild as HTMLElement).insertAfter(newDiv, container);
                        }
                    } else {
                        const newContentNode = action.addFirstChildNode(textAfterCursor, node);
                        newDiv = treeNode(rootNode, newContentNode);
                        const childrenContainer = document.getElementById(node.id)?.lastElementChild!!;
                        childrenContainer.insertBefore(newDiv, childrenContainer.firstChild);
                    }
                    (newDiv.querySelector('.node-content') as HTMLDivElement).focus();
                }
                break;
            }
        }
    });
    header.appendChild(nodeContent);

    if (node.meta.get("collapsed")) {
        container.classList.add("collapsed");
    } else {
        container.classList.add("expanded");
    }

    container.appendChild(header);

    if (node.children && node.children.length > 0) {
        collapsedAction.style.visibility = "visible";
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "node-children";

        for (const bullet of node.children) {
            childrenContainer.appendChild(treeNode(rootNode, bullet));
        }
        container.appendChild(childrenContainer);
    }

    return container;
}

function saveNodeContent(nodeDiv: HTMLDivElement, node: BulletNode): void {
    const newContent = nodeDiv.textContent || "";
    if (newContent !== node.content) {
        node.content = newContent;
    }
}
