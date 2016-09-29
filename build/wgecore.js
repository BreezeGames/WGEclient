"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Buffer incapsulation class */
/* version: 1.0               */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = function () {
    function Buffer(gl, data, type) {
        var drawType = arguments.length <= 3 || arguments[3] === undefined ? STATIC_DRAW : arguments[3];

        _classCallCheck(this, Buffer);

        Uttils.debug("[Buffer constructor]: Constructing buffer");

        try {
            this._data = data;
            this._type = type;
            this._drawType = drawType;
            this.gl = gl;

            this._buffer = gl.createBuffer();
            this.gl.bindBuffer(this._type, this._buffer);
            this.gl.bufferData(this._type, new Float32Array(this._data), this._drawType);
        } catch (err) {
            throw new Error("[Buffer constructor] error: " + err);
        }
    }

    _createClass(Buffer, [{
        key: "bind",
        value: function bind() {
            this.gl.bindBuffer(this._type, this._buffer);
        }
    }, {
        key: "data",
        get: function get() {
            return this._data;
        }
    }]);

    return Buffer;
}();

"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine definitions */

var IS_DEBUG = true;

var VERTEX_SHADER = 0x8B31,
    FRAGMENT_SHADER = 0x8B30;

var ARRAY_BUFFER = 0x8892,
    ELEMENT_ARRAY_BUFFER = 0x8893;

var STREAM_DRAW = 0x88E0,
    STATIC_DRAW = 0x88E4,
    DYNAMIC_DRAW = 0x88E8;

var LINK_STATUS = 0x8B82;

var FLOAT = 0x1406;

var TRIANGLE_STRIP = 0x0005;
'use strict';

var Render = function () {
    function Render(canvas, width, height) {
        _classCallCheck(this, Render);

        if (!canvas) {
            throw new Error("[Render constructor]: wrong canvas element");
        }

        this._canvas = canvas;

        Uttils.debug("[Render constructor]: initializing webGL context");
        this._ctx = null;
        try {
            this._ctx = this._canvas.getContext('webgl') || this._canvas.getContext('experemental-webgl');
        } catch (e) {}

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

    _createClass(Render, [{
        key: "setRenderScene",
        value: function setRenderScene(scene) {
            if (scene) {
                this._renderScene = scene;
            }
        }
    }, {
        key: "width",
        value: function width(_width) {
            if (_width) {
                this._canvas.width = _width;
                this.viewport(0, 0, this.width(), this.height());
            } else {
                return this._canvas.width;
            }
        }
    }, {
        key: "height",
        value: function height(_height) {
            if (_height) {
                this._canvas.height = _height;
                this.viewport(0, 0, this.width(), this.height());
            } else {
                return this._canvas.height;
            }
        }
    }, {
        key: "getCanvas",
        value: function getCanvas() {
            return this._canvas;
        }
    }, {
        key: "getContext",
        value: function getContext() {
            return this._ctx;
        }
    }, {
        key: "clearColor",
        value: function clearColor(r, g, b, a) {
            if (r) {
                this._ctx.clearColor(r, g, b, a);
            } else {
                return this._ctx.getParameter(this._ctx.COLOR_CLEAR_VALUE);
            }
        }
    }, {
        key: "clearScreen",
        value: function clearScreen(depth) {
            var clr = this._ctx.COLOR_BUFFER_BIT;
            clr |= depth ? this._ctx.DEPTH_BUFFER_BIT : 0;

            this._ctx.clear(clr);
        }
    }, {
        key: "draw",
        value: function draw() {
            if (this._renderScene) {
                this._renderScene.update();
                this._renderScene.draw();
            }
        }
    }, {
        key: "viewport",
        value: function viewport(x, y, width, height) {
            this._ctx.viewport(x, y, width, height);
        }
    }, {
        key: "setFullScreen",
        value: function setFullScreen(yes) {
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
        }
    }]);

    return Render;
}();

"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Renderer scene interface */
/* version: 0.1 */

var Scene = function () {
    function Scene() {
        _classCallCheck(this, Scene);
    }

    _createClass(Scene, [{
        key: "init",
        value: function init() {
            throw new Error("Init method not implemented");
        }
    }, {
        key: "draw",
        value: function draw() {
            throw new Error("Draw method not implemented");
        }
    }, {
        key: "update",
        value: function update() {
            throw new Error("Update method not implemented");
        }
    }]);

    return Scene;
}();

"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine shaders */
/* version: 1.1 */

function parseShader(xml, type) {
    var xmlType = null;
    switch (type) {
        case VERTEX_SHADER:
            xmlType = "vertex";
            break;
        case FRAGMENT_SHADER:
            xmlType = "fragment";
            break;
        default:
            throw new Error("Appropriate shader type");
    }

    var shader = xml.querySelector("shader[type=\"" + xmlType + "\"]");
    console.info(shader);
    if (!shader) {
        throw new Error("Can't find shader resource of type " + xmlType);
    }

    return shader.textContent;
}

var Shader = function () {
    /**********************************
     * Create shader from XML file
     * @param gl WebGL context
     * @param shaderXml XML shader object
     * @param type Shader type. Can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @constructor
     */
    function Shader(gl, shaderXml, type) {
        _classCallCheck(this, Shader);

        Uttils.debug("[Shader constructor]: creating shader");

        this._shaderText = null;
        this._shader = null;
        this._type = type;

        this._shaderText = parseShader(shaderXml);
        this._shader = gl.createShader(this._type);
        gl.shaderSource(this._shader, this._shaderText);
        gl.compileShader(this._shader);

        if (!gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
            var info = gl.getShaderInfoLog(this._shader);
            throw new Error("shader compile error \n " + info);
        }
    }

    _createClass(Shader, [{
        key: "shader",
        get: function get() {
            return this._shader;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }]);

    return Shader;
}();
/*
    Program class
    version: 1.0
 */


var Program = function () {
    function Program(gl, vertex, fragment) {
        _classCallCheck(this, Program);

        this._gl = gl;
        this._program = gl.createProgram();

        if (vertex) {
            gl.attachShader(this._program, vertex.shader());
        }
        if (fragment) {
            gl.attachShader(this._program, fragment.shader());
        }

        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, LINK_STATUS)) {
            throw new Error("[Program constructor] linking error");
        }
    }

    _createClass(Program, [{
        key: "getAttribute",
        value: function getAttribute(name) {
            return this._gl.getAttribLocation(this._program, name);
        }
    }, {
        key: "use",
        value: function use() {
            this._gl.useProgram(this._program);
        }
    }, {
        key: "program",
        get: function get() {
            return this._program;
        }
    }]);

    return Program;
}();

'use strict';

var Uttils = function () {
    function Uttils() {
        _classCallCheck(this, Uttils);
    }

    _createClass(Uttils, null, [{
        key: "debug",
        value: function debug(string) {
            if (IS_DEBUG) {
                console.log(string);
            }
        }
    }]);

    return Uttils;
}();
//# sourceMappingURL=wgecore.js.map
