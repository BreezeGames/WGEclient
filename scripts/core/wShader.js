"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine shaders */
/* version: 1.2 */

class Shader {
    /**********************************
     * Create shader from XML file
     * @param gl WebGL context
     * @param shaderXml XML shader object
     * @param type Shader type. Can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @constructor
     */
    constructor(gl, shaderXml, type) {
        Uttils.debug(`[Shader constructor]: creating shader`);

        this._shaderText = null;
        this._shader = null;
        this._type = type;
        this._attr = [];

        this._shaderText = this._parseShader(shaderXml);
        this._shader = gl.createShader(this._type);
        gl.shaderSource(this._shader, this._shaderText);
        gl.compileShader(this._shader);

        if (!gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
            let info = gl.getShaderInfoLog(this._shader);
            throw new Error(`shader compile error \n ${info}`);
        }



    }

    get shader(){
        return this._shader;
    }

    get type() {
        return this._type;
    }

    _parseShader(xml) {
        let xmlType = null;
        switch(this._type) {
            case VERTEX_SHADER:
                xmlType = "vertex";
                break;
            case FRAGMENT_SHADER:
                xmlType = "fragment";
                break;
            default:
                throw new Error("Appropriate shader type");
        }

        console.log(`shader[type="${xmlType}"]`);
        let shader = xml.querySelector(`shader[type="${xmlType}"]`);
        if (!shader) {
            throw new Error(`Can't find shader resource of type ${xmlType}`);
        }

        let body = shader.querySelector("body");
        if (!body) {
            throw new Error(`Can't find shader body!`);
        }

        let attributes = shader.querySelector("attributes");
        if (attributes) {
            this._parseAttributes(attributes.textContent);
            return attributes.textContent + body.textContent;
        }

        return body.textContent;
    }

    _parseAttributes(source) {
        try {
            let lines = source.split(";");
            lines = lines.splice(0, lines.length-1);

            for (let line of lines) {
                line = line.trim();

                let word = line.split(" ");
                this._attr.push({
                    name: word[2],
                    type: word[1],
                    state: word[0]
                });
            }
        } catch(e) {
            throw "Error parsing attributes!";
        }
    }
}
/*
    Program class
    version: 1.1
 */
class Program {
    constructor(gl, vertex, fragment) {
        this._gl = gl;
        this._program = gl.createProgram();
        this._attributes = {};

        if (vertex) {
            gl.attachShader(this._program, vertex.shader);
        }
        if (fragment) {
            gl.attachShader(this._program, fragment.shader);
        }

        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, LINK_STATUS)) {
            throw new Error("[Program constructor] linking error");
        }

        if (vertex) {
            for (let a of vertex._attr.values()) {
                this._loadAttribute(a);
            }
        }

        if (fragment) {
            for (let a of fragment._attr.values()) {
                this._loadAttribute(a);
            }
        }
    }

    get program() {
        return this._program;
    }

    getAttribute(name) {
        return this._attributes[name];
    }

    setUniform(name, data) {
        let attr = this._attributes[name];

        if (!attr) {
            return;
        }

        if (attr.state !== "uniform") {
            throw `Cannot enable ${name} uniform attribute!`;
        }

        let dem = Number(attr.type[attr.type.length-1]);
        if (!dem) {
            throw `Type of ${name} is appropriate!`;
        }


        switch(dem) {
            case 3:
                this._gl.uniformMatrix3fv(attr.location, false, data);
                break;
            case 4:
                this._gl.uniformMatrix4fv(attr.location, false, data);
                break;
            default:
                throw `Cannot set uniform ${name}: bad type ${attr.type}!`;
        }
    }

    setAttribute(name, value) {

    }

    setVertexAttrib(name) {
        let attr = this._attributes[name];

        if (!attr) {
            return;
        }

        if (attr.state !== "attribute") {
            throw `Cannot enable ${name} attribute!`;
        }

        let dem = Number(attr.type[attr.type.length-1]);
        if (!dem) {
            throw `Type of ${name} is appropriate!`;
        }

        this._gl.vertexAttribPointer(attr.location, dem, FLOAT, false, 0, 0);
    }

    enableVertexAttribArray(name) {
        this._gl.enableVertexAttribArray(this._attributes[name].location);
    }

    use() {
        this._gl.useProgram(this._program);
    }

    _loadAttribute(attr) {
        Uttils.debug(`Loading ${attr.state} ${attr.type} ${attr.name}...`);

        var attribLoc = null;

        if (attr.state === "attribute") {
            attribLoc = this._gl.getAttribLocation(this._program, attr.name);
        } else if (attr.state === "uniform") {
            attribLoc = this._gl.getUniformLocation(this._program, attr.name);
        }

        this._attributes[attr.name] = {
            location: attribLoc,
            type: attr.type,
            state: attr.state
        }
    }

}