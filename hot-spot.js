/**
 * Created by Shaun on 6/21/14.
 */

jack2d('hotSpot', ['obj', 'doc', 'input'], function(obj, doc, input) {
  'use strict';

  return obj.mixin([input], {
    targetElement: function(selector) {
      doc.getElement(selector).then(function(element) {
        input.setControlScheme({tap: {element: element}});
      }, function(error) {
        console.log(error);
      });
      return this;
    },
    onTap: function(callback) {
      input.onInput(function(inputs) {
        if(inputs.tap) {
         callback();
        }
      });
      return this;
    }
  });

});