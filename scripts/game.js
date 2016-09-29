'use strict';

var RES_PATH = "res/";
var SHADERS_PATH = RES_PATH + "shaders/";

/* Starting scene
    Scene just render a square
 */
class StartScene extends Scene {
    constructor(context) {
        super();

        this.shaders = {};
        this.imgBuffer = null;
        this.gl = context;

        super.init();
    }

    createResources() {
        Uttils.debug("Creating resources...");
        this.createBuffers();
        this.createProgram();
    }

    // Draw gets gl context
    draw() {
        this.gl.clear(COLOR_BUFFER_BIT);

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
        Uttils.debug("[Game]: loading shaders");

        return new Promise (done => {
            // SIMPLE SHADER DOWNLOAD
            fetch(`${SHADERS_PATH}simple.xml`).then(response => {
                Uttils.debug(`File ${response.url} loaded. Status: ${response.status}`);
                return response.text();
            }).then(file => {
                file = new DOMParser().parseFromString(file, "text/xml");
                this.shaders["simple.vs"] = new Shader(this.gl, file, VERTEX_SHADER);
                this.shaders["simple.vf"] = new Shader(this.gl, file, FRAGMENT_SHADER);
                done();
            }).catch(err => {
                throw err;
            });

        });
    }

    createProgram() {
        //noinspection ES6ModulesDependencies
        this.program = new Program(this.gl, this.shaders["simple.vs"], this.shaders["simple.vf"]);

        this.attrPosition = this.program.getAttribute("position");
        this.gl.enableVertexAttribArray(this.attrPosition);

        this.gl.vertexAttribPointer(this.attrPosition, 3, FLOAT, false, 0, 0);
    }

    createBuffers() {
        Uttils.debug("[Game]: loading buffers");

        //noinspection ES6ModulesDependencies
        this.imgBuffer = new Buffer(this.gl,
            [
                1.0,  1.0,  0.0,
                -1.0, 1.0,  0.0,
                1.0,  -1.0, 0.0,
                -1.0, -1.0, 0.0
            ],
            ARRAY_BUFFER, STATIC_DRAW);

        Uttils.debug("[Game]: Buffers created");
    }
}

/* Game class
	Define game class which contains renderer, soundManager and so on
*/
class Game {
    constructor(canvas, width, height) {
        this._render = new Render(canvas, width, height);

        this._frameRate = 40;
        this._stopped = false;

        this.shaders = {};

        this.startScene = new StartScene(this._render.getContext());
        this.startScene.onReady = function () {
            this._render.setRenderScene(this.startScene);
        }.bind(this);

        this.setHandlers();
    }

// Game main cycle
    run() {
        var timer = null;
        var self = this;

        return new Promise((resolve) => {
            timer = setInterval(() => {
                if (self._stopped) {
                    clearInterval(timer);
                    self.onClose();
                    resolve("Game has _stopped!");
                }
                self.update();
            }, 1000 / self._frameRate);
        });
    }

    stop() {
        debug("[Game] killing game process!");
        this._stopped = true;
    }

    update() {
        //TODO Update logic
        this._render.render();
    }

    setFrameRate(fps) {
        if (fps > 0) {
            this._frameRate = fps;
        }
    }

    setHandlers() {
        this._render.getCanvas().addEventListener("click", function () {
            this.stop();
        }.bind(this));

        document.addEventListener("keypress", function (e) {
            if (e.charCode == 32) {
                this._render.setFullScreen(this._render._isFullScreen ^ 1);
            }
        }.bind(this));
    }

    onClose() {
        debug("[Game] clear handlers");
        // TODO: remove event listeners
    }
}
