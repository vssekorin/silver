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
        this.parent.addChild(this);
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
        this.nodes.set(id, node);
        return node;
    }
}
