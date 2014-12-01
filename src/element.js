/**
 * Created by Shaun on 6/26/14.
 */


jack2d('Element', ['helper', 'obj', 'doc', 'input'], function(Helper, Obj, Doc, Input) {
  'use strict';

  return Obj.mixin(['chronoObject', {
    elPromise: function(elementOrSelector) {
      var promise = Doc.getElement(elementOrSelector);

      if(Helper.isString(elementOrSelector)) {
        this.elementSelector = elementOrSelector;
      }

      return promise.then(
        function(element) {
          this.element = element;
          return element;
        }.bind(this),
        function(error) {
          console.log(error);
        });
    },
    el: function(elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    setStyle: function(prop, value) {
      this.element.style[prop] = value;
      return this;
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
    },
    onInteract: function(onInput, onInputEnd) {
      var element, contextOnInput, contextOnInputEnd;

      element = this.element;
      contextOnInput = (onInput) ?
        onInput.bind(this) :
        Helper.error('Jack2d: Element::onInteract requires at least one callback.');
      contextOnInputEnd = (onInputEnd) ? onInputEnd.bind(this) : null;

      this.onFrame(function() {
        var inputs = Input.getInputs();

        if(inputs.interact && inputs.interact.target === element) {
          contextOnInput(inputs.interact);
          this.interacted = true;
        } else if(contextOnInputEnd && this.interacted) {
          contextOnInputEnd(inputs.interact);
          this.interacted = false;
        }
      });

      return this;
    }
  }]);
});

