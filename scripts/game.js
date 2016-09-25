'use strict';

var RES_PATH = "res/";
var SHADERS_PATH = RES_PATH + "shaders/";

// Simple _render function
function clearScreenF() {
    this.clearScreen();
}

/* Game class
	Define game class which contains renderer, soundManager and so on
*/

function Game(canvas, width, height) {
    this._render = new Render(canvas, width, height);
    this._render.clearColor(1.0, 1.0, 0, 1.0);
    this._render.setRenderFunc(clearScreenF);

    this._frameRate = 40;
    this._stopped = false;

    this._shaders = {};

    this._ready = false; // All resources has been loaded

    this.setHandlers();

    this.initialize();
}

// Game main cycle
Game.prototype.run = function() {
    var timer = null;
    var self = this;

    return new Promise((resolve) => {
        timer = setInterval( () => {
            if (self._stopped) {
                clearInterval(timer);
                self.onClose();
                resolve("Game has _stopped!");
            }
            self.update();
        }, 1000 / self._frameRate);
    });
};

Game.prototype.stop = function() {
debug("[Game] killing game process!");
    this._stopped = true;
};

Game.prototype.update = function() {
     //TODO Update logic
	 this._render.draw();
};

Game.prototype.setFrameRate = function(fps) {
    if (fps > 0) {
        this._frameRate = fps;
    }
};


Game.prototype.setHandlers = function() {
    this._render.getCanvas().addEventListener("click", function() {
        this.stop();
    }.bind(this));

    document.addEventListener("keypress", function(e) {
        if (e.charCode == 32) {
            this._render.setFullScreen(this._render._isFullScreen ^ 1);
        }
    }.bind(this));
};

Game.prototype.onClose = function() {
debug("[Game] clear handlers");
    // TODO: remove event listeners
};

Game.prototype.initialize = function () {
debug("[Game]: initializing resources");

    let self = this;
    new Promise((res) => {
        this.loadResources();
        this.createBuffers();
        res();
    }).then(() => {
        self._ready = true;
    }).catch((err) => {
        debug(`[Game initialize] error: ${err}`)
    })
};

Game.prototype.loadResources = function () {
    this.loadShaders();
};

Game.prototype.loadShaders = function () {
debug("[Game]: loading _shaders");
    this._shaders["simple.vs"] = new Shader(this._render.getContext(), SHADERS_PATH + "simple.xml", VERTEX_SHADER);
    this._shaders["simple.vs"] = new Shader(this._render.getContext(), SHADERS_PATH + "simple.xml", FRAGMENT_SHADER);
};

Game.prototype.createBuffers = function () {
debug("[Game]: loading buffers");

    //noinspection ES6ModulesDependencies
    this._imgBuffer = new Buffer(this._render.getContext(),
        [
            1.0,  1.0,  0.0,
            -1.0, 1.0,  0.0,
            1.0,  -1.0, 0.0,
            -1.0, -1.0, 0.0
        ],
        ARRAY_BUFFER, STATIC_DRAW);

};