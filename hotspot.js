/**
 * Created by Shaun on 7/19/14.
 */

jack2d('hotspot', ['obj', 'rect', 'input'], function(Obj, Rect, Input) {
  'use strict';

  return Obj.mixin(['chronoObject', Rect, {
    onInteract: function(callback, callbackEnd) {
      var rectangle = this,
        contextCallback = callback.bind(this),
        contextCallbackEnd = callbackEnd.bind(this);

      this.onFrame(function() {
        var inputs = Input.getInputs();

        if(inputs.interact &&
          Rect.containsPoint(inputs.interact.offsetX, inputs.interact.offsetY, rectangle)) {
          contextCallback(inputs.interact);
          this.interacted = true;
        } else if(this.interacted) {
          contextCallbackEnd(inputs.interact);
          this.interacted = false;
        }
      });
      return this;
    }/*,
    onInteractEnd: function(callback) {
      var rectangle = this,
        contextCallback = callback.bind(this);

      this.onFrame(function() {
        var inputs = Input.getInputsEnded();
        //if(Object.keys(inputs).length) {
          if(inputs.interact &&
            Rect.containsPoint(inputs.interact.offsetX, inputs.interact.offsetY, rectangle)) {
            contextCallback(inputs.interact);
          }
        //}
      });

      return this;
    }*/
  }]);
});