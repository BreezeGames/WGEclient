"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine shaders */
/* version: 1.1 */


function parseShader(xml, type) {
    let xmlType = null;
    switch(type) {
        case VERTEX_SHADER:
            xmlType = "vertex";
            break;
        case FRAGMENT_SHADER:
            xmlType = "fragment";
            break;
        default:
            throw new Error("Appropriate shader type");
    }

    let shader = xml.querySelector(`shader[type="${xmlType}"]`);
    console.info(shader);
    if (!shader) {
        throw new Error(`Can't find shader resource of type ${xmlType}`);
    }

    return shader.textContent;
}

/**********************************
 * Create shader from XML file
 * @param gl WebGL context
 * @param shaderXml XML shader object
 * @param type Shader type. Can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @constructor
 */
function Shader(gl, shaderXml, type) {
debug(`[Shader constructor]: creating shader`);

    this._shaderText = null;
    this._shader = null;
    this._type = type;

    this._shaderText = parseShader(shaderXml);
    this._shader = gl.createShader(this._type);
    gl.shaderSource(this._shader, this._shaderText);
    gl.compileShader(this._shader);

    if (!gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
        let info = gl.getShaderInfoLog(this._shader);
        throw new Error(`shader compile error \n ${info}`);
    }

}

Shader.prototype.shader = () => {
    return this._shader;
};

Shader.prototype.type = () => {
    return this._type;
};

/*
    Program class
    version: 1.0
 */
class Program {
    constructor(gl, vertex, fragment) {
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

    get program() {
        return this._program;
    }

    getAttribute(name) {
        return this._gl.getAttribLocation(this._program, name);
    }

    use() {
        this._gl.useProgram(this._program);
    }
}