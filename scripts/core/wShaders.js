"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine shaders */
/* version: 1.0 */


function parseShader(xml) {
    console.log(xml.querySelector("shader"));

    let shader = xml.querySelector("shader");
    if (!shader) {
        throw new Error("Appropriate shader file");
    }

    let type = shader.getAttribute("type");
    switch(type) {
        case "vertex":
            type = VERTEX_SHADER;
            break;
        case "fragment":
            type = FRAGMENT_SHADER;
            break;
        default:
            throw new Error("Appropriate shader file");
    }
    return { source: shader.textContent, type: type};
}

/**********************************
 * Create shader from XML file
 * @param ctx WebGL context
 * @param name XML shader file name on server
 * @param type Shader type. Can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @constructor
 */
function Shader(ctx, name) {
debug(`[Shader constructor]: creating shader from ${name}`);

    this._shaderFile = null;
    this._shaderText = null;
    this._shader = null;
    this._type = null;

    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
        this._shaderFile = xhr.responseXML;

        try {
            let parsed = parseShader(this._shaderFile);
            this._shaderText = parsed.source;
            this._type = parsed.type;

            this._shader = ctx.createShader(this._type);
            ctx.shaderSource(this._shader, this._shaderText);
            ctx.compileShader(this._shader);

            if (!ctx.getShaderParameter(this._shader, ctx.COMPILE_STATUS)) {
                let info = ctx.getShaderInfoLog(this._shader);
                throw new Error(`shader compile error \n ${info}`);
            }

        } catch (err) {
            throw new Error(`[Shader constructor]: ${err}`);
        }

    }.bind(this);

    xhr.onerror = function(err) {
        throw new Error(`[Shader constructor]: ${err}`);
    };

    xhr.open("GET", SHADERS_PATH + name);
    xhr.responseType = "document";
    xhr.send();
}

Shader.prototype.shader = () => {
    return this._shader;
};

Shader.prototype.type = () => {
    return this._type;
};