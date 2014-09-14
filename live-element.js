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