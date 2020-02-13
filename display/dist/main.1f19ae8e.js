// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.js":[function(require,module,exports) {
var FORMAT_HIERARCHY = ['.m4a', '.mp3', '.opus', '.ape', '.wav', '.flac']; // rank your own formats here, i prefer it that way. Sue me (please don't)

var STRING_SORTS = ["artist", "album", "title"]; // attributes that are sorted using the method provided with strings
// format values for sorting and display
// these are upper limits

var FORMAT_LOW = FORMAT_HIERARCHY.indexOf('.opus'); // "low value" format. shows up in red. for me, everything lossy

var FORMAT_MEDIUM = FORMAT_HIERARCHY.indexOf('.wav'); // "median value" formet. show up in orange. for me, everything lossless that isn't flac
// everything above that, ie flac will show up in green
// bitrate values for sorting and display
// these are upper limits

var BITRATE_LOW = 192; // "low value" bitrate. shows up in red. set at 192 because that is supposed to be "transaprent" starting there

var BITRATE_MEDIUM = 320; // "medium value" bitrate, shows up in orange. set at 320 because that is the usual upper limit for mp3
// color codes for the low, medium and high values (name of the css classes)

var COLOR_LOW = "red";
var COLOR_MEDIUM = "orange";
var COLOR_HIGH = "green";
document.getElementById('parse').addEventListener("click", function () {
  init();
}); // when the button is clicked, start running the spaghetti code

/**
 * Get the content of the textbox that receives the json string, hide the box and rename the button
 * calls the sort function
 */

function init() {
  // hiding the textbox
  document.getElementById('library-data').style.display = "none"; //changing the name of the button

  document.getElementById('parse').innerHTML = "re-parse";
  raw = document.getElementById('library-data').value.trim();
  parsed = JSON.parse(raw).songs;
  sortSongs(parsed);
}
/**
 * Get the value of the two selects to generate a sort function using sortMaker()
 * calls the display fonction
 * @param songs : unsorted song array from init()
 */


function sortSongs(songs) {
  var type = document.getElementById('sortType').value;
  var order = document.getElementById('sortOrder').value == "desc" ? true : false;
  var sorter = sortMaker(type, order);
  compute(songs.sort(sorter));
}
/**
 * display the songs in an html table in the appropriate div in the DOM
 * @param songs
 */


function compute(songs) {
  var out = document.getElementById('output'); // DOM element that will receive the table

  acc = "<table><tr><th>Artist</th><th>Album</th><th>Title</th><th>Bitrate</th><th>Format</th></tr>"; // header of the table

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = songs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var song = _step.value;
      acc += line(song); // call the function that generates a table line for the song
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  out.innerHTML = acc + "</table>"; // close the table tag
}
/**
 * given a single song objects, return a table line with it's properties
 * @param song : the song object
 * @returns {string}
 */


function line(song) {
  var bitrateColor = bitColor(song.kbps); // get the appropriate class name for the value of the bitrate

  var formatColor = forColor(song.format); // same thing for the format
  // this is defined here to make rearranging columns around easier

  var artist = "<tr><td>".concat(song.artist, "</td>"); // artist part of the line

  var title = "<td>".concat(song.album, "</td><td>").concat(song.title, "</td>"); // title part of the line

  var bitrate = "<td class=\"".concat(bitrateColor, "\">").concat(song.kbps, "</td>"); // bitrate part of the line

  var format = "<td class=\"".concat(formatColor, "\">").concat(song.format, "</td></tr>"); // format part of the line

  return artist + title + bitrate + format;
}
/**
 * return the appropriate color constant given a certain bitrate
 * @param bitrate
 * @returns {string}
 */


function bitColor(bitrate) {
  if (bitrate <= BITRATE_LOW) {
    return COLOR_LOW;
  } else if (bitrate <= BITRATE_MEDIUM) {
    return COLOR_MEDIUM;
  } else {
    return COLOR_HIGH;
  }
}
/**
 * return the appropriate color constant for a given format
 * @param format
 * @returns {string}
 */


function forColor(format) {
  var score = FORMAT_HIERARCHY.indexOf(format); // the formats "value" is determined by it's place in the FORMATS_HIERARCHY constant, with the worst being an unknowwn / unsupported format

  if (score <= FORMAT_LOW) {
    return COLOR_LOW;
  } else if (score <= FORMAT_MEDIUM) {
    return COLOR_MEDIUM;
  } else {
    return COLOR_HIGH;
  }
}
/**
 * Higher order function to return a function that will be used to sort the array
 * these sort functions take two objects as parameter and return an integer.
 * @param type : what attribute are we sorting after
 * @param inv : when true : sorted in descending order. otherwise sorted by ascending order
 * @returns {(function(...[*]=))|(function(*, *): number)|(function(*, *): number)}
 */


function sortMaker(type) {
  var inv = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var mod = inv ? -1 : 1; // to determine wether to sort by ascending or descending order, it is easier to multiply the result by 1 (default, ascending order) or -1 (descending order)

  if (STRING_SORTS.indexOf(type) != -1) {
    // if we sort by one of the types that requires sorting by a string
    return function (a, b) {
      return a[type].localeCompare(b[type]) * mod;
    }; // using the function with the same purpose built into the String type
  } else if (type == "format") {
    // if we sort by format
    return function (a, b) {
      // get the score for both the compared objects
      var rankA = FORMAT_HIERARCHY.indexOf(a.format);
      var rankB = FORMAT_HIERARCHY.indexOf(b.format);

      if (rankA < rankB) {
        return -1 * mod;
      } else if (rankA > rankB) {
        return 1 * mod;
      } else {
        return 0;
      }
    };
  } else {
    // all the above only leave the bitrate as sorting option
    return function (a, b) {
      return (a.kbps - b.kbps) * mod;
    }; // no need to get fancy, substracting the two bitrates works just fine
  }
}
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "37053" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map