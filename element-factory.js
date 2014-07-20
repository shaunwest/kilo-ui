/**
 * Created by Shaun on 7/4/14.
 */

jack2d('elementFactory', ['obj', 'element'], function(obj, element) {
  'use strict';

  return function(elementOrSelector) {
    var newElement = obj.create(element);
    return (elementOrSelector) ?
      newElement.el(elementOrSelector) :
      newElement;
  };
});
