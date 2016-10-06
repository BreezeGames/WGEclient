"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Buffer incapsulation class */
/* version: 1.1               */

class Buffer {
    constructor(gl, data, type, drawType = STATIC_DRAW) {
        Uttils.debug("[Buffer constructor]: Constructing buffer");

        try {
            this._data = [];
            this._size = 0;
            this._dem = data[0].length;

            for (let vertex of data) {
                ++this._size;
                for (let coord of vertex) {
                    this._data.push(coord);
                }
            }

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

    get dem() {
        return this._dem;
    }

    get size() {
        return this._size;
    }

    bind() {
        this.gl.bindBuffer(this._type, this._buffer);
    }
}