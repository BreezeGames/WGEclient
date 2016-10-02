"use strict";

/**
 * Created by jorgen on 24.09.16.
 */
/* WGEngine definitions */

var IS_DEBUG = true;

var VERTEX_SHADER           = 0x8B31,
    FRAGMENT_SHADER         = 0x8B30;


var ARRAY_BUFFER            = 0x8892,
    ELEMENT_ARRAY_BUFFER    = 0x8893;

var STREAM_DRAW             = 0x88E0,
    STATIC_DRAW             = 0x88E4,
    DYNAMIC_DRAW            = 0x88E8;

var LINK_STATUS             = 0x8B82;

var FLOAT                   = 0x1406;

var TRIANGLE_STRIP          = 0x0005,
    TRIANGLES               = 0x0004,
    TRIANGLE_FAN            = 0x0006,
    POINTS                  = 0x0000,
    LINES                   = 0x0001,
    LINE_LOOP               = 0x0002,
    LINE_STRIP              = 0x0003;


var COLOR_BUFFER_BIT        = 0x00004000,
    DEPTH_BUFFER_BIT        = 0x00000100,
    STENCIL_BUFFER_BIT      = 0x00000400;