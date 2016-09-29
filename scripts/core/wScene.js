"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Renderer scene interface */
/* version: 0.1 */

class Scene {
    constructor() {
        this.onReady = () => {};
    }

    init() {
        this.loadResources().then(() => {
            this.createResources();
            this.onReady();
        });
    }

    // Sync
    createResources() {
        throw new Error("createResources method not implemented");
    }

    // Async
    loadResources() { //!!MUST RETURN PROMISE
        throw new Error("loadResources method not implemented");
    }

    draw() {
        throw new Error("render method not implemented");
    }

    update() {
        throw new Error("update method not implemented");
    }
}