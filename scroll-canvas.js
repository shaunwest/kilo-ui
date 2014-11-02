/**
 * Created by Shaun on 10/25/14.
 */

jack2d('ScrollCanvas', ['Deferred', 'doc'], function(Deferred, Doc) {
  'use strict';

  function createCanvas(canvasSize) {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;
    canvas.style.position = 'absolute';
    canvas.style.border = 'blue solid 1px';
    //canvas.style.background = 'blue';
    return canvas;
  }

  function createInnerContainer(width, height) {
    var innerContainer = document.createElement('div');
    innerContainer.style.position = 'absolute';
    innerContainer.style.width = width + 'px';
    innerContainer.style.height = height + 'px';
    //innerContainer.style.background = 'red';
    return innerContainer;
  }

  return {
    el: function(elementOrSelector) {
      Doc
        .getElement(elementOrSelector)
        .then(function(outerContainer) {
          var innerContainer = createInnerContainer(outerContainer.offsetWidth, outerContainer.offsetHeight);
          outerContainer.appendChild(innerContainer);

          this.position = {x: 0, y: 0};
          this.createSegments(innerContainer);

          this.outerContainer = outerContainer;
          this.innerContainer = innerContainer;
        }.bind(this));

      return this;
    },
    drawImage: Deferred('segments', 'image', function(image, x, y) {
      var width = image.width;
      var height = image.height;
      this.applyOffset(x, y);
      /*this.context2d.drawImage(
        image,
        0, 0,
        width, height,
        x || 0, y || 0,
        width, height
      );*/

      return this;
    }),
    applyOffset: function(x, y) {
      var xOffset = (x || 0) % this.segmentSize;
      var yOffset = (y || 0) % this.segmentSize;

      this.innerContainer.style.left = -xOffset + 'px';
      this.innerContainer.style.top = -yOffset + 'px';
    },
    appendImage: function(image, x, y) {
      this.applyOffset(x, y);

    },
    setSegmentSize: function(value) {
      this.segmentSize = value;
      return this;
    },
    createSegments: function(container) {
      var x, y, top, left, segment, segments = [];
      var segmentSize = this.segmentSize;
      var containerWidth = container.offsetWidth;
      var containerHeight = container.offsetHeight;
      var segmentGridWidth = Math.ceil(containerWidth / segmentSize);
      var segmentGridHeight = Math.ceil(containerHeight / segmentSize);

      for(x = 0; x < segmentGridWidth; x++) {
        for(y = 0; y < segmentGridHeight; y++) {
          segment = createCanvas(segmentSize);
          left = x * segmentSize;
          top = y * segmentSize;
          segment.style.left = left + 'px';
          segment.style.top = top + 'px';
          container.appendChild(segment);
          segments.push(segment);
        }
      }

      this.segments = segments;

      return this;
    }
  };
});