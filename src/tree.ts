export abstract class SilverNode {
    children?: BulletNode[];

    constructor() {
    }

    public addChild(child: BulletNode) {
        if (!this.children) {
            this.children = [child];
        } else {
            this.children.push(child);
        }
    }

    public addChildAtPosition(child: BulletNode, position: number) {
        if (!this.children) {
            this.children = [child];
        } else {
            this.children.splice(position, 0, child);
        }
    }

    public addChildAfter(child: BulletNode, referenceNode: BulletNode) {
        const index = this.children?.indexOf(referenceNode) ?? -1;
        if (index !== -1) {
            this.addChildAtPosition(child, index + 1);
        } else {
            this.addChild(child);
        }
    }

    public addChildFirst(child: BulletNode) {
        if (!this.children) {
            this.children = [child];
        } else {
            this.children.unshift(child);
        }
    }
}

export class RootNode extends SilverNode {}

export class BulletNode extends SilverNode {
    id: string;
    type: string;
    meta: any;
    content: string;
    parent: SilverNode;

    constructor(id: string, type: string, meta: any, content: string, parent: SilverNode) {
        super();
        this.id = id;
        this.type = type;
        this.meta = meta;
        this.content = content;
        this.parent = parent;
    }
}

export class SilverTree {
    root: RootNode;
    nodes: Map<string, BulletNode>;

    constructor() {
        this.root = new RootNode();
        this.nodes = new Map();
    }

    public addNode(id: string, type: string, meta: any, content: string, parent: SilverNode): BulletNode {
        let node = new BulletNode(id, type, meta, content, parent);
        parent.addChild(node);
        this.nodes.set(id, node);
        return node;
    }

    public addNodeFirst(id: string, type: string, meta: any, content: string, parent: SilverNode): BulletNode {
        let node = new BulletNode(id, type, meta, content, parent);
        parent.addChildFirst(node);
        this.nodes.set(id, node);
        return node;
    }

    public addNodeAfter(id: string, type: string, meta: any, content: string, parent: SilverNode, reference: BulletNode): BulletNode {
        let node = new BulletNode(id, type, meta, content, parent);
        parent.addChildAfter(node, reference);
        this.nodes.set(id, node);
        return node;
    }

    public indentBullet(node: BulletNode): void {
        const nodeIndex = node.parent.children?.indexOf(node) ?? -1;
        if (nodeIndex >= 1) {
            node.parent.children?.splice(nodeIndex, 1);
            const newParent = node.parent.children!![nodeIndex - 1];
            newParent.addChild(node);
            node.parent = newParent;
        }
    }

    public unindentBullet(node: BulletNode): void {
        if (node.parent instanceof BulletNode) {
            const oldParent = node.parent;
            const newParent = node.parent.parent;
            const nodeIndex = oldParent.children?.indexOf(node);
            oldParent.children?.splice(nodeIndex!!, 1);
            node.parent = newParent;
            newParent.addChildAfter(node, oldParent);
        }
    }

    public getLeftSibling(node: BulletNode): BulletNode | null {
        const siblings = node.parent.children ?? [];
        const index = siblings.indexOf(node);
        if (index > 0) {
            return siblings[index - 1];
        }
        return null;
    }

    public getRightSibling(node: BulletNode): BulletNode | null {
        const siblings = node.parent.children ?? [];
        const index = siblings.indexOf(node);
        if (index !== -1 && index < siblings.length - 1) {
            return siblings[index + 1];
        }
        return null;
    }

    public getDeepestLastDescendant(node: BulletNode): BulletNode {
        let current: BulletNode = node;
        while (current.children && current.children.length > 0) {
            current = current.children[current.children.length - 1];
        }
        return current;
    }

    public clear(): void {
        this.root = new RootNode();
        this.nodes = new Map();
    }
}
