import { open } from '@tauri-apps/plugin-dialog';
import { readTextFileLines } from '@tauri-apps/plugin-fs';
import { SilverNode, SilverTree } from "./tree";
import { renderTree } from "./render"

const tree = new SilverTree();

const openSaveFileBlock = document.querySelector("#open-save-file-block") as HTMLDivElement;

function showTree() {
    const treeElement = renderTree(tree);
    const app = document.querySelector("#app") as HTMLDivElement;
    app.appendChild(treeElement);
    app.style.display = "block";
}

// level | id | type | meta | content
async function parseSilverFile(filePath: string | null) {
    if (!filePath) return;
    const lastNode: SilverNode[] = [tree.root];
    const lines = await readTextFileLines(filePath);
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

        let parent = lastNode[level];
        const node = tree.addNode(id, type, meta, content, parent ?? tree.root);
        lastNode[level] = node;
    }
}

function showOpenSaveBlock() {
    const selectFileBtn = openSaveFileBlock.querySelector("#select-file-btn") as HTMLButtonElement;
    const createFileBtn = openSaveFileBlock.querySelector("#create-file-btn") as HTMLButtonElement;

    selectFileBtn.addEventListener("click", async () => {
        const filePath = await open({
            multiple: false,
            directory: false,
        });
        await parseSilverFile(filePath);
        showTree();
        openSaveFileBlock.style.display = "none";
    });
    createFileBtn.addEventListener("click", async () => {
        tree.addNode("hello-0", "text", null, "Hello!", tree.root);
        showTree();
        openSaveFileBlock.style.display = "none";
    });

    openSaveFileBlock.style.display = "block";
}

window.addEventListener("DOMContentLoaded", () => {
    const filepath = localStorage.getItem("filepath");
    if (!filepath && openSaveFileBlock) {
        showOpenSaveBlock();
    }
});
