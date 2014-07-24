/**
 * Created by Shaun on 7/6/14.
 */

jack2d('liveElement', ['obj', 'chronoObject', 'element'], function(obj, chronoObject, element) {
  'use strict';

  return obj.extend([element, chronoObject], {
    el: function(el, elementOrSelector) {
      this.onFrame(this.updateElement);
      return el.call(this, elementOrSelector);
    }
  });
});