/**
 * Created by Shaun on 7/6/14.
 */

jack2d('liveElement', ['obj', 'chronoObject', 'element'], function(obj, chronoObject, element) {
  'use strict';

  return obj.mixin([element, chronoObject], {
    el: function(el, elementOrSelector) {
      this.onFrame(this.updateElement);
      return el.call(this, elementOrSelector);
    },
    updateElement: function() {
      var prop;
      if(!this.element) {
        return;
      }
      for(prop in this) {
        if(this.hasOwnProperty(prop)) {
          switch(prop) {
            case 'x':
              this.element.style.left = this.x + 'px';
              break;
            case 'y':
              this.element.style.top = this.y + 'px';
              break;
            case 'width':
              this.element.style.width = this.width + 'px';
              break;
            case 'height':
              this.element.style.height = this.height + 'px';
              break;
          }
        }
      }
    }

  });
});