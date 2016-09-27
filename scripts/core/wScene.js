"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Renderer scene interface */
/* version: 0.1 */

class Scene {
    constructor() {

    }

    init() {
        throw new Error("Init method not implemented");
    }

    draw() {
        throw new Error("Draw method not implemented");
    }

    update() {
        throw new Error("Update method not implemented");
    }
}