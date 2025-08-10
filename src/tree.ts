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

    public addNodeAfter(id: string, type: string, meta: any, content: string, parent: SilverNode, reference: BulletNode): BulletNode {
        let node = new BulletNode(id, type, meta, content, parent);
        parent.addChildAfter(node, reference);
        this.nodes.set(id, node);
        return node;
    }
}
