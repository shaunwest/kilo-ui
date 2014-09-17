/**
 * Created by Shaun on 8/29/14.
 */

jack2d('CanvasViewport', ['helper', 'obj'], function(Helper, Obj) {
  'use strict';

  return Obj.mixin(['Viewport', 'canvas', {
    el: function(el, elementOrSelector) {
      this.onFrame(function() {
        this.draw();
      }, Helper.getGID('canvas-viewport'));
      return el.call(this, elementOrSelector);
    },
    addLayer: function(addLayer, layer) {
      addLayer.call(this, layer);
      this.setCanvasSize();
      return this;
    },
    setCanvasSize: function() {
      this.element.width = this.contentWidth;
      this.element.height = this.contentHeight;
      return this;
    },
    clear: function() {
      var element = this.element;

      element.
        getContext('2d').
        clearRect(0, 0, element.width, element.height);

      return this;
    },
    draw: function(layerIndex) {
      var layers, context;

      if(!this.element || !this.layers) {
        return this;
      }

      layers = this.layers;
      context = this.element.getContext('2d');
      var that = this;
      function drawLayer(layer) {
        if(layer.visible) {
          layer.layer.draw();
          that.clear();
          context.drawImage(layer.layer.getLayer(), 0, 0);
        }
      }

      function drawLayers() {
        var numLayers = layers.length, i;
        for(i = 0; i < numLayers; i++) {
          drawLayer(layers[i]);
        }
      }

      if(Helper.isNumber(layerIndex)) {
        drawLayer(layers[layerIndex]);
      } else {
        drawLayers();
      }

      return this;
    },
    setPosition: function(setPosition, x, y) {
      setPosition.call(this, x, y);

      this.element.style.left = -x + 'px';
      this.element.style.top = -y + 'px';

      return this;
    }
  }], true);
});