import { open, save } from '@tauri-apps/plugin-dialog';
import { FILEPATH_KEY, DEFAULT_TREE } from './constants';
import * as fs from "./fs";
import { tree } from "./main"
import { renderNode, renderTree } from "./render"
import { v7 as uuidv7 } from "uuid";

export function showOpenSaveBlock() {
    const openSaveFileBlock = document.querySelector("#open-save-file-block") as HTMLDivElement;
    const selectFileBtn = openSaveFileBlock.querySelector("#select-file-btn") as HTMLButtonElement;
    const createFileBtn = openSaveFileBlock.querySelector("#create-file-btn") as HTMLButtonElement;

    selectFileBtn.addEventListener("click", async () => {
        const filePath = await open({
            multiple: false,
            directory: false,
        });
        if (filePath) {
            localStorage.setItem(FILEPATH_KEY, filePath);
            await fs.parseSilverFile(filePath);
            showApp();
            openSaveFileBlock.style.display = "none";
        }
    });
    createFileBtn.addEventListener("click", async () => {
        DEFAULT_TREE(tree);
        showApp();
        localStorage.removeItem(FILEPATH_KEY);
        openSaveFileBlock.style.display = "none";
    });

    openSaveFileBlock.style.display = "block";
}

function createPlusIcon(): HTMLElement {
    const container = document.createElement("span");
    container.className = "plus-icon";
    container.innerHTML = `
        <svg viewBox="0 0 16 16" width="12" height="12">
            <path d="M8 3L8 13M3 8L13 8" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    `;
    container.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const node = tree.addNode(uuidv7(), "text", null, "", tree.root);
        const div = renderNode(node);
        document.getElementById("silver-tree")?.appendChild(div);
        (div.querySelector('.node-content') as HTMLDivElement).focus();
    });
    return container;
}

function createHomeIcon(): HTMLElement {
    const container = document.createElement("span");
    container.className = "home-icon";
    container.innerHTML = `
        <svg viewBox="0 0 16 16" width="12" height="12">
            <path d="M8 1L1 7V15H6V10H10V15H15V7L8 1Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    `;
    container.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        showApp();
    });
    return container;
}

function appHeader(): HTMLDivElement {
    const header = document.createElement("div");
    header.className = "app-header";

    const newButton = document.createElement("button");
    newButton.textContent = "Новый";
    newButton.addEventListener("click", () => {
        tree.clear();
        DEFAULT_TREE(tree);
        showApp();
        localStorage.removeItem(FILEPATH_KEY);
    });
    header.appendChild(newButton);

    const openButton = document.createElement("button");
    openButton.textContent = "Открыть";
    openButton.addEventListener("click", async () => {
        const filePath = await open({
            multiple: false,
            directory: false,
        });
        if (filePath) {
            tree.clear();
            localStorage.setItem(FILEPATH_KEY, filePath);
            await fs.parseSilverFile(filePath);
            showApp();
        }
    });
    header.appendChild(openButton);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Сохранить";
    saveButton.addEventListener("click", async () => {
        const filepath = localStorage.getItem(FILEPATH_KEY);
        if (filepath) {
            fs.saveToFile(filepath);
        } else {
            const path = await save({
                filters: [{ name: 'Silver Filter', extensions: ['silver']}],
            });
            if (path) {
                localStorage.setItem(FILEPATH_KEY, path);
                fs.saveToFile(path);
            }
        }
    });
    header.appendChild(saveButton);

    const saveAsButton = document.createElement("button");
    saveAsButton.textContent = "Сохранить как";
    saveAsButton.addEventListener("click", async () => {
        const path = await save({
            filters: [{ name: 'Silver Filter', extensions: ['silver']}],
        });
        if (path) {
            localStorage.setItem(FILEPATH_KEY, path);
            fs.saveToFile(path);
        }
    });
    header.appendChild(saveAsButton);
    return header;
}

function appNodePath(): HTMLDivElement {
    const path = document.createElement("div");
    path.className = "node-path";
    path.appendChild(createHomeIcon());
    return path;
}

function showApp() {
    const treeElement = renderTree(tree.root);
    const app = document.querySelector("#app") as HTMLDivElement;
    app.innerHTML = "";
    app.appendChild(appHeader());
    app.appendChild(appNodePath());
    app.appendChild(treeElement);
    app.appendChild(createPlusIcon());
    app.style.display = "block";
}
