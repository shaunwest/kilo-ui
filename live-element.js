/**
 * Created by Shaun on 7/6/14.
 */

jack2d('LiveElement', ['obj', 'chronoObject', 'Element'], function(obj, chronoObject, Element) {
  'use strict';

  return obj.extend([Element, {
    el: function(el, elementOrSelector) {
      this.onFrame(this.updateElement);
      return el.call(this, elementOrSelector);
    }
  }]);
});