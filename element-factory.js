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
