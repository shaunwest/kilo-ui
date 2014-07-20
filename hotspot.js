/**
 * Created by Shaun on 7/19/14.
 */

jack2d('hotspot', ['obj', 'rect', 'input'], function(obj, rect, input) {
  'use strict';

  return obj.mixin(rect, {
    onInteract: function(callback) {
      var rectangle = this,
        contextCallback = callback.bind(this);

      input.onInputUpdate(function(inputs) {
        if(inputs.interact &&
          rect.containsPoint(inputs.interact.offsetX, inputs.interact.offsetY, rectangle)) {
          contextCallback(inputs.interact);
        }
      });
      return this;
    },
    onInteractEnd: function(callback) {
      var rectangle = this,
        contextCallback = callback.bind(this);

      input.onInputUpdateEnd(function(inputs) {
        if(inputs.interact &&
          rect.containsPoint(inputs.interact.offsetX, inputs.interact.offsetY, rectangle)) {
          contextCallback(inputs.interact);
        }
      });

      return this;
    }
  });
});