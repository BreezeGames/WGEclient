'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (self) {
  'use strict';

  if (self.fetch) {
    return;
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function next() {
        var value = items.shift();
        return { done: value === undefined, value: value };
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator;
      };
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var list = this.map[name];
    if (!list) {
      list = [];
      this.map[name] = list;
    }
    list.push(value);
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    var values = this.map[normalizeName(name)];
    return values ? values[0] : null;
  };

  Headers.prototype.getAll = function (name) {
    return this.map[normalizeName(name)] || [];
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)];
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function (name) {
      this.map[name].forEach(function (value) {
        callback.call(thisArg, value, name, this);
      }, this);
    }, this);
  };

  Headers.prototype.keys = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push(name);
    });
    return iteratorFor(items);
  };

  Headers.prototype.values = function () {
    var items = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return iteratorFor(items);
  };

  Headers.prototype.entries = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return fileReaderReady(reader);
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    reader.readAsText(blob);
    return fileReaderReady(reader);
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
      this._bodyInit = body;
      if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (!body) {
        this._bodyText = '';
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type');
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        return this.blob().then(readBlobAsArrayBuffer);
      };

      this.text = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text');
        } else {
          return Promise.resolve(this._bodyText);
        }
      };
    } else {
      this.text = function () {
        var rejected = consumed(this);
        return rejected ? rejected : Promise.resolve(this._bodyText);
      };
    }

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = input;
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this);
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function headers(xhr) {
    var head = new Headers();
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n');
    pairs.forEach(function (header) {
      var split = header.trim().split(':');
      var key = split.shift().trim();
      var value = split.join(':').trim();
      head.append(key, value);
    });
    return head;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText;
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, { status: 0, statusText: '' });
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, { status: status, headers: { location: url } });
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      var request;
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input;
      } else {
        request = new Request(input, init);
      }

      var xhr = new XMLHttpRequest();

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL;
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL');
        }

        return;
      }

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        };
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : undefined);

"use strict";
/**
 * Created by jorgen on 25.09.16.
 */
/* Buffer incapsulation class */
/* version: 1.0               */

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
      throw new Error('[Buffer constructor] error: ' + err);
    }
  }

  _createClass(Buffer, [{
    key: 'bind',
    value: function bind() {
      this.gl.bindBuffer(this._type, this._buffer);
    }
  }, {
    key: 'data',
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

var COLOR_BUFFER_BIT = 0x00004000,
    DEPTH_BUFFER_BIT = 0x00000100,
    STENCIL_BUFFER_BIT = 0x00000400;
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
    key: 'setRenderScene',
    value: function setRenderScene(scene) {
      if (scene) {
        this._renderScene = scene;
      }
    }
  }, {
    key: 'width',
    value: function width(_width) {
      if (_width) {
        this._canvas.width = _width;
        this.viewport(0, 0, this.width(), this.height());
      } else {
        return this._canvas.width;
      }
    }
  }, {
    key: 'height',
    value: function height(_height) {
      if (_height) {
        this._canvas.height = _height;
        this.viewport(0, 0, this.width(), this.height());
      } else {
        return this._canvas.height;
      }
    }
  }, {
    key: 'getCanvas',
    value: function getCanvas() {
      return this._canvas;
    }
  }, {
    key: 'getContext',
    value: function getContext() {
      return this._ctx;
    }
  }, {
    key: 'clearColor',
    value: function clearColor(r, g, b, a) {
      if (r) {
        this._ctx.clearColor(r, g, b, a);
      } else {
        return this._ctx.getParameter(this._ctx.COLOR_CLEAR_VALUE);
      }
    }
  }, {
    key: 'clearScreen',
    value: function clearScreen(depth) {
      var clr = this._ctx.COLOR_BUFFER_BIT;
      clr |= depth ? this._ctx.DEPTH_BUFFER_BIT : 0;

      this._ctx.clear(clr);
    }
  }, {
    key: 'render',
    value: function render() {
      if (this._renderScene) {
        this._renderScene.update();
        this._renderScene.draw();
      }
    }
  }, {
    key: 'viewport',
    value: function viewport(x, y, width, height) {
      this._ctx.viewport(x, y, width, height);
    }
  }, {
    key: 'setFullScreen',
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

    this.onReady = function () {};
  }

  _createClass(Scene, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.loadResources().then(function () {
        _this.createResources();
        _this.onReady();
      });
    }

    // Sync

  }, {
    key: 'createResources',
    value: function createResources() {
      throw new Error("createResources method not implemented");
    }

    // Async

  }, {
    key: 'loadResources',
    value: function loadResources() {
      //!!MUST RETURN PROMISE
      throw new Error("loadResources method not implemented");
    }
  }, {
    key: 'draw',
    value: function draw() {
      throw new Error("render method not implemented");
    }
  }, {
    key: 'update',
    value: function update() {
      throw new Error("update method not implemented");
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

  var shader = xml.querySelector('shader[type="' + xmlType + '"]');
  if (!shader) {
    throw new Error('Can\'t find shader resource of type ' + xmlType);
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

    Uttils.debug('[Shader constructor]: creating shader');

    this._shaderText = null;
    this._shader = null;
    this._type = type;

    this._shaderText = parseShader(shaderXml, type);
    this._shader = gl.createShader(this._type);
    gl.shaderSource(this._shader, this._shaderText);
    gl.compileShader(this._shader);

    if (!gl.getShaderParameter(this._shader, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(this._shader);
      throw new Error('shader compile error \n ' + info);
    }
  }

  _createClass(Shader, [{
    key: 'shader',
    get: function get() {
      return this._shader;
    }
  }, {
    key: 'type',
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
      gl.attachShader(this._program, vertex.shader);
    }
    if (fragment) {
      gl.attachShader(this._program, fragment.shader);
    }

    gl.linkProgram(this._program);

    if (!gl.getProgramParameter(this._program, LINK_STATUS)) {
      throw new Error("[Program constructor] linking error");
    }
  }

  _createClass(Program, [{
    key: 'getAttribute',
    value: function getAttribute(name) {
      return this._gl.getAttribLocation(this._program, name);
    }
  }, {
    key: 'use',
    value: function use() {
      this._gl.useProgram(this._program);
    }
  }, {
    key: 'program',
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
    key: 'debug',
    value: function debug(string) {
      if (IS_DEBUG) {
        console.log(string);
      }
    }
  }]);

  return Uttils;
}();
//# sourceMappingURL=wgecore.js.map
