/**
 * Created by Shaun on 6/21/14.
 */

jack2d('uiFactory', ['helper', 'hotSpot'], function(helper, hotSpot) {
  'use strict';

  return {
    getHotSpot: function(selector) {
      return helper.clone(hotSpot).targetElement(selector);
    }
  };
});