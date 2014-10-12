/**
 * Created by Shaun on 8/29/14.
 */

jack2d('CanvasViewport', ['helper', 'obj', 'Requires'], function(Helper, Obj, Requires) {
  'use strict';

  function clearContext(context, width, height) {
    context.clearRect(0, 0, width, height);
  }

  function drawBackground(context, width, height, color) {
    context.fillStyle = color || 'red';
    context.fillRect(0, 0, width, height);
  }

  function drawBorder(context, width, height) {
    context.beginPath();
    context.rect(0, 0, width, height);
    context.stroke();
    context.closePath();
  }

  function drawLayer(canvas, layerData, viewDimensions) {
    var context = canvas.getContext('2d');

    if(layerData.visible) {
      layerData.layer.draw(context, viewDimensions);
    }
  }

  return Obj.mixin(['Viewport', 'canvas', {
    elPromise: function(elPromise, elementOrSelector) {
      this.onFrame(function() {
        this.draw();
      }, this.getType());
      return elPromise.call(this, elementOrSelector);
    },
    el: function(el, elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    clear: function(width, height) {
      var canvas = this.element,
        dims;

      if(canvas) {
        dims = this.viewDimensions;
        clearContext(canvas.getContext('2d'), width || dims.width, height || dims.height);
      }
      return this;
    },
    drawBorder: function(width, height) {
      var dims = this.viewDimensions;
      drawBorder(this.element.getContext('2d'), width || dims.width, height || dims.height);
      return this;
    },
    drawBackground: function(width, height, color) {
      var dims = this.viewDimensions;
      drawBackground(this.element.getContext('2d'), width || dims.width, height || dims.height, color);
      return this;
    },
    drawLayer: Requires(['element', 'layers'], function(index) {
      drawLayer(this.element, this.layers[index], this.viewDimensions);
      return this;
    }),
    draw: Requires(['element', 'layers'], function() {
      var layers = this.layers;
      var canvas = this.element;
      var context = canvas.getContext('2d');
      var dims = this.viewDimensions;
      var numLayers = layers.length, i;

      clearContext(context, dims.width, dims.height);
      for(i = 0; i < numLayers; i++) {
        drawLayer(canvas, layers[i], dims);
      }

      if(this.hasBorder) {
        drawBorder(context, dims.width, dims.height);
      }
      return this;
    })
  }], true);
});