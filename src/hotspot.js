/**
 * Created by Shaun on 7/19/14.
 */

jack2d('hotspot', ['obj', 'input'], function(Obj, Input) {
  'use strict';

  return Obj.mixin(['chronoObject', 'rect', {
    onInteract: function(onInput, onInputEnd) {
      var contextOnInput = onInput.bind(this),
        contextOnInputEnd = onInputEnd.bind(this);

      this.onFrame(function() {
        var inputs = Input.getInputs();

        if(inputs.interact &&
          this.containsPoint(inputs.interact.offsetX, inputs.interact.offsetY, this)) {
          contextOnInput(inputs.interact);
          this.interacted = true;
        } else if(this.interacted) {
          contextOnInputEnd(inputs.interact);
          this.interacted = false;
        }
      });
      return this;
    }
  }]);
});