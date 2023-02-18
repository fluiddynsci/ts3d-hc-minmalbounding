(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var normalize = require('gl-vec3/normalize')
var sub = require('gl-vec3/subtract')
var cross = require('gl-vec3/cross')
var tmp = [0, 0, 0]

module.exports = planeNormal

function planeNormal (out, point1, point2, point3) {
  sub(out, point1, point2)
  sub(tmp, point2, point3)
  cross(out, out, tmp)
  return normalize(out, out)
}
},{"gl-vec3/cross":5,"gl-vec3/normalize":9,"gl-vec3/subtract":14}],3:[function(require,module,exports){
module.exports = add;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
}
},{}],4:[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}
},{}],5:[function(require,module,exports){
module.exports = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
}
},{}],6:[function(require,module,exports){
module.exports = distance;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],7:[function(require,module,exports){
module.exports = dot;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
},{}],8:[function(require,module,exports){
module.exports = length;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],9:[function(require,module,exports){
module.exports = normalize;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    var len = x*x + y*y + z*z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}
},{}],10:[function(require,module,exports){
module.exports = scale;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b
    out[1] = a[1] * b
    out[2] = a[2] * b
    return out
}
},{}],11:[function(require,module,exports){
module.exports = scaleAndAdd;

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale)
    out[1] = a[1] + (b[1] * scale)
    out[2] = a[2] + (b[2] * scale)
    return out
}
},{}],12:[function(require,module,exports){
module.exports = squaredDistance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return x*x + y*y + z*z
}
},{}],13:[function(require,module,exports){
module.exports = squaredLength;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return x*x + y*y + z*z
}
},{}],14:[function(require,module,exports){
module.exports = subtract;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
}
},{}],15:[function(require,module,exports){
/*
 * point-line-distance
 *
 * Copyright (c) 2015 Mauricio Poppe
 * Licensed under the MIT license.
 */

'use strict'

var distanceSquared = require('./squared')

module.exports = function (point, a, b) {
  return Math.sqrt(distanceSquared(point, a, b))
}

},{"./squared":16}],16:[function(require,module,exports){
var subtract = require('gl-vec3/subtract')
var cross = require('gl-vec3/cross')
var squaredLength = require('gl-vec3/squaredLength')
var ab = []
var ap = []
var cr = []

module.exports = function (p, a, b) {
  // // == vector solution
  // var normalize = require('gl-vec3/normalize')
  // var scaleAndAdd = require('gl-vec3/scaleAndAdd')
  // var dot = require('gl-vec3/dot')
  // var squaredDistance = require('gl-vec3/squaredDistance')
  // // n = vector `ab` normalized
  // var n = []
  // // projection = projection of `point` on `n`
  // var projection = []
  // normalize(n, subtract(n, a, b))
  // scaleAndAdd(projection, a, n, dot(n, p))
  // return squaredDistance(projection, p)

  // == parallelogram solution
  //
  //            s
  //      __a________b__
  //       /   |    /
  //      /   h|   /
  //     /_____|__/
  //    p
  //
  //  s = b - a
  //  area = s * h
  //  |ap x s| = s * h
  //  h = |ap x s| / s
  //
  subtract(ab, b, a)
  subtract(ap, p, a)
  var area = squaredLength(cross(cr, ap, ab))
  var s = squaredLength(ab)
  if (s === 0) {
    throw Error('a and b are the same point')
  }
  return area / s
}

},{"gl-vec3/cross":5,"gl-vec3/squaredLength":13,"gl-vec3/subtract":14}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VISIBLE = exports.NON_CONVEX = exports.DELETED = void 0;

var _dot = _interopRequireDefault(require("gl-vec3/dot"));

var _add = _interopRequireDefault(require("gl-vec3/add"));

var _subtract = _interopRequireDefault(require("gl-vec3/subtract"));

var _cross = _interopRequireDefault(require("gl-vec3/cross"));

var _copy = _interopRequireDefault(require("gl-vec3/copy"));

var _length = _interopRequireDefault(require("gl-vec3/length"));

var _scale = _interopRequireDefault(require("gl-vec3/scale"));

var _scaleAndAdd = _interopRequireDefault(require("gl-vec3/scaleAndAdd"));

var _normalize = _interopRequireDefault(require("gl-vec3/normalize"));

var _HalfEdge = _interopRequireDefault(require("./HalfEdge"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var debug = require('debug')('face');

var VISIBLE = 0;
exports.VISIBLE = VISIBLE;
var NON_CONVEX = 1;
exports.NON_CONVEX = NON_CONVEX;
var DELETED = 2;
exports.DELETED = DELETED;

var Face = /*#__PURE__*/function () {
  function Face() {
    _classCallCheck(this, Face);

    this.normal = [];
    this.centroid = []; // signed distance from face to the origin

    this.offset = 0; // pointer to the a vertex in a double linked list this face can see

    this.outside = null;
    this.mark = VISIBLE;
    this.edge = null;
    this.nVertices = 0;
  }

  _createClass(Face, [{
    key: "getEdge",
    value: function getEdge(i) {
      if (typeof i !== 'number') {
        throw Error('requires a number');
      }

      var it = this.edge;

      while (i > 0) {
        it = it.next;
        i -= 1;
      }

      while (i < 0) {
        it = it.prev;
        i += 1;
      }

      return it;
    }
  }, {
    key: "computeNormal",
    value: function computeNormal() {
      var e0 = this.edge;
      var e1 = e0.next;
      var e2 = e1.next;
      var v2 = (0, _subtract["default"])([], e1.head().point, e0.head().point);
      var t = [];
      var v1 = [];
      this.nVertices = 2;
      this.normal = [0, 0, 0];

      while (e2 !== e0) {
        (0, _copy["default"])(v1, v2);
        (0, _subtract["default"])(v2, e2.head().point, e0.head().point);
        (0, _add["default"])(this.normal, this.normal, (0, _cross["default"])(t, v1, v2));
        e2 = e2.next;
        this.nVertices += 1;
      }

      this.area = (0, _length["default"])(this.normal); // normalize the vector, since we've already calculated the area
      // it's cheaper to scale the vector using this quantity instead of
      // doing the same operation again

      this.normal = (0, _scale["default"])(this.normal, this.normal, 1 / this.area);
    }
  }, {
    key: "computeNormalMinArea",
    value: function computeNormalMinArea(minArea) {
      this.computeNormal();

      if (this.area < minArea) {
        // compute the normal without the longest edge
        var maxEdge;
        var maxSquaredLength = 0;
        var edge = this.edge; // find the longest edge (in length) in the chain of edges

        do {
          var lengthSquared = edge.lengthSquared();

          if (lengthSquared > maxSquaredLength) {
            maxEdge = edge;
            maxSquaredLength = lengthSquared;
          }

          edge = edge.next;
        } while (edge !== this.edge);

        var p1 = maxEdge.tail().point;
        var p2 = maxEdge.head().point;
        var maxVector = (0, _subtract["default"])([], p2, p1);
        var maxLength = Math.sqrt(maxSquaredLength); // maxVector is normalized after this operation

        (0, _scale["default"])(maxVector, maxVector, 1 / maxLength); // compute the projection of maxVector over this face normal

        var maxProjection = (0, _dot["default"])(this.normal, maxVector); // subtract the quantity maxEdge adds on the normal

        (0, _scaleAndAdd["default"])(this.normal, this.normal, maxVector, -maxProjection); // renormalize `this.normal`

        (0, _normalize["default"])(this.normal, this.normal);
      }
    }
  }, {
    key: "computeCentroid",
    value: function computeCentroid() {
      this.centroid = [0, 0, 0];
      var edge = this.edge;

      do {
        (0, _add["default"])(this.centroid, this.centroid, edge.head().point);
        edge = edge.next;
      } while (edge !== this.edge);

      (0, _scale["default"])(this.centroid, this.centroid, 1 / this.nVertices);
    }
  }, {
    key: "computeNormalAndCentroid",
    value: function computeNormalAndCentroid(minArea) {
      if (typeof minArea !== 'undefined') {
        this.computeNormalMinArea(minArea);
      } else {
        this.computeNormal();
      }

      this.computeCentroid();
      this.offset = (0, _dot["default"])(this.normal, this.centroid);
    }
  }, {
    key: "distanceToPlane",
    value: function distanceToPlane(point) {
      return (0, _dot["default"])(this.normal, point) - this.offset;
    }
    /**
     * @private
     *
     * Connects two edges assuming that prev.head().point === next.tail().point
     *
     * @param {HalfEdge} prev
     * @param {HalfEdge} next
     */

  }, {
    key: "connectHalfEdges",
    value: function connectHalfEdges(prev, next) {
      var discardedFace;

      if (prev.opposite.face === next.opposite.face) {
        // `prev` is remove a redundant edge
        var oppositeFace = next.opposite.face;
        var oppositeEdge;

        if (prev === this.edge) {
          this.edge = next;
        }

        if (oppositeFace.nVertices === 3) {
          // case:
          // remove the face on the right
          //
          //       /|\
          //      / | \ the face on the right
          //     /  |  \ --> opposite edge
          //    / a |   \
          //   *----*----*
          //  /     b  |  \
          //           ▾
          //      redundant edge
          //
          // Note: the opposite edge is actually in the face to the right
          // of the face to be destroyed
          oppositeEdge = next.opposite.prev.opposite;
          oppositeFace.mark = DELETED;
          discardedFace = oppositeFace;
        } else {
          // case:
          //          t
          //        *----
          //       /| <- right face's redundant edge
          //      / | opposite edge
          //     /  |  ▴   /
          //    / a |  |  /
          //   *----*----*
          //  /     b  |  \
          //           ▾
          //      redundant edge
          oppositeEdge = next.opposite.next; // make sure that the link `oppositeFace.edge` points correctly even
          // after the right face redundant edge is removed

          if (oppositeFace.edge === oppositeEdge.prev) {
            oppositeFace.edge = oppositeEdge;
          } //       /|   /
          //      / | t/opposite edge
          //     /  | / ▴  /
          //    / a |/  | /
          //   *----*----*
          //  /     b     \


          oppositeEdge.prev = oppositeEdge.prev.prev;
          oppositeEdge.prev.next = oppositeEdge;
        } //       /|
        //      / |
        //     /  |
        //    / a |
        //   *----*----*
        //  /     b  ▴  \
        //           |
        //     redundant edge


        next.prev = prev.prev;
        next.prev.next = next; //       / \  \
        //      /   \->\
        //     /     \<-\ opposite edge
        //    / a     \  \
        //   *----*----*
        //  /     b  ^  \

        next.setOpposite(oppositeEdge);
        oppositeFace.computeNormalAndCentroid();
      } else {
        // trivial case
        //        *
        //       /|\
        //      / | \
        //     /  |--> next
        //    / a |   \
        //   *----*----*
        //    \ b |   /
        //     \  |--> prev
        //      \ | /
        //       \|/
        //        *
        prev.next = next;
        next.prev = prev;
      }

      return discardedFace;
    }
  }, {
    key: "mergeAdjacentFaces",
    value: function mergeAdjacentFaces(adjacentEdge, discardedFaces) {
      var oppositeEdge = adjacentEdge.opposite;
      var oppositeFace = oppositeEdge.face;
      discardedFaces.push(oppositeFace);
      oppositeFace.mark = DELETED; // find the chain of edges whose opposite face is `oppositeFace`
      //
      //                ===>
      //      \         face         /
      //       * ---- * ---- * ---- *
      //      /     opposite face    \
      //                <===
      //

      var adjacentEdgePrev = adjacentEdge.prev;
      var adjacentEdgeNext = adjacentEdge.next;
      var oppositeEdgePrev = oppositeEdge.prev;
      var oppositeEdgeNext = oppositeEdge.next; // left edge

      while (adjacentEdgePrev.opposite.face === oppositeFace) {
        adjacentEdgePrev = adjacentEdgePrev.prev;
        oppositeEdgeNext = oppositeEdgeNext.next;
      } // right edge


      while (adjacentEdgeNext.opposite.face === oppositeFace) {
        adjacentEdgeNext = adjacentEdgeNext.next;
        oppositeEdgePrev = oppositeEdgePrev.prev;
      } // adjacentEdgePrev  \         face         / adjacentEdgeNext
      //                    * ---- * ---- * ---- *
      // oppositeEdgeNext  /     opposite face    \ oppositeEdgePrev
      // fix the face reference of all the opposite edges that are not part of
      // the edges whose opposite face is not `face` i.e. all the edges that
      // `face` and `oppositeFace` do not have in common


      var edge;

      for (edge = oppositeEdgeNext; edge !== oppositeEdgePrev.next; edge = edge.next) {
        edge.face = this;
      } // make sure that `face.edge` is not one of the edges to be destroyed
      // Note: it's important for it to be a `next` edge since `prev` edges
      // might be destroyed on `connectHalfEdges`


      this.edge = adjacentEdgeNext; // connect the extremes
      // Note: it might be possible that after connecting the edges a triangular
      // face might be redundant

      var discardedFace;
      discardedFace = this.connectHalfEdges(oppositeEdgePrev, adjacentEdgeNext);

      if (discardedFace) {
        discardedFaces.push(discardedFace);
      }

      discardedFace = this.connectHalfEdges(adjacentEdgePrev, oppositeEdgeNext);

      if (discardedFace) {
        discardedFaces.push(discardedFace);
      }

      this.computeNormalAndCentroid(); // TODO: additional consistency checks

      return discardedFaces;
    }
  }, {
    key: "collectIndices",
    value: function collectIndices() {
      var indices = [];
      var edge = this.edge;

      do {
        indices.push(edge.head().index);
        edge = edge.next;
      } while (edge !== this.edge);

      return indices;
    }
  }], [{
    key: "createTriangle",
    value: function createTriangle(v0, v1, v2) {
      var minArea = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var face = new Face();
      var e0 = new _HalfEdge["default"](v0, face);
      var e1 = new _HalfEdge["default"](v1, face);
      var e2 = new _HalfEdge["default"](v2, face); // join edges

      e0.next = e2.prev = e1;
      e1.next = e0.prev = e2;
      e2.next = e1.prev = e0; // main half edge reference

      face.edge = e0;
      face.computeNormalAndCentroid(minArea);

      if (debug.enabled) {
        debug('face created %j', face.collectIndices());
      }

      return face;
    }
  }]);

  return Face;
}();

exports["default"] = Face;
},{"./HalfEdge":18,"debug":23,"gl-vec3/add":3,"gl-vec3/copy":4,"gl-vec3/cross":5,"gl-vec3/dot":7,"gl-vec3/length":8,"gl-vec3/normalize":9,"gl-vec3/scale":10,"gl-vec3/scaleAndAdd":11,"gl-vec3/subtract":14}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _distance = _interopRequireDefault(require("gl-vec3/distance"));

var _squaredDistance = _interopRequireDefault(require("gl-vec3/squaredDistance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var debug = require('debug')('halfedge');

var HalfEdge = /*#__PURE__*/function () {
  function HalfEdge(vertex, face) {
    _classCallCheck(this, HalfEdge);

    this.vertex = vertex;
    this.face = face;
    this.next = null;
    this.prev = null;
    this.opposite = null;
  }

  _createClass(HalfEdge, [{
    key: "head",
    value: function head() {
      return this.vertex;
    }
  }, {
    key: "tail",
    value: function tail() {
      return this.prev ? this.prev.vertex : null;
    }
  }, {
    key: "length",
    value: function length() {
      if (this.tail()) {
        return (0, _distance["default"])(this.tail().point, this.head().point);
      }

      return -1;
    }
  }, {
    key: "lengthSquared",
    value: function lengthSquared() {
      if (this.tail()) {
        return (0, _squaredDistance["default"])(this.tail().point, this.head().point);
      }

      return -1;
    }
  }, {
    key: "setOpposite",
    value: function setOpposite(edge) {
      var me = this;

      if (debug.enabled) {
        debug("opposite ".concat(me.tail().index, " <--> ").concat(me.head().index, " between ").concat(me.face.collectIndices(), ", ").concat(edge.face.collectIndices()));
      }

      this.opposite = edge;
      edge.opposite = this;
    }
  }]);

  return HalfEdge;
}();

exports["default"] = HalfEdge;
},{"debug":23,"gl-vec3/distance":6,"gl-vec3/squaredDistance":12}],19:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pointLineDistance = _interopRequireDefault(require("point-line-distance"));

var _getPlaneNormal = _interopRequireDefault(require("get-plane-normal"));

var _dot = _interopRequireDefault(require("gl-vec3/dot"));

var _VertexList = _interopRequireDefault(require("./VertexList"));

var _Vertex = _interopRequireDefault(require("./Vertex"));

var _Face = _interopRequireWildcard(require("./Face"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var debug = require('debug')('quickhull'); // merge types
// non convex with respect to the large face


var MERGE_NON_CONVEX_WRT_LARGER_FACE = 1;
var MERGE_NON_CONVEX = 2;

var QuickHull = /*#__PURE__*/function () {
  function QuickHull(points) {
    _classCallCheck(this, QuickHull);

    if (!Array.isArray(points)) {
      throw TypeError('input is not a valid array');
    }

    if (points.length < 4) {
      throw Error('cannot build a simplex out of <4 points');
    }

    this.tolerance = -1; // buffers

    this.nFaces = 0;
    this.nPoints = points.length;
    this.faces = [];
    this.newFaces = []; // helpers
    //
    // let `a`, `b` be `Face` instances
    // let `v` be points wrapped as instance of `Vertex`
    //
    //     [v, v, ..., v, v, v, ...]
    //      ^             ^
    //      |             |
    //  a.outside     b.outside
    //

    this.claimed = new _VertexList["default"]();
    this.unclaimed = new _VertexList["default"](); // vertices of the hull(internal representation of points)

    this.vertices = [];

    for (var i = 0; i < points.length; i += 1) {
      this.vertices.push(new _Vertex["default"](points[i], i));
    }

    this.discardedFaces = [];
    this.vertexPointIndices = [];
  }

  _createClass(QuickHull, [{
    key: "addVertexToFace",
    value: function addVertexToFace(vertex, face) {
      vertex.face = face;

      if (!face.outside) {
        this.claimed.add(vertex);
      } else {
        this.claimed.insertBefore(face.outside, vertex);
      }

      face.outside = vertex;
    }
    /**
     * Removes `vertex` for the `claimed` list of vertices, it also makes sure
     * that the link from `face` to the first vertex it sees in `claimed` is
     * linked correctly after the removal
     *
     * @param {Vertex} vertex
     * @param {Face} face
     */

  }, {
    key: "removeVertexFromFace",
    value: function removeVertexFromFace(vertex, face) {
      if (vertex === face.outside) {
        // fix face.outside link
        if (vertex.next && vertex.next.face === face) {
          // face has at least 2 outside vertices, move the `outside` reference
          face.outside = vertex.next;
        } else {
          // vertex was the only outside vertex that face had
          face.outside = null;
        }
      }

      this.claimed.remove(vertex);
    }
    /**
     * Removes all the visible vertices that `face` is able to see which are
     * stored in the `claimed` vertext list
     *
     * @param {Face} face
     * @return {Vertex|undefined} If face had visible vertices returns
     * `face.outside`, otherwise undefined
     */

  }, {
    key: "removeAllVerticesFromFace",
    value: function removeAllVerticesFromFace(face) {
      if (face.outside) {
        // pointer to the last vertex of this face
        // [..., outside, ..., end, outside, ...]
        //          |           |      |
        //          a           a      b
        var end = face.outside;

        while (end.next && end.next.face === face) {
          end = end.next;
        }

        this.claimed.removeChain(face.outside, end); //                            b
        //                       [ outside, ...]
        //                            |  removes this link
        //     [ outside, ..., end ] -┘
        //          |           |
        //          a           a

        end.next = null;
        return face.outside;
      }
    }
    /**
     * Removes all the visible vertices that `face` is able to see, additionally
     * checking the following:
     *
     * If `absorbingFace` doesn't exist then all the removed vertices will be
     * added to the `unclaimed` vertex list
     *
     * If `absorbingFace` exists then this method will assign all the vertices of
     * `face` that can see `absorbingFace`, if a vertex cannot see `absorbingFace`
     * it's added to the `unclaimed` vertex list
     *
     * @param {Face} face
     * @param {Face} [absorbingFace]
     */

  }, {
    key: "deleteFaceVertices",
    value: function deleteFaceVertices(face, absorbingFace) {
      var faceVertices = this.removeAllVerticesFromFace(face);

      if (faceVertices) {
        if (!absorbingFace) {
          // mark the vertices to be reassigned to some other face
          this.unclaimed.addAll(faceVertices);
        } else {
          // if there's an absorbing face try to assign as many vertices
          // as possible to it
          // the reference `vertex.next` might be destroyed on
          // `this.addVertexToFace` (see VertexList#add), nextVertex is a
          // reference to it
          var nextVertex;

          for (var vertex = faceVertices; vertex; vertex = nextVertex) {
            nextVertex = vertex.next;
            var distance = absorbingFace.distanceToPlane(vertex.point); // check if `vertex` is able to see `absorbingFace`

            if (distance > this.tolerance) {
              this.addVertexToFace(vertex, absorbingFace);
            } else {
              this.unclaimed.add(vertex);
            }
          }
        }
      }
    }
    /**
     * Reassigns as many vertices as possible from the unclaimed list to the new
     * faces
     *
     * @param {Faces[]} newFaces
     */

  }, {
    key: "resolveUnclaimedPoints",
    value: function resolveUnclaimedPoints(newFaces) {
      // cache next vertex so that if `vertex.next` is destroyed it's still
      // recoverable
      var vertexNext = this.unclaimed.first();

      for (var vertex = vertexNext; vertex; vertex = vertexNext) {
        vertexNext = vertex.next;
        var maxDistance = this.tolerance;
        var maxFace = void 0;

        for (var i = 0; i < newFaces.length; i += 1) {
          var face = newFaces[i];

          if (face.mark === _Face.VISIBLE) {
            var dist = face.distanceToPlane(vertex.point);

            if (dist > maxDistance) {
              maxDistance = dist;
              maxFace = face;
            }

            if (maxDistance > 1000 * this.tolerance) {
              break;
            }
          }
        }

        if (maxFace) {
          this.addVertexToFace(vertex, maxFace);
        }
      }
    }
    /**
     * Computes the extremes of a tetrahedron which will be the initial hull
     *
     * @return {number[]} The min/max vertices in the x,y,z directions
     */

  }, {
    key: "computeExtremes",
    value: function computeExtremes() {
      var me = this;
      var min = [];
      var max = []; // min vertex on the x,y,z directions

      var minVertices = []; // max vertex on the x,y,z directions

      var maxVertices = [];
      var i, j; // initially assume that the first vertex is the min/max

      for (i = 0; i < 3; i += 1) {
        minVertices[i] = maxVertices[i] = this.vertices[0];
      } // copy the coordinates of the first vertex to min/max


      for (i = 0; i < 3; i += 1) {
        min[i] = max[i] = this.vertices[0].point[i];
      } // compute the min/max vertex on all 6 directions


      for (i = 1; i < this.vertices.length; i += 1) {
        var vertex = this.vertices[i];
        var point = vertex.point; // update the min coordinates

        for (j = 0; j < 3; j += 1) {
          if (point[j] < min[j]) {
            min[j] = point[j];
            minVertices[j] = vertex;
          }
        } // update the max coordinates


        for (j = 0; j < 3; j += 1) {
          if (point[j] > max[j]) {
            max[j] = point[j];
            maxVertices[j] = vertex;
          }
        }
      } // compute epsilon


      this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(min[0]), Math.abs(max[0])) + Math.max(Math.abs(min[1]), Math.abs(max[1])) + Math.max(Math.abs(min[2]), Math.abs(max[2])));

      if (debug.enabled) {
        debug('tolerance %d', me.tolerance);
      }

      return [minVertices, maxVertices];
    }
    /**
     * Compues the initial tetrahedron assigning to its faces all the points that
     * are candidates to form part of the hull
     */

  }, {
    key: "createInitialSimplex",
    value: function createInitialSimplex() {
      var vertices = this.vertices;

      var _this$computeExtremes = this.computeExtremes(),
          _this$computeExtremes2 = _slicedToArray(_this$computeExtremes, 2),
          min = _this$computeExtremes2[0],
          max = _this$computeExtremes2[1];

      var i, j; // Find the two vertices with the greatest 1d separation
      // (max.x - min.x)
      // (max.y - min.y)
      // (max.z - min.z)

      var maxDistance = 0;
      var indexMax = 0;

      for (i = 0; i < 3; i += 1) {
        var distance = max[i].point[i] - min[i].point[i];

        if (distance > maxDistance) {
          maxDistance = distance;
          indexMax = i;
        }
      }

      var v0 = min[indexMax];
      var v1 = max[indexMax];
      var v2, v3; // the next vertex is the one farthest to the line formed by `v0` and `v1`

      maxDistance = 0;

      for (i = 0; i < this.vertices.length; i += 1) {
        var vertex = this.vertices[i];

        if (vertex !== v0 && vertex !== v1) {
          var _distance = (0, _pointLineDistance["default"])(vertex.point, v0.point, v1.point);

          if (_distance > maxDistance) {
            maxDistance = _distance;
            v2 = vertex;
          }
        }
      } // the next vertes is the one farthest to the plane `v0`, `v1`, `v2`
      // normalize((v2 - v1) x (v0 - v1))


      var normal = (0, _getPlaneNormal["default"])([], v0.point, v1.point, v2.point); // distance from the origin to the plane

      var distPO = (0, _dot["default"])(v0.point, normal);
      maxDistance = -1;

      for (i = 0; i < this.vertices.length; i += 1) {
        var _vertex = this.vertices[i];

        if (_vertex !== v0 && _vertex !== v1 && _vertex !== v2) {
          var _distance2 = Math.abs((0, _dot["default"])(normal, _vertex.point) - distPO);

          if (_distance2 > maxDistance) {
            maxDistance = _distance2;
            v3 = _vertex;
          }
        }
      } // initial simplex
      // Taken from http://everything2.com/title/How+to+paint+a+tetrahedron
      //
      //                              v2
      //                             ,|,
      //                           ,7``\'VA,
      //                         ,7`   |, `'VA,
      //                       ,7`     `\    `'VA,
      //                     ,7`        |,      `'VA,
      //                   ,7`          `\         `'VA,
      //                 ,7`             |,           `'VA,
      //               ,7`               `\       ,..ooOOTK` v3
      //             ,7`                  |,.ooOOT''`    AV
      //           ,7`            ,..ooOOT`\`           /7
      //         ,7`      ,..ooOOT''`      |,          AV
      //        ,T,..ooOOT''`              `\         /7
      //     v0 `'TTs.,                     |,       AV
      //            `'TTs.,                 `\      /7
      //                 `'TTs.,             |,    AV
      //                      `'TTs.,        `\   /7
      //                           `'TTs.,    |, AV
      //                                `'TTs.,\/7
      //                                     `'T`
      //                                       v1
      //


      var faces = [];

      if ((0, _dot["default"])(v3.point, normal) - distPO < 0) {
        // the face is not able to see the point so `planeNormal`
        // is pointing outside the tetrahedron
        faces.push(_Face["default"].createTriangle(v0, v1, v2), _Face["default"].createTriangle(v3, v1, v0), _Face["default"].createTriangle(v3, v2, v1), _Face["default"].createTriangle(v3, v0, v2)); // set the opposite edge

        for (i = 0; i < 3; i += 1) {
          var _j = (i + 1) % 3; // join face[i] i > 0, with the first face


          faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge(_j)); // join face[i] with face[i + 1], 1 <= i <= 3

          faces[i + 1].getEdge(1).setOpposite(faces[_j + 1].getEdge(0));
        }
      } else {
        // the face is able to see the point so `planeNormal`
        // is pointing inside the tetrahedron
        faces.push(_Face["default"].createTriangle(v0, v2, v1), _Face["default"].createTriangle(v3, v0, v1), _Face["default"].createTriangle(v3, v1, v2), _Face["default"].createTriangle(v3, v2, v0)); // set the opposite edge

        for (i = 0; i < 3; i += 1) {
          var _j2 = (i + 1) % 3; // join face[i] i > 0, with the first face


          faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge((3 - i) % 3)); // join face[i] with face[i + 1]

          faces[i + 1].getEdge(0).setOpposite(faces[_j2 + 1].getEdge(1));
        }
      } // the initial hull is the tetrahedron


      for (i = 0; i < 4; i += 1) {
        this.faces.push(faces[i]);
      } // initial assignment of vertices to the faces of the tetrahedron


      for (i = 0; i < vertices.length; i += 1) {
        var _vertex2 = vertices[i];

        if (_vertex2 !== v0 && _vertex2 !== v1 && _vertex2 !== v2 && _vertex2 !== v3) {
          maxDistance = this.tolerance;
          var maxFace = void 0;

          for (j = 0; j < 4; j += 1) {
            var _distance3 = faces[j].distanceToPlane(_vertex2.point);

            if (_distance3 > maxDistance) {
              maxDistance = _distance3;
              maxFace = faces[j];
            }
          }

          if (maxFace) {
            this.addVertexToFace(_vertex2, maxFace);
          }
        }
      }
    }
  }, {
    key: "reindexFaceAndVertices",
    value: function reindexFaceAndVertices() {
      // remove inactive faces
      var activeFaces = [];

      for (var i = 0; i < this.faces.length; i += 1) {
        var face = this.faces[i];

        if (face.mark === _Face.VISIBLE) {
          activeFaces.push(face);
        }
      }

      this.faces = activeFaces;
    }
  }, {
    key: "collectFaces",
    value: function collectFaces(skipTriangulation) {
      var faceIndices = [];

      for (var i = 0; i < this.faces.length; i += 1) {
        if (this.faces[i].mark !== _Face.VISIBLE) {
          throw Error('attempt to include a destroyed face in the hull');
        }

        var indices = this.faces[i].collectIndices();

        if (skipTriangulation) {
          faceIndices.push(indices);
        } else {
          for (var j = 0; j < indices.length - 2; j += 1) {
            faceIndices.push([indices[0], indices[j + 1], indices[j + 2]]);
          }
        }
      }

      return faceIndices;
    }
    /**
     * Finds the next vertex to make faces with the current hull
     *
     * - let `face` be the first face existing in the `claimed` vertex list
     *  - if `face` doesn't exist then return since there're no vertices left
     *  - otherwise for each `vertex` that face sees find the one furthest away
     *  from `face`
     *
     * @return {Vertex|undefined} Returns undefined when there're no more
     * visible vertices
     */

  }, {
    key: "nextVertexToAdd",
    value: function nextVertexToAdd() {
      if (!this.claimed.isEmpty()) {
        var eyeVertex, vertex;
        var maxDistance = 0;
        var eyeFace = this.claimed.first().face;

        for (vertex = eyeFace.outside; vertex && vertex.face === eyeFace; vertex = vertex.next) {
          var distance = eyeFace.distanceToPlane(vertex.point);

          if (distance > maxDistance) {
            maxDistance = distance;
            eyeVertex = vertex;
          }
        }

        return eyeVertex;
      }
    }
    /**
     * Computes a chain of half edges in ccw order called the `horizon`, for an
     * edge to be part of the horizon it must join a face that can see
     * `eyePoint` and a face that cannot see `eyePoint`
     *
     * @param {number[]} eyePoint - The coordinates of a point
     * @param {HalfEdge} crossEdge - The edge used to jump to the current `face`
     * @param {Face} face - The current face being tested
     * @param {HalfEdge[]} horizon - The edges that form part of the horizon in
     * ccw order
     */

  }, {
    key: "computeHorizon",
    value: function computeHorizon(eyePoint, crossEdge, face, horizon) {
      // moves face's vertices to the `unclaimed` vertex list
      this.deleteFaceVertices(face);
      face.mark = _Face.DELETED;
      var edge;

      if (!crossEdge) {
        edge = crossEdge = face.getEdge(0);
      } else {
        // start from the next edge since `crossEdge` was already analyzed
        // (actually `crossEdge.opposite` was the face who called this method
        // recursively)
        edge = crossEdge.next;
      } // All the faces that are able to see `eyeVertex` are defined as follows
      //
      //       v    /
      //           / <== visible face
      //          /
      //         |
      //         | <== not visible face
      //
      //  dot(v, visible face normal) - visible face offset > this.tolerance
      //


      do {
        var oppositeEdge = edge.opposite;
        var oppositeFace = oppositeEdge.face;

        if (oppositeFace.mark === _Face.VISIBLE) {
          if (oppositeFace.distanceToPlane(eyePoint) > this.tolerance) {
            this.computeHorizon(eyePoint, oppositeEdge, oppositeFace, horizon);
          } else {
            horizon.push(edge);
          }
        }

        edge = edge.next;
      } while (edge !== crossEdge);
    }
    /**
     * Creates a face with the points `eyeVertex.point`, `horizonEdge.tail` and
     * `horizonEdge.tail` in ccw order
     *
     * @param {Vertex} eyeVertex
     * @param {HalfEdge} horizonEdge
     * @return {HalfEdge} The half edge whose vertex is the eyeVertex
     */

  }, {
    key: "addAdjoiningFace",
    value: function addAdjoiningFace(eyeVertex, horizonEdge) {
      // all the half edges are created in ccw order thus the face is always
      // pointing outside the hull
      // edges:
      //
      //                  eyeVertex.point
      //                       / \
      //                      /   \
      //                  1  /     \  0
      //                    /       \
      //                   /         \
      //                  /           \
      //          horizon.tail --- horizon.head
      //                        2
      //
      var face = _Face["default"].createTriangle(eyeVertex, horizonEdge.tail(), horizonEdge.head());

      this.faces.push(face); // join face.getEdge(-1) with the horizon's opposite edge
      // face.getEdge(-1) = face.getEdge(2)

      face.getEdge(-1).setOpposite(horizonEdge.opposite);
      return face.getEdge(0);
    }
    /**
     * Adds horizon.length faces to the hull, each face will be 'linked' with the
     * horizon opposite face and the face on the left/right
     *
     * @param {Vertex} eyeVertex
     * @param {HalfEdge[]} horizon - A chain of half edges in ccw order
     */

  }, {
    key: "addNewFaces",
    value: function addNewFaces(eyeVertex, horizon) {
      this.newFaces = [];
      var firstSideEdge, previousSideEdge;

      for (var i = 0; i < horizon.length; i += 1) {
        var horizonEdge = horizon[i]; // returns the right side edge

        var sideEdge = this.addAdjoiningFace(eyeVertex, horizonEdge);

        if (!firstSideEdge) {
          firstSideEdge = sideEdge;
        } else {
          // joins face.getEdge(1) with previousFace.getEdge(0)
          sideEdge.next.setOpposite(previousSideEdge);
        }

        this.newFaces.push(sideEdge.face);
        previousSideEdge = sideEdge;
      }

      firstSideEdge.next.setOpposite(previousSideEdge);
    }
    /**
     * Computes the distance from `edge` opposite face's centroid to
     * `edge.face`
     *
     * @param {HalfEdge} edge
     * @return {number}
     * - A positive number when the centroid of the opposite face is above the
     *   face i.e. when the faces are concave
     * - A negative number when the centroid of the opposite face is below the
     *   face i.e. when the faces are convex
     */

  }, {
    key: "oppositeFaceDistance",
    value: function oppositeFaceDistance(edge) {
      return edge.face.distanceToPlane(edge.opposite.face.centroid);
    }
    /**
     * Merges a face with none/any/all its neighbors according to the strategy
     * used
     *
     * if `mergeType` is MERGE_NON_CONVEX_WRT_LARGER_FACE then the merge will be
     * decided based on the face with the larger area, the centroid of the face
     * with the smaller area will be checked against the one with the larger area
     * to see if it's in the merge range [tolerance, -tolerance] i.e.
     *
     *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
     *
     * Note that the first check (with +tolerance) was done on `computeHorizon`
     *
     * If the above is not true then the check is done with respect to the smaller
     * face i.e.
     *
     *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
     *
     * If true then it means that two faces are non convex (concave), even if the
     * dot(...) - offset value is > 0 (that's the point of doing the merge in the
     * first place)
     *
     * If two faces are concave then the check must also be done on the other face
     * but this is done in another merge pass, for this to happen the face is
     * marked in a temporal NON_CONVEX state
     *
     * if `mergeType` is MERGE_NON_CONVEX then two faces will be merged only if
     * they pass the following conditions
     *
     *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
     *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
     *
     * @param {Face} face
     * @param {number} mergeType - Either MERGE_NON_CONVEX_WRT_LARGER_FACE or
     * MERGE_NON_CONVEX
     */

  }, {
    key: "doAdjacentMerge",
    value: function doAdjacentMerge(face, mergeType) {
      var edge = face.edge;
      var convex = true;
      var it = 0;

      do {
        if (it >= face.nVertices) {
          throw Error('merge recursion limit exceeded');
        }

        var oppositeFace = edge.opposite.face;
        var merge = false; // Important notes about the algorithm to merge faces
        //
        // - Given a vertex `eyeVertex` that will be added to the hull
        //   all the faces that cannot see `eyeVertex` are defined as follows
        //
        //      dot(v, not visible face normal) - not visible offset < tolerance
        //
        // - Two faces can be merged when the centroid of one of these faces
        // projected to the normal of the other face minus the other face offset
        // is in the range [tolerance, -tolerance]
        // - Since `face` (given in the input for this method) has passed the
        // check above we only have to check the lower bound e.g.
        //
        //      dot(v, not visible face normal) - not visible offset > -tolerance
        //

        if (mergeType === MERGE_NON_CONVEX) {
          if (this.oppositeFaceDistance(edge) > -this.tolerance || this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
            merge = true;
          }
        } else {
          if (face.area > oppositeFace.area) {
            if (this.oppositeFaceDistance(edge) > -this.tolerance) {
              merge = true;
            } else if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
              convex = false;
            }
          } else {
            if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
              merge = true;
            } else if (this.oppositeFaceDistance(edge) > -this.tolerance) {
              convex = false;
            }
          }
        }

        if (merge) {
          debug('face merge'); // when two faces are merged it might be possible that redundant faces
          // are destroyed, in that case move all the visible vertices from the
          // destroyed faces to the `unclaimed` vertex list

          var discardedFaces = face.mergeAdjacentFaces(edge, []);

          for (var i = 0; i < discardedFaces.length; i += 1) {
            this.deleteFaceVertices(discardedFaces[i], face);
          }

          return true;
        }

        edge = edge.next;
        it += 1;
      } while (edge !== face.edge);

      if (!convex) {
        face.mark = _Face.NON_CONVEX;
      }

      return false;
    }
    /**
     * Adds a vertex to the hull with the following algorithm
     *
     * - Compute the `horizon` which is a chain of half edges, for an edge to
     *   belong to this group it must be the edge connecting a face that can
     *   see `eyeVertex` and a face which cannot see `eyeVertex`
     * - All the faces that can see `eyeVertex` have its visible vertices removed
     *   from the claimed VertexList
     * - A new set of faces is created with each edge of the `horizon` and
     *   `eyeVertex`, each face is connected with the opposite horizon face and
     *   the face on the left/right
     * - The new faces are merged if possible with the opposite horizon face first
     *   and then the faces on the right/left
     * - The vertices removed from all the visible faces are assigned to the new
     *   faces if possible
     *
     * @param {Vertex} eyeVertex
     */

  }, {
    key: "addVertexToHull",
    value: function addVertexToHull(eyeVertex) {
      var horizon = [];
      this.unclaimed.clear(); // remove `eyeVertex` from `eyeVertex.face` so that it can't be added to the
      // `unclaimed` vertex list

      this.removeVertexFromFace(eyeVertex, eyeVertex.face);
      this.computeHorizon(eyeVertex.point, null, eyeVertex.face, horizon);

      if (debug.enabled) {
        debug('horizon %j', horizon.map(function (edge) {
          return edge.head().index;
        }));
      }

      this.addNewFaces(eyeVertex, horizon);
      debug('first merge'); // first merge pass
      // Do the merge with respect to the larger face

      for (var i = 0; i < this.newFaces.length; i += 1) {
        var face = this.newFaces[i];

        if (face.mark === _Face.VISIBLE) {
          // eslint-disable-next-line
          while (this.doAdjacentMerge(face, MERGE_NON_CONVEX_WRT_LARGER_FACE)) {}
        }
      }

      debug('second merge'); // second merge pass
      // Do the merge on non convex faces (a face is marked as non convex in the
      // first pass)

      for (var _i2 = 0; _i2 < this.newFaces.length; _i2 += 1) {
        var _face = this.newFaces[_i2];

        if (_face.mark === _Face.NON_CONVEX) {
          _face.mark = _Face.VISIBLE; // eslint-disable-next-line

          while (this.doAdjacentMerge(_face, MERGE_NON_CONVEX)) {}
        }
      }

      debug('reassigning points to newFaces'); // reassign `unclaimed` vertices to the new faces

      this.resolveUnclaimedPoints(this.newFaces);
    }
  }, {
    key: "build",
    value: function build() {
      var iterations = 0;
      var eyeVertex;
      this.createInitialSimplex();

      while (eyeVertex = this.nextVertexToAdd()) {
        iterations += 1;
        debug('== iteration %j ==', iterations);
        debug('next vertex to add = %d %j', eyeVertex.index, eyeVertex.point);
        this.addVertexToHull(eyeVertex);
        debug('end');
      }

      this.reindexFaceAndVertices();
    }
  }]);

  return QuickHull;
}();

exports["default"] = QuickHull;
},{"./Face":17,"./Vertex":20,"./VertexList":21,"debug":23,"get-plane-normal":2,"gl-vec3/dot":7,"point-line-distance":15}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vertex = /*#__PURE__*/_createClass(function Vertex(point, index) {
  _classCallCheck(this, Vertex);

  this.point = point; // index in the input array

  this.index = index; // vertex is a double linked list node

  this.next = null;
  this.prev = null; // the face that is able to see this point

  this.face = null;
});

exports["default"] = Vertex;
},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var VertexList = /*#__PURE__*/function () {
  function VertexList() {
    _classCallCheck(this, VertexList);

    this.head = null;
    this.tail = null;
  }

  _createClass(VertexList, [{
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
    }
    /**
     * Inserts a `node` before `target`, it's assumed that
     * `target` belongs to this doubly linked list
     *
     * @param {*} target
     * @param {*} node
     */

  }, {
    key: "insertBefore",
    value: function insertBefore(target, node) {
      node.prev = target.prev;
      node.next = target;

      if (!node.prev) {
        this.head = node;
      } else {
        node.prev.next = node;
      }

      target.prev = node;
    }
    /**
     * Inserts a `node` after `target`, it's assumed that
     * `target` belongs to this doubly linked list
     *
     * @param {Vertex} target
     * @param {Vertex} node
     */

  }, {
    key: "insertAfter",
    value: function insertAfter(target, node) {
      node.prev = target;
      node.next = target.next;

      if (!node.next) {
        this.tail = node;
      } else {
        node.next.prev = node;
      }

      target.next = node;
    }
    /**
     * Appends a `node` to the end of this doubly linked list
     * Note: `node.next` will be unlinked from `node`
     * Note: if `node` is part of another linked list call `addAll` instead
     *
     * @param {*} node
     */

  }, {
    key: "add",
    value: function add(node) {
      if (!this.head) {
        this.head = node;
      } else {
        this.tail.next = node;
      }

      node.prev = this.tail; // since node is the new end it doesn't have a next node

      node.next = null;
      this.tail = node;
    }
    /**
     * Appends a chain of nodes where `node` is the head,
     * the difference with `add` is that it correctly sets the position
     * of the node list `tail` property
     *
     * @param {*} node
     */

  }, {
    key: "addAll",
    value: function addAll(node) {
      if (!this.head) {
        this.head = node;
      } else {
        this.tail.next = node;
      }

      node.prev = this.tail; // find the end of the list

      while (node.next) {
        node = node.next;
      }

      this.tail = node;
    }
    /**
     * Deletes a `node` from this linked list, it's assumed that `node` is a
     * member of this linked list
     *
     * @param {*} node
     */

  }, {
    key: "remove",
    value: function remove(node) {
      if (!node.prev) {
        this.head = node.next;
      } else {
        node.prev.next = node.next;
      }

      if (!node.next) {
        this.tail = node.prev;
      } else {
        node.next.prev = node.prev;
      }
    }
    /**
     * Removes a chain of nodes whose head is `a` and whose tail is `b`,
     * it's assumed that `a` and `b` belong to this list and also that `a`
     * comes before `b` in the linked list
     *
     * @param {*} a
     * @param {*} b
     */

  }, {
    key: "removeChain",
    value: function removeChain(a, b) {
      if (!a.prev) {
        this.head = b.next;
      } else {
        a.prev.next = b.next;
      }

      if (!b.next) {
        this.tail = a.prev;
      } else {
        b.next.prev = a.prev;
      }
    }
  }, {
    key: "first",
    value: function first() {
      return this.head;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return !this.head;
    }
  }]);

  return VertexList;
}();

exports["default"] = VertexList;
},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = runner;
exports.isPointInsideHull = isPointInsideHull;

var _QuickHull = _interopRequireDefault(require("./QuickHull"));

var _getPlaneNormal = _interopRequireDefault(require("get-plane-normal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function runner(points) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var instance = new _QuickHull["default"](points);
  instance.build();
  return instance.collectFaces(options.skipTriangulation);
}
/**
 * Checks if a point is inside the convex hull.
 *
 * @param {Array<number>} point - The point to check.
 * @param {Array<Array<number>>} points - The points used in the space where the
 * convex hull is defined.
 * @param {Array<Array<number>>} faces - The faces of the convex hull.
 */


function isPointInsideHull(point, points, faces) {
  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var a = points[face[0]];
    var b = points[face[1]];
    var c = points[face[2]]; // Algorithm:
    // 1. Get the normal of the face.
    // 2. Get the vector from the point to the first vertex of the face.
    // 3. Calculate the dot product of the normal and the vector.
    // 4. If the dot product is positive, the point is outside the face.

    var planeNormal = (0, _getPlaneNormal["default"])([], a, b, c); // Get the point

    var pointAbsA = [point[0] - a[0], point[1] - a[1], point[2] - a[2]];
    var dotProduct = planeNormal[0] * pointAbsA[0] + planeNormal[1] * pointAbsA[1] + planeNormal[2] * pointAbsA[2];

    if (dotProduct > 0) {
      return false;
    }
  }

  return true;
}
},{"./QuickHull":19,"get-plane-normal":2}],23:[function(require,module,exports){
(function (process){(function (){
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};

}).call(this)}).call(this,require('_process'))
},{"./common":24,"_process":1}],24:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = require('ms');
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;

},{"ms":25}],25:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}]},{},[22]);
