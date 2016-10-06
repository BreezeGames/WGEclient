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

        this.mvMatrix = mat4.create();
        mat4.identity(this.mvMatrix);
        mat4.scale(this.mvMatrix, this.mvMatrix, [0.5, 0.5, 1.0]);

        this.pMatrix = mat4.create();

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

        mat4.perspective(this.pMatrix, 45, 16/9, 0.1, 100.0);
        //mat4.translate(this.mvMatrix, this.mvMatrix, [7.5, 0.0, -7.0]);

        this.imgBuffer.bind();
        this.gl.vertexAttribPointer(
            this.program.getAttribute("position"),
            this.imgBuffer.itemSize, FLOAT, false, 0, 0);

        this.setMatrixUniforms();

        this.gl.drawArrays(TRIANGLE_STRIP, 0, this.imgBuffer.size);
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

    moveLeft() {
        console.log("MOVE LEFT!");
        mat4.translate(this.mvMatrix, this.mvMatrix, [-1.0, 0.0, 0.0])
    }

    moveRight() {
        mat4.translate(this.mvMatrix, this.mvMatrix, [1.0, 0.0, 0.0])
    }

    moveDown() {
        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 1.0, 0.0])
    }

    moveUp() {
        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, -1.0, 0.0])
    }
    setMatrixUniforms() {
        this.program.setUniform("mvMatrix", this.mvMatrix);
        this.program.setUniform("pMatrix", this.pMatrix);
    }

    createProgram() {
        //noinspection ES6ModulesDependencies
        this.program = new Program(this.gl, this.shaders["simple.vs"], this.shaders["simple.vf"]);
        this.program.use();
        this.program.enableVertexAttribArray("position");
    }

    createBuffers() {
        Uttils.debug("[Game]: loading buffers");

        //noinspection ES6ModulesDependencies
        this.imgBuffer = new Buffer(this.gl,
            [
                [1.0,  1.0,  0.0],
                [-1.0, 1.0,  0.0],
                [1.0,  -1.0, 0.0],
                [-1.0, -1.0, 0.0]
            ],
            ARRAY_BUFFER, STATIC_DRAW);

        Uttils.debug(`[CreateBuffers]: size = ${this.imgBuffer.size}`);
        Uttils.debug(`[CreateBuffers]: dem = ${this.imgBuffer.itemSize}`);
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
        Uttils.debug("[Game] killing game process!");
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

            if (e.keyCode == 40) {
                this.startScene.moveUp();
            }
            if (e.keyCode == 38) {
                this.startScene.moveDown();
            }
            if (e.keyCode == 39) {
                this.startScene.moveRight();
            }
            if (e.keyCode == 37) {
                this.startScene.moveLeft();
            }
        }.bind(this));
    }

    onClose() {
        // TODO: remove event listeners
    }
}
