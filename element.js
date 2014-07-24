/**
 * Created by Shaun on 6/26/14.
 */


jack2d('element', ['helper', 'doc', 'proxy', 'input'], function(helper, doc, proxy, input) {
  'use strict';

  return {
    el: function(elementOrSelector) {
      var promise = doc.getElement(elementOrSelector);

      if(helper.isString(elementOrSelector)) {
        this.elementSelector = elementOrSelector;
      }

      promise.then(
        function(element) {
          this.element = element;
          proxy.executeDeferred(this);
        }.bind(this),
        function(error) {
          console.log(error);
        });

      return this;
    },
    setStyle: proxy.defer(function(prop, value) {
      this.element.style[prop] = value;
      return this;
    }),
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
    onInteract: proxy.defer(function(callback) {
      var element = this.element,
        contextCallback = callback.bind(this);

      input.onInputUpdate(function(inputs, ended) {
        if(inputs.interact && inputs.interact.target === element) {
          contextCallback(inputs.interact, false);
        }
      });
      return this;
    }),
    onInteractEnd: proxy.defer(function(callback) {
      var element = this.element,
        contextCallback = callback.bind(this);

      input.onInputUpdateEnd(function(input) {
        if(input.interact && input.interact.target === element) {
          contextCallback(input.interact);
        }
      });
      return this;
    })
  };
});

