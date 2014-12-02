/**
 * Created by Shaun on 5/1/14.
 */

var kilo = (function(id) {
  'use strict';

  var core, Util, Injector, appConfig = {}, gids = {}, allElements, previousOwner = undefined;
  var CONSOLE_ID = id;

  Util = {
    isDefined: function(value) { return (typeof value !== 'undefined'); },
    //isObject: function(value) { return (value !== null && typeof value === 'object'); },
    isBoolean: function(value) { return (typeof value === 'boolean'); },
    def: function(value, defaultValue) { return (typeof value === 'undefined') ? defaultValue : value; },
    error: function(message) { throw new Error(CONSOLE_ID + ': ' + message); },
    warn: function(message) { Util.log('Warning: ' + message); },
    log: function(message) { if(core.log) { console.log(CONSOLE_ID + ': ' + message); } },
    argsToArray: function(args) { return Array.prototype.slice.call(args); },
    getGID: function(prefix) {
      prefix = Util.def(prefix, '');
      gids[prefix] = Util.def(gids[prefix], 0);
      return prefix + (++gids[prefix]);
    },
    rand: function(max, min) {
      min = min || 0;
      if(min > max || max < min) { Util.error('rand: invalid range.'); }
      return Math.floor((Math.random() * (max - min + 1))) + (min);
    }
  };

  ['Array', 'Object', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'HTMLImageElement'].
    forEach(function(name) {
      Util['is' + name] = function(obj) {
        return Object.prototype.toString.call(obj) === '[object ' + name + ']';
      };
    });

  Injector = {
    unresolved: {},
    modules: {},
    register: function(key, deps, func, scope) {
      this.unresolved[key] = {deps: deps, func: func, scope: scope};
      return this;
    },
    unresolve: function(key) {
      if(this.modules[key]) {
        delete this.modules[key];
      }
    },
    setModule: function(key, module) { // save a module without doing dependency resolution
      this.modules[key] = module;
      return this;
    },
    getDependency: function(key) {
      var module = this.modules[key];
      if(module) {
        return module;
      }

      module = this.unresolved[key];
      if(!module) {
        Util.warn('Module \'' + key + '\' not found');
        return null;
      }

      Util.log('Resolving dependencies for \'' + key + '\'');
      module = this.modules[key] = this.resolveAndApply(module.deps, module.func, module.scope);
      if(Util.isObject(module)) {
        module.getType = function() { return key; };
      }
      return module;
    },
    resolve: function(deps, func, scope) {
      var dep, depName, args = [], i;
      for(i = 0; i < deps.length; i++) {
        depName = deps[i];
        dep = this.getDependency(depName);
        if(dep) {
          args.push(dep);
        } else {
          Util.warn('Can\'t resolve ' + depName);
        }
      }
      return args;
    },
    apply: function(args, func, scope) {
      return func.apply(scope || core, args);
    },
    resolveAndApply: function(deps, func, scope) {
      return this.apply(this.resolve(deps), func, scope);
    }
  };

  /** add these basic modules to the injector */
  Injector
    .setModule('helper', Util).setModule('Helper', Util).setModule('Util', Util)
    .setModule('injector', Injector).setModule('Injector', Injector)
    .setModule('appConfig', appConfig);

  /** run onReady when document readyState is 'complete' */
  function onDocumentReady(onReady) {
    var readyStateCheckInterval;
    if (document.readyState === 'complete') {
      onReady();
    } else {
      readyStateCheckInterval = setInterval(function () {
        if (document.readyState === 'complete') {
          onReady();
          clearInterval(readyStateCheckInterval);
        }
      }, 10);
    }
  }

  /** the main interface */
  core = function(keyOrDeps, depsOrFunc, funcOrScope, scope) {
    // get dependencies
    if(Util.isArray(keyOrDeps)) {
      Injector.resolveAndApply(keyOrDeps, depsOrFunc, funcOrScope);

    // register a new module (with dependencies)
    } else if(Util.isArray(depsOrFunc) && Util.isFunction(funcOrScope)) {
      Injector.register(keyOrDeps, depsOrFunc, funcOrScope, scope);

    // register a new module (without dependencies)
    } else if(Util.isFunction(depsOrFunc)) {
      Injector.register(keyOrDeps, [], depsOrFunc, funcOrScope);

    // get a module
    } else if(keyOrDeps && !Util.isDefined(depsOrFunc)) {
      return Injector.getDependency(keyOrDeps);
    }

    return null;
  };

  core.unresolve = function(key) {
    Injector.unresolve(key);
  };
  core.noConflict = function() {
    window[id] = previousOwner;
    return core;
  };
  core.element = function(elementId, funcOrDeps, func) {
    var deps;

    if(Util.isFunction(funcOrDeps)) {
      func = funcOrDeps;
    } else if(Util.isArray(funcOrDeps)) {
      deps = funcOrDeps;
    } else {
      Util.error('element: second argument should be function or dependency array.');
    }

    onDocumentReady(function() {
      var i, body, numElements, selectedElement;

      if(!allElements) {
        body = document.getElementsByTagName('body');
        if(!body || !body[0]) {
          return;
        }
        allElements = body[0].querySelectorAll('*');
      }

      for(i = 0, numElements = allElements.length; i < numElements; i++) {
        selectedElement = allElements[i];
        if(selectedElement.hasAttribute('data-' + elementId) || selectedElement.hasAttribute(elementId)){
          if(deps) {
            func.apply(selectedElement, Injector.resolve(deps));
          } else {
            func.call(selectedElement);
          }
        }
      }
    });

    return this;
  };
  core.onDocumentReady = core.ready = onDocumentReady;
  core.log = true;

  /** create global reference to core */
  if(window[id]) {
    Util.warn('a preexisting value at namespace \'' + id + '\' has been overwritten.');
    previousOwner = window[id];
  }
  window[id] = core;
  return core;
})('kilo');

/**
 * Created by Shaun on 10/18/14.
 */

kilo('Canvas', [], function() {
  'use strict';

  return {
    clearContext: function(context, width, height) {
      context.clearRect(0, 0, width, height);
    },
    drawBackground: function(context, width, height, x, y, color) {
      context.fillStyle = color || 'red';
      context.fillRect(x || 0, y || 0, width, height);
    },
    drawBorder: function(context, width, height, x, y, color) {
      context.beginPath();
      context.strokeStyle = color || 'black';
      context.rect(x || 0, y || 0, width, height);
      context.stroke();
      context.closePath();
    }
  };
});
/**
 * Created by Shaun on 11/2/2014.
 */

kilo('Extend', ['Obj'], function(Obj) {
  'use strict';

  return Obj.extend.bind(Obj);
});
/**
 * Created by Shaun on 8/3/14.
 */

kilo('Factory', ['Obj', 'Pool'], function(Obj, Pool) {
  'use strict';

  return function(TypeObject) {
    //var newObject = Pool.getObject();
    //return Obj.mixin([TypeObject, newObject]); // FIXME: mixin still auto-creates an empty object
    var newObject = Obj.mixin([TypeObject]);
    return newObject;
  };
});
/**
 * Created by Shaun on 7/6/14.
 */

kilo('Func', [], function() {
  'use strict';

  function partial(f) {
    var boundArgs = Array.prototype.slice.call(arguments, 1);
    return function() {
      var defaultArgs = boundArgs.slice();
      for(var i = 0; i < arguments.length; i++) {
        defaultArgs.push(arguments[i]);
      }
      return f.apply(this, defaultArgs);
    };
  }

  function wrap(f, wrapper) {
    return partial(wrapper, f);
  }

  return {
    partial: partial,
    wrap: wrap
  };
});
/**
 * Created by Shaun on 6/4/14.
 */

kilo('HashArray', [], function() {
  'use strict';

  function HashArray() {
    this.values = [];
    this.keyMap = {};
  }

  function realignDown(keyMap, removedIndex) {
    var key;
    for(key in keyMap) {
      if(keyMap.hasOwnProperty(key) && keyMap[key] > removedIndex) {
        keyMap[key]--;
      }
    }
  }

  function realignUp(keyMap, splicedIndex) {
    var key;
    for(key in keyMap) {
      if(keyMap.hasOwnProperty(key) && keyMap[key] >= splicedIndex) {
        keyMap[key]++;
      }
    }
  }

  HashArray.prototype.set = function(key, value) {
    if(this.keyMap[key]) {
      this.values[this.keyMap[key]] = value;
      return true;
    } else {
      this.values.push(value);
      this.keyMap[key] = this.values.length - 1;
      return false;
    }
  };

  HashArray.prototype.splice = function(targetId, key, value) {
    var index = this.keyMap[targetId] + 1;
    this.values.splice(index, 0, value);
    realignUp(this.keyMap, index);
    this.keyMap[key] = index;
  };

  HashArray.prototype.get = function(key) {
    return this.values[this.keyMap[key]];
  };

  HashArray.prototype.remove = function(key) {
    var index = this.keyMap[key];
    this.values.splice(index, 1);
    realignDown(this.keyMap, index);
    delete this.keyMap[key];
  };

  HashArray.prototype.removeAll = function() {
    var keyMap = this.keyMap, key;
    this.values.length = 0;
    for(key in keyMap) {
      delete keyMap[key];
    }
  };

  HashArray.prototype.getIdByIndex = function(index) {
    var keyMap = this.keyMap, key;
    for(key in keyMap) {
      if(keyMap[key] === index) {
        return key;
      }
    }
    return '';
  };

  HashArray.prototype.getKeys = function() {
    var i, numItems = this.size(), result = [];
    for(i = 0; i < numItems; i++) {
      result.push(this.getIdByIndex(i));
    }
    return result;
  };

  HashArray.prototype.getValues = function() {
    return this.values;
  };

  HashArray.prototype.size = function() {
    return this.values.length;
  };

  return HashArray;
});
/**
 * Created by Shaun on 7/3/14.
 *
 * This is a decorator for HashArray. It adds automatic id management.
 */

kilo('KeyStore', ['HashArray', 'Util'], function(HashArray, Util) {
  'use strict';

  function KeyStore() {
    this.lastId = 0;
    this.store = new HashArray();
  }

  KeyStore.prototype.get = function(id) {
    return this.store.get(id);
  };

  KeyStore.prototype.set = function(valOrId, val) {
    var id;
    if(Util.isDefined(val)) {
      id = valOrId || this.lastId++;
    } else {
      id = this.lastId++;
      val = valOrId;
    }
    this.store.add(id, val);
    return id;
  };

  KeyStore.prototype.setGroup = function(valOrId, val) {
    var id, values;
    if(Util.isDefined(val)) {
      id = valOrId;
      if(Util.isDefined(id)) {
        values = this.get(id);
      } else {
        id = this.lastId++;
        values = [];
        this.store.add(id, values);
      }
    } else {
      id = this.lastId++;
      val = valOrId;
      values = [];
      this.store.add(id, values);
    }

    if(values) {
      values.push(val);
    } else {
      console.error('Jack2d: keyStore: id \''+ id + '\' not found.');
    }

    return id;
  };

  KeyStore.prototype.clear = function(id) {
    if(Util.isDefined(id)) {
      this.store.remove(id);
    } else {
      this.store.removeAll();
    }
  };

  KeyStore.prototype.getItems = function() {
    return this.store.items;
  };

  return KeyStore;
});
/**
 * Created by Shaun on 11/2/2014.
 */

kilo('Mixin', ['Obj'], function(Obj) {
  'use strict';

  return Obj.mixin.bind(Obj);
});

/**
 * Created by Shaun on 6/28/14.
 */

kilo('Obj', ['Injector', 'Util', 'Func', 'Pool'], function(Injector, Util, Func, Pool) {
  'use strict';

  function mergeObjects(giver, receiver, allowWrap, exceptionOnCollisions) {
    giver = giver || {};
    if(giver.__mixin === false) { // What about receiver?
      Util.error('Can\'t mixin object because the object has disallowed it.');
      return;
    }
    Object.keys(giver).forEach(function(prop) {
      if(receiver.hasOwnProperty(prop)) {
        if(allowWrap) {
          receiver[prop] = Func.wrap(receiver[prop], giver[prop]);
          Util.log('Mixin: wrapped \'' + prop + '\'');
        } else if(exceptionOnCollisions) {
          Util.error('Failed to merge mixin. Method \'' +
            prop + '\' caused a name collision.');
        } else {
          receiver[prop] = giver[prop];
          Util.log('Mixin: overwrote \'' + prop + '\'');
        }
      } else {
        receiver[prop] = giver[prop];
      }
    });
  }

  function augmentMethods(targetObject, augmenter) {
    var newObject = {}; // TODO: use pooling?

    Object.keys(targetObject).forEach(function(prop) {
      if(!Util.isFunction(targetObject[prop])) {
        return;
      }
      newObject[prop] = augmentMethod(targetObject[prop], targetObject, augmenter);
    });

    return newObject;
  }

  function augmentMethod(method, context, augmenter) {
    return function() {
      var args = Util.argsToArray(arguments);
      if(augmenter) {
        args.unshift(method);
        return augmenter.apply(context, args);
      } else {
        return method.apply(context, args);
      }
    };
  }

  return {
    replaceMethod: function(context, oldMethod, newMethod, message) {
      Object.keys(context).forEach(function(prop) {
        if(context[prop] === oldMethod) {
          console.log(message);
          context[prop] = newMethod;
        }
      });
    },
    augment: function(object, augmenter) {
      return augmentMethods(object, augmenter);
    },
    clone: function(object) {
      return this.merge(object);
    },
    merge: function(source, destination) {
      var prop;
      destination = destination || {};
      for(prop in source) {
        if(source.hasOwnProperty(prop)) {
          destination[prop] = source[prop];
        }
      }
      return destination;
    },
    create: function(source) {
      return this.mixin(source);
    },
    print: function(obj) {
      var prop, str = '';
      for(prop in obj) {
        if(obj.hasOwnProperty(prop) && !Util.isFunction(obj[prop])) {
          str += prop + ': ' + obj[prop] + '<br>';
        }
      }
      return str;
    },
    clear: function(obj) {
      var prop;
      for(prop in obj) {
        if(obj.hasOwnProperty(prop)) {
          delete obj[prop];
        }
      }
      return obj;
    },
    extend: function() {
      var args = (arguments.length > 1) ?
        Util.argsToArray(arguments) :
        arguments[0];
      return this.mixin(args, true);
    },
    // TODO: make this work with functions
    // TODO: should it always create a new object? Should be able to mix into existing object
    mixin: function(giver, allowWrap, exceptionOnCollisions) {
      var receiver = Pool.getObject();
      if(Util.isArray(giver)) {
        giver.forEach(function(obj) {
          if(Util.isString(obj)) {
            obj = Injector.getDependency(obj);
          }
          mergeObjects(obj, receiver, allowWrap, exceptionOnCollisions);
        });
      } else {
        if(Util.isString(giver)) {
          giver = Injector.getDependency(giver);
        }
        mergeObjects(giver, receiver, allowWrap, exceptionOnCollisions);
      }

      return receiver;
    }
  };
});
/**
 * Created by Shaun on 7/4/14.
 */

kilo('Pool', [], function() {
  'use strict';

  var objects = [];

  function getObject() {
    var newObject = objects.pop();
    if(!newObject) {
      newObject = {};
    }
    return newObject;
  }

  function clearObject(obj) {
    var prop;
    for(prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        delete obj[prop];
      }
    }
    return obj;
  }

  function killObject(unusedObject) {
    objects.push(clearObject(unusedObject));
  }

  function available() {
    return objects.length;
  }

  return {
    getObject: getObject,
    killObject: killObject,
    available: available
  };
});
/**
 * Created by Shaun on 7/16/14.
 */

kilo('rect', [], function() {
  'use strict';

  function containsPoint(x, y, rect) {
    return !(x < rect.left || x > rect.right ||
      y < rect.top || y > rect.bottom);
  }

  function containsRect(inner, outer) {
    return !(inner.left < outer.left ||
      inner.right > outer.right ||
      inner.top < outer.top ||
      inner.bottom > outer.bottom);
  }

  // WTF?
  function containsRectX(inner, outer) {
    var contains = !(inner.left < outer.left || inner.right > outer.right);
    return (contains) ? false : inner.left - outer.left;
  }

  function containsX(x, outer) {
    return !(x < outer.left || x > outer.right);
  }

  // WTF?
  function containsRectY(inner, outer) {
    var contains = !(inner.top < outer.top || inner.bottom > outer.bottom);
    return (contains) ? false : inner.top - outer.top;
  }

  function containsY(y, outer) {
    return !(y < outer.top || y > outer.bottom);
  }

  function intersectsRectX(r1, r2) {
    var intersects = !(r2.left >= r1.right || r2.right <= r1.left);
    return (intersects) ? r1.left - r2.left : false;
  }

  function intersectsRectY(r1, r2) {
    var intersects = !(r2.top >= r1.bottom || r2.bottom <= r1.top);
    return (intersects) ? r1.top - r2.top : false;
  }

  return {
    setLeft: function(left) {
      this.left = left;
      return this;
    },
    setTop: function(top) {
      this.top = top;
      return this;
    },
    setRight: function(right) {
      this.right = right;
      return this;
    },
    setBottom: function(bottom) {
      this.bottom = bottom;
      return this;
    },
    containsPoint: containsPoint,
    containsRect: containsRect,
    containsX: containsX,
    containsY: containsY,
    containsRectX: containsRectX,
    containsRectY: containsRectY,
    intersectsRectX: intersectsRectX,
    intersectsRectY: intersectsRectY
  };
});
/**
 * Created by Shaun on 5/31/14.

  http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
  requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
  MIT license
 */

/*(function(frameLength) {
  'use strict';
  var vendors = ['ms', 'moz', 'webkit', 'o'], x;

  for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
      window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return window.setTimeout(callback, frameLength);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
  }
})(62.5);*/

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
/**
 * Created by Shaun on 6/7/14.
 */

kilo('SchedulerObject', ['Util', 'Scheduler', 'Func'], function(Helper, Chrono, Func) {
  'use strict';

  return {
    onFrame: function(callback, id) {
      var gid = Helper.getGID(id);

      if(!this.chronoIds) {
        this.chronoIds = [];
      }
      if(!this.hooks) {
        this.hooks = {};
      }

      callback = callback.bind(this);
      if(id) {
        this.hooks[id] = gid;
      }
      this.chronoIds.push(Chrono.register(callback, gid));
      return this;
    },
    getChronoId: function(hookId) {
      if(!this.hooks) {
        return null;
      }
      return this.hooks[hookId];
    },
    // wraps an existing chrono task
    hook: function(id, wrapper) {
      var f, chronoId = this.getChronoId(id);
      if(chronoId) {
        f = Chrono.getRegistered(chronoId);
        f = Func.wrap(f, wrapper);
        Chrono.register(f, chronoId);
      }
    },
    killOnFrame: function(chronoId) {
      if(chronoId) {
        Chrono.unRegister(chronoId);
      } else if(this.chronoIds) {
        this.chronoIds.forEach(function(chronoId) {
          Chrono.unRegister(chronoId);
        });
      }

      return this;
    }
  };
});
/**
 * Created by Shaun on 5/31/14.
 */

kilo('Scheduler', ['HashArray', 'Util'], function(HashArray, Util) {
  'use strict';

  var ONE_SECOND = 1000,
    targetFps,
    actualFps,
    ticks,
    running,
    elapsedSeconds,
    registeredCallbacks,
    lastRegisteredId,
    lastUid,
    oneSecondTimerId,
    frameTimerId,
    lastUpdateTime,
    obj;

  init();

  function init() {
    reset();
    start();
    return obj;
  }

  function reset() {
    targetFps = 60;
    actualFps = 0;
    ticks = 0;
    elapsedSeconds = 0;
    lastRegisteredId = 0;
    lastUid = 0;
    registeredCallbacks = new HashArray();
    running = false;
    lastUpdateTime = new Date();
    return obj;
  }

  function register(callback, id) {
    if(!Util.isFunction(callback)) {
      Util.error('Scheduler: only functions can be registered.');
    }
    if(!id) {
      id = Util.getGID(id);
    }

    registeredCallbacks.set(id, callback);

    return id;
  }

  function registerAfter(afterId, callback, id) {
    if(!id) {
      id = lastRegisteredId++;
    }
    registeredCallbacks.splice(afterId, id, callback);
    return id;
  }

  function unRegister(id) {
    registeredCallbacks.remove(id);
    return obj;
  }

  function getRegistered(id) {
    return (id) ? registeredCallbacks.get(id) : registeredCallbacks.getValues();
  }

  function requestNextFrame() {
    frameTimerId = window.requestAnimationFrame(onFrame);
  }

  function registeredCount() {
    return registeredCallbacks.size();
  }

  function start() {
    if(!running) {
      running = true;
      oneSecondTimerId = window.setInterval(onOneSecond, ONE_SECOND);
      onFrame();
    }
    return obj;
  }

  function stop() {
    running = false;
    window.clearInterval(oneSecondTimerId);
    window.cancelAnimationFrame(frameTimerId);
    return obj;
  }

  function onFrame() {
    executeFrameCallbacks(getDeltaTime());
    tick();

    if(running) {
      requestNextFrame();
    }
  }

  function executeFrameCallbacks(deltaTime) {
    var items, numItems, item, i;

    items = registeredCallbacks.getValues();
    numItems = items.length;

    for(i = 0; i < numItems; i++) {
      item = items[i];
      if(item) {
        item(deltaTime);
      }
    }
  }

  function getDeltaTime() {
    var now = +new Date(),
      elapsed = (now - lastUpdateTime) / ONE_SECOND;

    lastUpdateTime = now;

    return elapsed;
  }

  function tick() {
    ticks++;
  }

  function onOneSecond() {
    actualFps = ticks.toString();
    ticks = 0;
    elapsedSeconds++;
  }

  function getFps() {
    return actualFps;
  }

  function getSeconds() {
    return elapsedSeconds;
  }

  obj = {
    __mixin: false,
    init: init,
    reset: reset,
    start: start,
    stop: stop,
    register: register,
    registerAfter: registerAfter,
    unRegister: unRegister,
    getRegistered: getRegistered,
    registeredCount: registeredCount,
    getFps: getFps,
    getSeconds: getSeconds
  };

  return obj;
});
/**
 * Created by Shaun on 5/24/14.
 */

jack2d('CanvasElement', ['obj', 'Element', 'Requires'], function(obj, Element, Requires) {
  'use strict';

  var CHECKER_COLOR = 'rgba(184,184,184,0.5)'; // grey

  return obj.mixin([Element, {
    checkerBackground: Requires(['element'], function(checkerSize) {
      var canvas = this.element,
        width = canvas.width,
        height = canvas.height,
        size = checkerSize || this.cellSize,
        widthInCheckers = width / size,
        heightInCheckers = height  / size,
        context = canvas.getContext('2d'),
        offset,
        i, j;

      context.fillStyle = CHECKER_COLOR;

      for(i = 0; i < widthInCheckers; i++) {
        offset = i % 2;
        for(j = 0; j < heightInCheckers; j++) {
          if(j % 2 === 0) {
            context.fillRect(i * size, (j + offset) * size, size, size);
          }
        }
      }
      return this;
    })
  }]);
});
/**
 * Created by Shaun on 8/29/14.
 */

jack2d('CanvasViewport', ['helper', 'obj', 'rect', 'Canvas', 'Requires'],
function(Helper, Obj, Rect, Canvas, Requires) {
  'use strict';

  function drawLayer(canvas, layerData, viewDimensions) {
    var context = canvas.getContext('2d');

    if(layerData.visible) {
      layerData.layer.draw(context, viewDimensions);
    }
  }

  return Obj.mixin(['Viewport', 'CanvasElement', 'ViewportFocus', {
    elPromise: function(elPromise, elementOrSelector) {
      this.onFrame(this.updateViewport, this.getType());
      return elPromise.call(this, elementOrSelector);
    },
    el: function(el, elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    updateViewport: function() {
      this.checkFocusRegion();
      this.draw();
    },
    clear: function(width, height) {
      var canvas = this.element,
        dims;

      if(canvas) {
        dims = this.viewDimensions;
        Canvas.clearContext(canvas.getContext('2d'), width || dims.width, height || dims.height);
      }
      return this;
    },
    drawBorder: function(width, height) {
      var dims = this.viewDimensions;
      Canvas.drawBorder(this.element.getContext('2d'), width || dims.width, height || dims.height);
      return this;
    },
    drawBackground: function(width, height, color) {
      var dims = this.viewDimensions;
      Canvas.drawBackground(this.element.getContext('2d'), width || dims.width, height || dims.height, color);
      return this;
    },
    drawLayer: Requires(['element', 'layers'], function(index) {
      drawLayer(this.element, this.layers[index], this.viewDimensions);
      return this;
    }),
    draw: Requires(['element', 'layers'], function() {
      var layer, i;
      var layers = this.layers;
      var canvas = this.element;
      var context = canvas.getContext('2d');
      var dims = this.viewDimensions;
      var delta = this.viewDelta;
      var numLayers = layers.length;

      Canvas.clearContext(context, delta.width, delta.height);

      for(i = 0; i < numLayers; i++) {
        layer = layers[i];
        if(layer.renderMode === 1) {
          drawLayer(canvas, layer, delta);
        } else {
          drawLayer(canvas, layer, dims);
        }
      }

      if(this.hasBorder) {
        Canvas.drawBorder(context, dims.width, dims.height);
      }

      if(this.drawFocusRegion) {
        Canvas.drawBorder(
          context,
          this.focusRegion.right - this.focusRegion.left,
          this.focusRegion.bottom - this.focusRegion.top,
          this.focusRegion.left,
          this.focusRegion.top,
          'red'
        );
      }

      return this;
    })
  }], true);
});
/**
 * Created by Shaun on 6/17/14.
 */

jack2d('debug', ['helper', 'obj', 'chronoObject', 'Element'],
function(helper, obj, chronoObject, Element){
  'use strict';

  return obj.mixin([chronoObject, Element, {
    print: function(id, message) {
      var contentList = (this.contentList) ? this.contentList : this.contentList = {};
      if(!contentList.hasOwnProperty(id)) {
        contentList[id] = document.createElement('div');
        this.element.appendChild(contentList[id]);
      }
      if(contentList[id].innerHTML !== message) {
        contentList[id].innerHTML = message;
      }

      return this;
    },
    printObject: function(target) {
      var prop, value;
      for(prop in target) {
        if(target.hasOwnProperty(prop)) {
          value = target[prop];
          if(helper.isString(value) || helper.isNumber(value) || helper.isBoolean(value)) {
            this.print(prop, prop + ': ' + target[prop]);
          }
        }
      }
      return this;
    },
    livePrint: function(callback) {
      /*this.onFrame(function() {
        callback(helper.call(this, this.print));
      });*/
      this.onFrame(callback);
      return this;
    }
  }]);
});
/**
 * Created by Shaun on 6/22/14.
 */

jack2d('doc', ['helper'], function(helper) {
  'use strict';

  function getElement(elementOrSelector) {
    return new Promise(function(resolve, reject) {
      if(!helper.isString(elementOrSelector)) {
        resolve(elementOrSelector);
      } else {
        onDocumentReady().then(function() {
          var element = document.querySelectorAll(elementOrSelector)[0];
          if(element) {
            resolve(element);
          } else {
            reject('Jack2d: element not found at \'' + elementOrSelector + '\'');
          }
        });
      }
    });
  }

  function el(elementOrSelector) {
    var results = (documentReady()) ?
      document.querySelectorAll(elementOrSelector) :
      helper.error('Jack2d: Can\'t select elements because document is not ready');

    return (results.length > 1) ? results : results[0];
  }

  function documentReady() {
    return (document.readyState === 'complete');
  }

  function onDocumentReady() {
    return new Promise(function(resolve, reject) {
      var readyStateCheckInterval;
      if(document.readyState === 'complete') {
        resolve();
      } else {
        readyStateCheckInterval= setInterval(function() {
          if (document.readyState === 'complete') {
            resolve();
            clearInterval(readyStateCheckInterval);
          }
        }, 10);
      }
    });
  }

  return {
    getElement: getElement,
    documentReady: documentReady,
    onDocumentReady: onDocumentReady,
    el: el
  };

});
/**
 * Created by Shaun on 7/4/14.
 */

jack2d('ElementFactory', ['obj', 'Element'], function(obj, Element) {
  'use strict';

  return function(elementOrSelector, mixins) {
    var newElement = (mixins) ? obj.mixin(mixins.concat([Element])) : obj.create(Element);
    return (elementOrSelector) ?
      newElement.el(elementOrSelector) :
      newElement;
  };
});

/**
 * Created by Shaun on 6/26/14.
 */


jack2d('Element', ['helper', 'obj', 'doc', 'input'], function(Helper, Obj, Doc, Input) {
  'use strict';

  return Obj.mixin(['chronoObject', {
    elPromise: function(elementOrSelector) {
      var promise = Doc.getElement(elementOrSelector);

      if(Helper.isString(elementOrSelector)) {
        this.elementSelector = elementOrSelector;
      }

      return promise.then(
        function(element) {
          this.element = element;
          return element;
        }.bind(this),
        function(error) {
          console.log(error);
        });
    },
    el: function(elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    setStyle: function(prop, value) {
      this.element.style[prop] = value;
      return this;
    },
    updateElement: function() {
      var prop;
      if(!this.element) {
        return;
      }
      for(prop in this) {
        if(this.hasOwnProperty(prop)) {
          switch(prop) {
            case 'x':
              this.element.style.left = this.x + 'px';
              break;
            case 'y':
              this.element.style.top = this.y + 'px';
              break;
            case 'width':
              this.element.style.width = this.width + 'px';
              break;
            case 'height':
              this.element.style.height = this.height + 'px';
              break;
          }
        }
      }
    },
    onInteract: function(onInput, onInputEnd) {
      var element, contextOnInput, contextOnInputEnd;

      element = this.element;
      contextOnInput = (onInput) ?
        onInput.bind(this) :
        Helper.error('Jack2d: Element::onInteract requires at least one callback.');
      contextOnInputEnd = (onInputEnd) ? onInputEnd.bind(this) : null;

      this.onFrame(function() {
        var inputs = Input.getInputs();

        if(inputs.interact && inputs.interact.target === element) {
          contextOnInput(inputs.interact);
          this.interacted = true;
        } else if(contextOnInputEnd && this.interacted) {
          contextOnInputEnd(inputs.interact);
          this.interacted = false;
        }
      });

      return this;
    }
  }]);
});


/**
 * Created by Shaun on 7/19/14.
 */

jack2d('hotspot', ['obj', 'input'], function(Obj, Input) {
  'use strict';

  return Obj.mixin(['chronoObject', 'rect', {
    onInteract: function(onInput, onInputEnd) {
      var contextOnInput = onInput.bind(this),
        contextOnInputEnd = onInputEnd.bind(this);

      this.onFrame(function() {
        var inputs = Input.getInputs();

        if(inputs.interact &&
          this.containsPoint(inputs.interact.offsetX, inputs.interact.offsetY, this)) {
          contextOnInput(inputs.interact);
          this.interacted = true;
        } else if(this.interacted) {
          contextOnInputEnd(inputs.interact);
          this.interacted = false;
        }
      });
      return this;
    }
  }]);
});
/**
 * Created by Shaun on 7/4/14.
 */

jack2d('LiveElementFactory', ['helper', 'obj', 'LiveElement'], function(Helper, Obj, LiveElement) {
  'use strict';

  return function(elementOrSelector, mixins) {
    var newElement;

    if(mixins && Helper.isArray(mixins)) {
      mixins.unshift(LiveElement);
      newElement = Obj.mixin(mixins);
    } else {
      newElement = Obj.create(LiveElement);
    }

    return (elementOrSelector) ?
      newElement.el(elementOrSelector) :
      newElement;
  };
});

/**
 * Created by Shaun on 7/6/14.
 */

jack2d('LiveElement', ['helper', 'obj', 'chronoObject', 'Element'], function(helper, obj, chronoObject, Element) {
  'use strict';

  return obj.extend([Element, {
    el: function(el, elementOrSelector) {
      this.onFrame(this.updateElement, helper.getGID('live-element'));
      return el.call(this, elementOrSelector);
    }
  }]);
});
/**
 * Created by Shaun on 5/25/14.
 */

jack2d('Viewport', function() {
  'use strict';

  return function() {
    return {
      x: 32,
      y: 32,
      width: 64,
      height: 64
    };
  };
});

