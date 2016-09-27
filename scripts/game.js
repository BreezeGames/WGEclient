'use strict';

var RES_PATH = "res/";
var SHADERS_PATH = RES_PATH + "shaders/";

/* Starting scene
    Scene just render a square
 */
class StartScene extends Scene {
    constructor() {
        super();

        this.shaders = {};
        this.imgBuffer = null;
        this.ready = false;

        this.onReady = null;
    }

    init(gl) {
    debug("[StartScene]: initializing resources");
        this.gl = gl;

        this.loadResources();
        this.createBuffers();
        this.createProgram();

        this.ready = true;
        if (this.onReady) {
            this.onReady();
        }
    }

    // Draw gets gl context
    draw() {
        this.gl.clear();

        this.imgBuffer.bind();

        this.program.use();

        this.gl.drawArrays(TRIANGLE_STRIP, 0, 4);
    }

    update() {

    }

    loadResources() {
        return this.loadShaders();
    }

    loadShaders() {
    debug("[Game]: loading shaders");
        //fetch()

        this.shaders["simple.vs"] = new Shader(this.gl, SHADERS_PATH + "simple.xml", VERTEX_SHADER);
        this.shaders["simple.vf"] = new Shader(this.gl, SHADERS_PATH + "simple.xml", FRAGMENT_SHADER);
        console.log("LOADSHADERS: ", this.shaders["simple.vs"]);
    }

    createProgram() {
        //noinspection ES6ModulesDependencies
        console.log("CREATEPROGRAM: ", this.shaders["simple.vs"]);
        this.program = new Program(this.gl, this.shaders["simple.vs"], this.shaders["simple.vf"]);

        this.attrPosition = this.program.getAttribute("position");
        this.gl.enableVertexAttribArray(this.attrPosition);

        this.gl.vertexAttribPointer(this.attrPosition, 3, FLOAT, false, 0, 0);
    }

    createBuffers() {
    debug("[Game]: loading buffers");

        //noinspection ES6ModulesDependencies
        this.imgBuffer = new Buffer(this.gl,
            [
                1.0,  1.0,  0.0,
                -1.0, 1.0,  0.0,
                1.0,  -1.0, 0.0,
                -1.0, -1.0, 0.0
            ],
            ARRAY_BUFFER, STATIC_DRAW);

    debug("[Game]: Buffers created");
    }
}

/* Game class
	Define game class which contains renderer, soundManager and so on
*/

function Game(canvas, width, height) {
    this._render = new Render(canvas, width, height);

    this._frameRate = 40;
    this._stopped = false;

    this.shaders = {};

    this.startScene = new StartScene();
    this.startScene.init(this._render.getContext());
    this.startScene.onReady = function() {
        this._render.setRenderScene(this.startScene);
    }.bind(this);

    this.setHandlers();
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

