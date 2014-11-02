/**
 * Created by Shaun on 10/19/14.
 */

jack2d('SegmentRenderer', ['obj', 'Requires'], function(Obj, Requires) {
  'use strict';

  function createCanvas(canvasSize) {
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = canvasSize;
    canvas.style.position = "absolute";
    return canvas;
  }

  function createSegmentContainer(width, height) {
    var container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    return container;
  }

  function createSegments(segmentSize, container) {
    var x, y, top, left, segment, segments = [];
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight;
    var segmentGridWidth = Math.ceil(containerWidth / segmentSize) + 1;
    var segmentGridHeight = Math.ceil(containerHeight / segmentSize) + 1;

    for(x = 0; x < segmentGridWidth; x++) {
      for(y = 0; y < segmentGridHeight; y++) {
        segment = createCanvas(segmentSize);
        left = x * segmentSize;
        top = y * segmentSize;
        segment.style.left = left + 'px';
        segment.style.top = top + 'px';
        segment.style.border = '1px solid red';
        container.appendChild(segment);
        segments.push(segment);
      }
    }

    return segments;
  }

  return Obj.mixin(['Element', {
    elPromise: function(elPromise, elementOrSelector) {
      return elPromise
        .call(this, elementOrSelector)
        .then(function(element) {
          var segmentContainer = createSegmentContainer(element.offsetWidth, element.offsetHeight);
          element.appendChild(segmentContainer);
          this.onFrame(this.updateRenderer);
          this.segmentContainer = segmentContainer;
        }.bind(this));
    },
    // TODO: is this necessary?
    el: function(el, elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    updateRenderer: Requires(['viewport', 'segmentSize'], function(elapsed) {
      var viewport = this.viewport;
      var segmentSize = this.segmentSize;
      var absoluteDeltaX = Math.abs(viewport.deltaX);
      var segmentDistanceX = Math.ceil(absoluteDeltaX / segmentSize);
      if(viewport.deltaX > 0) {

      }
      console.log(viewport);
      // draw to segments for viewport
    }),
    draw: function(image, x, y) {
      this.renderQueue.push(image);
    },
    getSegments: function() {
      /*if(!this.segments) {
        this.segments = createSegments(this.segmentSize, this.segmentContainer);
      }*/
      return this.segments;
    },
    setViewport: function(viewport) {
      this.viewport = viewport;
      return this;
    },
    setSegmentSize: function(value) {
      this.segmentSize = value;
      return this;
    }
  }], true);
});