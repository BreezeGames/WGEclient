"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Buffer incapsulation class */
/* version: 1.0               */

class Buffer {
    constructor(gl, data, type, drawType = STATIC_DRAW) {
        Uttils.debug("[Buffer constructor]: Constructing buffer");

        try {
            this._data = data;
            this._type = type;
            this._drawType = drawType;
            this.gl = gl;

            this._buffer = gl.createBuffer();
            this.gl.bindBuffer(this._type, this._buffer);
            this.gl.bufferData(this._type, new Float32Array(this._data), this._drawType);
        } catch(err) {
            throw new Error(`[Buffer constructor] error: ${err}`);
        }
    }

    get data() {
        return this._data;
    }

    bind() {
        this.gl.bindBuffer(this._type, this._buffer);
    }
}