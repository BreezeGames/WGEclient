'use strict';

var RES_PATH = "res/";
var SHADERS_PATH = RES_PATH + "shaders/";

// Simple render function
function clearScreenF() {
    this.clearScreen();
}

/* Game class
	Define game class which contains renderer, soundManager and so on
*/

function Game(canvas, width, height) {
    this.render = new Render(canvas, width, height);
    this.render.clearColor(1.0, 1.0, 0, 1.0);
    this.render.setRenderFunc(clearScreenF);

    this.frameRate = 40;
    this.stopped = false;

    this.shaders = {};

    this.setHandlers();
    this.loadResources();
}

// Game main cycle
Game.prototype.run = function() {
    var timer = null;
    var self = this;

    return new Promise((resolve) => {
        timer = setInterval( () => {
            if (self.stopped) {
                clearInterval(timer);
                self.onClose();
                resolve("Game has stopped!");
            }
            self.update();
        }, 1000 / self.frameRate);
    });
};

Game.prototype.stop = function() {
debug("[Game Stop] killing game process!");
    this.stopped = true;
};

Game.prototype.update = function() {
     //TODO Update logic
	 this.render.draw();
};

Game.prototype.setFrameRate = function(fps) {
    if (fps > 0) {
        this.frameRate = fps;
    }
};


Game.prototype.setHandlers = function() {
    this.render.getCanvas().addEventListener("click", function() {
        this.stop();
    }.bind(this));

    document.addEventListener("keypress", function(e) {
        if (e.charCode == 32) {
            this.render.setFullScreen(this.render._isFullScreen ^ 1);
        }
    }.bind(this));
};

Game.prototype.onClose = function() {
debug("[Game onClose] clear handlers");
    // TODO: remove event listeners
};

Game.prototype.loadResources = function () {
    this.loadShaders();
};

Game.prototype.loadShaders = function () {
debug("[Game loadShaders]: loading shaders");
    return new Promise((res) => {
            this.shaders["simple.vs"] = new Shader(this.render.getContext(), SHADERS_PATH + "simple.xml", VERTEX_SHADER);
            this.shaders["simple.vs"] = new Shader(this.render.getContext(), SHADERS_PATH + "simple.xml", FRAGMENT_SHADER);
            res();
    }).then(() => {
        debug("[Game loadShaders]: shaders has been loaded");
    })
};