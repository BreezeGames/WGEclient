'use strict';


function Render(canvas, width, height) {
    if (!canvas) {
        throw new Error("[Render constructor]: wrong _canvas element");
    }

    this._canvas = canvas;

debug("[Render constructor]: initializing webGL context");
    this._ctx = null;
    try {
        this._ctx =
            this._canvas.getContext('webgl') ||
            this._canvas.getContext('experemental-webgl');
    } catch (e) { }

    if (!this._ctx) {
        throw new Error("[Render constructor]: webgl not supported!");
    }

    if (width) {
        this._canvas.width = width;
    }
    if (height) {
        this._canvas.height = height;
    }

    this._renderScene = null;
    this._isFullScreen = false;
}

Render.prototype.setRenderScene = function(scene) {
    if (scene) {
        this._renderScene = scene;
    }
};


Render.prototype.width = function(width) {
    if (width) {
        this._canvas.width = width;
        this.viewport(0, 0, this.width(), this.height());
    } else {
        return this._canvas.width;
    }
};

Render.prototype.height = function(height) {
    if (height) {
        this._canvas.height = height;
        this.viewport(0, 0, this.width(), this.height());
    } else {
        return this._canvas.height;
    }
};

Render.prototype.getCanvas = function() {
    return this._canvas;
};

Render.prototype.getContext = function() {
    return this._ctx;
};

Render.prototype.clearColor = function(r, g, b, a) {
    if (r) {
        this._ctx.clearColor(r, g, b, a);
    } else {
        return this._ctx.getParameter(this._ctx.COLOR_CLEAR_VALUE);
    }
};

Render.prototype.clearScreen = function(depth) {
    let clr = this._ctx.COLOR_BUFFER_BIT;
    clr |= depth ? this._ctx.DEPTH_BUFFER_BIT : 0;

    this._ctx.clear(clr);
};

Render.prototype.draw = function() {
    if (this._renderScene) {
        this._renderScene.update();
        this._renderScene.draw();
    }
};

Render.prototype.viewport = function(x, y, width, height) {
    this._ctx.viewport(x, y, width, height);
};

Render.prototype.setFullScreen = function(yes) {
    if (this._isFullScreen == yes) return;

    if (yes) {
        this.canvasW = this.width();
        this.canvasH = this.height();
        this._isFullScreen = true;
        this.viewport(0, 0, window.innerWidth, window.innerHeight);
        this.width(window.innerWidth);
        this.height(window.innerHeight);
    } else {
        this._isFullScreen = false;
        this.width(this.canvasW);
        this.height(this.canvasH);
        this.viewport(0, 0, this.width(), this.height());
    }
};