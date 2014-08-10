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
