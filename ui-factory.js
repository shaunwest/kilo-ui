/**
 * Created by Shaun on 6/21/14.
 */

jack2d('uiFactory', ['obj', 'hotSpot'], function(obj, hotSpot) {
  'use strict';

  return {
    getHotSpot: function(selector) {
      return obj.clone(hotSpot).targetElement(selector);
    }
  };
});