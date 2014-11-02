/**
 * Created by Shaun on 8/29/14.
 */

jack2d('CanvasViewport', ['helper', 'obj', 'rect', 'Canvas', 'Requires'],
function(Helper, Obj, Rect, Canvas, Requires) {
  'use strict';

  function drawLayer(canvas, layerData, viewDimensions) {
    var context = canvas.getContext('2d');

    if(layerData.visible) {
      layerData.layer.draw(context, viewDimensions);
    }
  }

  return Obj.mixin(['Viewport', 'CanvasElement', 'ViewportFocus', {
    elPromise: function(elPromise, elementOrSelector) {
      this.onFrame(this.updateViewport, this.getType());
      return elPromise.call(this, elementOrSelector);
    },
    el: function(el, elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    updateViewport: function() {
      this.checkFocusRegion();
      this.draw();
    },
    clear: function(width, height) {
      var canvas = this.element,
        dims;

      if(canvas) {
        dims = this.viewDimensions;
        Canvas.clearContext(canvas.getContext('2d'), width || dims.width, height || dims.height);
      }
      return this;
    },
    drawBorder: function(width, height) {
      var dims = this.viewDimensions;
      Canvas.drawBorder(this.element.getContext('2d'), width || dims.width, height || dims.height);
      return this;
    },
    drawBackground: function(width, height, color) {
      var dims = this.viewDimensions;
      Canvas.drawBackground(this.element.getContext('2d'), width || dims.width, height || dims.height, color);
      return this;
    },
    drawLayer: Requires(['element', 'layers'], function(index) {
      drawLayer(this.element, this.layers[index], this.viewDimensions);
      return this;
    }),
    draw: Requires(['element', 'layers'], function() {
      var layer, i;
      var layers = this.layers;
      var canvas = this.element;
      var context = canvas.getContext('2d');
      var dims = this.viewDimensions;
      var delta = this.viewDelta;
      var numLayers = layers.length;

      Canvas.clearContext(context, delta.width, delta.height);

      for(i = 0; i < numLayers; i++) {
        layer = layers[i];
        if(layer.renderMode === 1) {
          drawLayer(canvas, layer, delta);
        } else {
          drawLayer(canvas, layer, dims);
        }
      }

      if(this.hasBorder) {
        Canvas.drawBorder(context, dims.width, dims.height);
      }

      if(this.drawFocusRegion) {
        Canvas.drawBorder(
          context,
          this.focusRegion.right - this.focusRegion.left,
          this.focusRegion.bottom - this.focusRegion.top,
          this.focusRegion.left,
          this.focusRegion.top,
          'red'
        );
      }

      return this;
    })
  }], true);
});