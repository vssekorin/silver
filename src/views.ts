import { open, save } from '@tauri-apps/plugin-dialog';
import { FILEPATH_KEY, DEFAULT_TREE } from './constants';
import * as fs from "./fs";
import { tree } from "./main"
import { renderTree } from "./render"

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

function showApp() {
    const treeElement = renderTree(tree.root);
    const app = document.querySelector("#app") as HTMLDivElement;
    app.innerHTML = "";

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

    app.appendChild(header);
    app.appendChild(treeElement);
    app.style.display = "block";
}
