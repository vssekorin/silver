import { readTextFileLines, writeTextFile } from '@tauri-apps/plugin-fs';
import * as action from './actions';
import { state } from './state';
import { BulletNode, SilverNode } from "./tree";

const nodeLineMarker = "=:sn:=> ";

export async function read(filepath: string) {
    action.clearTree();
    const lastNode: SilverNode[] = [state.mainRoot];
    const lines = await readTextFileLines(filepath);
    let accumulator = '';

    for await (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith(nodeLineMarker)) {
            if (accumulator) {
                processAccumulator(accumulator, lastNode);
                accumulator = '';
            }
            accumulator = line.slice(nodeLineMarker.length);
        } else {
            if (!accumulator) {
                throw new Error(`Content line without initial record: ${line}`);
            }
            accumulator += '\n' + line;
        }
    }
    if (accumulator) {
        processAccumulator(accumulator, lastNode);
    }

    if (state.nodes.size === 0) {
        action
    }
}

function processAccumulator(accumulator: string, lastNode: SilverNode[]) {
    const parts = accumulator.split('|', 5);
    if (parts.length < 5) {
        throw new Error(`Invalid record format: ${accumulator}`);
    }
    const level = parseInt(parts[0], 10);
    if (isNaN(level) || level < 0) {
        throw new Error(`Invalid level in record: ${accumulator}`);
    }

    const id = parts[1];
    const type = parts[2];
    const meta = parts[3].length > 0 
        ? new Map<string, any>(Object.entries(JSON.parse(parts[3]))) 
        : new Map<string, any>();
    const content = parts[4];

    const parent = lastNode[level - 1] ?? state.mainRoot;
    const node = action.addNode({id, type, meta, content}, parent);
    lastNode[level] = node;
}

export function write(filepath: string) {
    const lines = serializeTree();
    const content = lines.join('\n');
    writeTextFile(filepath, content);
}

function serializeTree(): string[] {
    const lines: string[] = [];

    function serializeNode(node: SilverNode, level: number = -1): void {
        if (node instanceof BulletNode) {
            const metaStr = JSON.stringify(Object.fromEntries(node.meta));
            const line = `${nodeLineMarker}${level}|${node.id}|${node.type}|${metaStr}|${node.content}`;
            lines.push(line);
        }
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                serializeNode(child, level + 1);
            }
        }
    }

    serializeNode(state.mainRoot);
    return lines;
}
