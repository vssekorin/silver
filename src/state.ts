import { BulletNode, RootNode } from "./tree";

class State {
    private static instance: State;

    public nodes: Map<string, BulletNode> = new Map();
    public mainRoot: RootNode = new RootNode();

    private constructor() {}

    public static getInstance(): State {
        if (!State.instance) {
            State.instance = new State();
        }
        return State.instance;
    }
}

export const state = State.getInstance();
