/**
 * Created by Shaun on 7/4/14.
 */

jack2d('LiveElementFactory', ['obj', 'LiveElement'], function(obj, LiveElement) {
  'use strict';

  return function(elementOrSelector, dataObject) {
    var newElement = obj.mixin([LiveElement, dataObject]);
    newElement = (elementOrSelector) ?
      newElement.el(elementOrSelector) :
      newElement;

    return newElement;
  };
});
