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
    meta: Map<string, any>;
    content: string;
    parent: SilverNode;

    constructor(nodeContent: NodeValue, parent: SilverNode) {
        super();
        this.id = nodeContent.id;
        this.type = nodeContent.type;
        this.meta = nodeContent.meta;
        this.content = nodeContent.content;
        this.parent = parent;
    }
}

export interface NodeValue {
    id: string,
    type: string,
    meta: Map<string, any>,
    content: string,
}
