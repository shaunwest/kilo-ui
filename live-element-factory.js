/**
 * Created by Shaun on 7/4/14.
 */

jack2d('liveElementFactory', ['obj', 'liveElement'], function(obj, liveElement) {
  'use strict';

  return function(elementOrSelector, dataObject) {
    var newElement = obj.mixin(liveElement, dataObject);
    newElement = (elementOrSelector) ?
      newElement.el(elementOrSelector) :
      newElement;

    return newElement;
  };
});
