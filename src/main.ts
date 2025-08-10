import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFileLines, writeTextFile } from '@tauri-apps/plugin-fs';
import { BulletNode, SilverNode, SilverTree } from "./tree";
import { renderTree } from "./render"

export const tree = new SilverTree();

const openSaveFileBlock = document.querySelector("#open-save-file-block") as HTMLDivElement;

function showApp() {
    const treeElement = renderTree(tree);
    const app = document.querySelector("#app") as HTMLDivElement;

    const header = document.createElement("div");
    header.className = "app-header";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Сохранить"
    saveButton.addEventListener("click", async () => {
        const filepath = localStorage.getItem("filepath");
        if (filepath) {
            saveToFile(filepath);
        } else {
            const path = await save({
                filters: [{ name: 'Silver Filter', extensions: ['silver']}],
            });
            if (path) {
                localStorage.setItem("filepath", path);
                saveToFile(path);
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
            localStorage.setItem("filepath", path);
            saveToFile(path);
        }
    });
    header.appendChild(saveAsButton);

    app.appendChild(header);
    app.appendChild(treeElement);
    app.style.display = "block";
}

// level | id | type | meta | content
async function parseSilverFile(filepath: string) {
    const lastNode: SilverNode[] = [tree.root];
    const lines = await readTextFileLines(filepath);
    for await (const line of lines) {
        const parts = line.split('|');
        if (parts.length < 5) {
            throw new Error(`Invalid line format: ${line}`);
        }
        const level = parseInt(parts[0], 10);
        if (isNaN(level) || level < 0) {
            throw new Error(`Invalid level in line: ${line}`);
        }
        const id = parts[1];
        const type = parts[2];
        const meta = parts[3].length > 0 ? JSON.parse(parts[3]) : null;
        const content = parts.slice(4).join('|');

        let parent = lastNode[level - 1];
        const node = tree.addNode(id, type, meta, content, parent ?? tree.root);
        lastNode[level] = node;
    }
}

function serializeTree(): string[] {
    const lines: string[] = [];

    function serializeNode(node: SilverNode, level: number = -1): void {
        if (node instanceof BulletNode) {
            const metaStr = node.meta ? JSON.stringify(node.meta) : '';
            const line = `${level}|${node.id}|${node.type}|${metaStr}|${node.content}`;
            lines.push(line);
        }
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                serializeNode(child, level + 1);
            }
        }
    }

    serializeNode(tree.root);
    return lines;
}

async function saveToFile(filepath: string): Promise<void> {
    const lines = serializeTree();
    const content = lines.join('\n');
    writeTextFile(filepath, content);
}

function showOpenSaveBlock() {
    const selectFileBtn = openSaveFileBlock.querySelector("#select-file-btn") as HTMLButtonElement;
    const createFileBtn = openSaveFileBlock.querySelector("#create-file-btn") as HTMLButtonElement;

    selectFileBtn.addEventListener("click", async () => {
        const filePath = await open({
            multiple: false,
            directory: false,
        });
        if (filePath) {
            localStorage.setItem("filepath", filePath);
            await parseSilverFile(filePath);
            showApp();
            openSaveFileBlock.style.display = "none";
        }
    });
    createFileBtn.addEventListener("click", async () => {
        tree.addNode("hello-0", "text", null, "Hello!", tree.root);
        showApp();
        localStorage.removeItem("filepath");
        openSaveFileBlock.style.display = "none";
    });

    openSaveFileBlock.style.display = "block";
}

window.addEventListener("DOMContentLoaded", () => {
    showOpenSaveBlock();
    // const filepath = localStorage.getItem("filepath");
    // if (!filepath) {
    //     showOpenSaveBlock();
    // } else {
    //     parseSilverFile(filepath);
    //     showApp();
    // }
});
