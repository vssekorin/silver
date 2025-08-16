import { readTextFileLines, writeTextFile } from '@tauri-apps/plugin-fs';
import { DEFAULT_TREE  } from './constants';
import { tree } from "./main"
import { BulletNode, SilverNode } from "./tree";

// level | id | type | meta | content
export async function parseSilverFile(filepath: string) {
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
        const meta = parts[3].length > 0 ? new Map<string, any>(Object.entries(JSON.parse(parts[3]))) : new Map<string, any>();
        const content = parts.slice(4).join('|');

        let parent = lastNode[level - 1];
        const node = tree.addNode(id, type, meta, content, parent ?? tree.root);
        lastNode[level] = node;
    }
    if (tree.nodes.size == 0) {
        DEFAULT_TREE(tree);
    }
}

function serializeTree(): string[] {
    const lines: string[] = [];

    function serializeNode(node: SilverNode, level: number = -1): void {
        if (node instanceof BulletNode) {
            const metaStr = JSON.stringify(Object.fromEntries(node.meta));
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

export async function saveToFile(filepath: string): Promise<void> {
    const lines = serializeTree();
    const content = lines.join('\n');
    writeTextFile(filepath, content);
}
