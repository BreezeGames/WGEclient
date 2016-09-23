"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine shaders */



/**********************************
 * Create shader from XML file
 * @param ctx WebGL context
 * @param name XML shader file name on server
 * @constructor
 */
function Shader(ctx, name) {
    this.shaderFile = null;

    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
        this.shaderFile = xhr.responseXML;
    }.bind(this);

    xhr.onerror = function(err) {
        throw new Error("[Shader constructor]: ", err);
    };

    xhr.open("GET", SHADERS_PATH + name);
    xhr.responseType = "document";
    xhr.send();
}
