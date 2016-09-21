'use strict';


function Render(canvas, width, height) {
    if (!canvas) {
        throw new Error("[Render constructor]: wrong canvas element");
    }

    this.canvas = canvas;

debug("[Render constructor]: initializing webGL context");
    this.ctx = null;
    try {
        this.ctx =
            this.canvas.getContext('webgl') ||
            this.canvas.getContext('experemental-webgl');
    } catch (e) { }

    if (!this.ctx) {
        throw new Error("[Render constructor]: webgl not supported!");
    }

    if (width) {
        this.canvas.width = width;
    }
    if (height) {
        this.canvas.height = height;
    }

    this.renderFunc = null;
    this.isFullScreen = false;
}

Render.prototype.setRenderFunc = function(func) {
    if (func) {
        this.renderFunc = func;
    }
};


Render.prototype.width = function(width) {
    if (width) {
        this.canvas.width = width;
        this.viewport(0, 0, this.width(), this.height());
    } else {
        return this.canvas.width;
    }
};

Render.prototype.height = function(height) {
    if (height) {
        this.canvas.height = height;
        this.viewport(0, 0, this.width(), this.height());
    } else {
        return this.canvas.height;
    }
};

Render.prototype.getCanvas = function() {
    return this.canvas;
};

Render.prototype.getContext = function() {
    return this.ctx;
};

Render.prototype.clearColor = function(r, g, b, a) {
    if (r) {
        this.ctx.clearColor(r, g, b, a);
    } else {
        return this.ctx.getParameter(this.ctx.COLOR_CLEAR_VALUE);
    }
};

Render.prototype.clearScreen = function() {
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
};

Render.prototype.draw = function() {
    if (this.renderFunc) {
        this.renderFunc();
    }
};

Render.prototype.viewport = function(x, y, width, height) {
    this.ctx.viewport(x, y, width, height);
};

Render.prototype.setFullScreen = function(yes) {
    if (this.isFullScreen == yes) return;

    if (yes) {
        this.canvasW = this.width();
        this.canvasH = this.height();
        this.isFullScreen = true;
        this.viewport(0, 0, window.innerWidth, window.innerHeight);
        this.width(window.innerWidth);
        this.height(window.innerHeight);
    } else {
        this.isFullScreen = false;
        this.width(this.canvasW);
        this.height(this.canvasH);
        this.viewport(0, 0, this.width(), this.height());
    }
};