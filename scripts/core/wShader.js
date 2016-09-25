"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine _shaders */
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
 * @param name XML shader file name on server
 * @param type Shader type. Can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @constructor
 */
function Shader(gl, name, type) {
debug(`[Shader constructor]: creating shader from ${name}`);

    this._shaderFile = null;
    this._shaderText = null;
    this._shader = null;
    this._type = type;

    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
        if (xhr.status != 200) {
            throw new Error(`[Shader constructor]: status ${xhr.status} : ${xhr.statusText}`);
        }

        this._shaderFile = xhr.responseXML;

        try {
            this._shaderText = parseShader(this._shaderFile, type);

            this._shader = gl.createShader(this._type);
            gl.shaderSource(this._shader, this._shaderText);
            gl.compileShader(this._shader);

            if (!gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
                let info = gl.getShaderInfoLog(this._shader);
                throw new Error(`shader compile error \n ${info}`);
            }

        } catch (err) {
            throw new Error(`[Shader constructor]: ${name} \n ${err}`);
        }

    }.bind(this);

    xhr.onerr = function(err) {
        throw new Error(`[Shader constructor]: ${err}`);
    };

    xhr.open("GET", name);
    xhr.responseType = "document";
    xhr.send();
}

Shader.prototype.shader = () => {
    return this._shader;
};

Shader.prototype.type = () => {
    return this._type;
};