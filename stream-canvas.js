/**
 * Created by Shaun on 10/26/14.
 */

jack2d('StreamCanvas', ['obj', 'Pool', 'Deferred'], function(Obj, Pool, Deferred) {
  'use strict';

  var SEGMENT_SIZE = 64;

  function segmentize(imageData, segments, segmentSize) {
    var x = imageData.x;
    var y = imageData.y;
    var image = imageData.image;
    var width = image.width;
    var height = image.height;
    var sX = Math.floor(x / segmentSize);
    var sY = Math.floor(y / segmentSize);

  }

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

  return Obj.mixin(['Element', {
    elPromise: function(elPromise, elementOrSelector) {
      return elPromise
        .call(this, elementOrSelector)
        .then(function(element) {
          this.streamQueue = [];

          var segmentContainer = createSegmentContainer(element.offsetWidth, element.offsetHeight);
          element.appendChild(segmentContainer);
          this.createSegments(segmentContainer);

          this.onFrame(this.updateStream);
        }.bind(this));
    },
    el: function(el, elementOrSelector) {
      this.elPromise(elementOrSelector);
      return this;
    },
    updateStream: function() {
      var image, width, height;
      var queueItem = this.streamQueue.shift();
      if(!queueItem) {
        return;
      }

      /*image = queueItem.image;
      width = image.width;
      height = image.height;*/

      segmentize(queueItem, this.segments, SEGMENT_SIZE);
      /*this.context2d.drawImage(
        queueItem.image,
        0, 0,
        width, height,
        queueItem.x || 0, queueItem.y || 0,
        width, height
      );*/

      Pool.killObject(queueItem);
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
    },
    draw: Deferred('streamQueue', 'image', function(image, x, y) {
      var queueItem = Pool.getObject();
      queueItem.image = image;
      queueItem.x = x;
      queueItem.y = y;
      this.streamQueue.push(queueItem);
      return this;
    })
  }], true);
});