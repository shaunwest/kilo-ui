/**
 * Created by Shaun on 6/22/14.
 */

jack2d('doc', ['helper'], function(helper) {
  'use strict';

  function getElement(elementOrSelector) {
    return new Promise(function(resolve, reject) {
      if(!helper.isString(elementOrSelector)) {
        resolve(elementOrSelector);
      } else {
        onDocumentReady().then(function() {
          var element = document.querySelectorAll(elementOrSelector)[0];
          if(element) {
            resolve(element);
          } else {
            reject('Jack2d: element not found at \'' + elementOrSelector + '\'');
          }
        });
      }
    });
  }

  function el(elementOrSelector) {
    var results = (documentReady()) ?
      document.querySelectorAll(elementOrSelector) :
      helper.error('Jack2d: Can\'t select elements because document is not ready');

    return (results.length > 1) ? results : results[0];
  }

  function documentReady() {
    return (document.readyState === 'complete');
  }

  function onDocumentReady() {
    return new Promise(function(resolve, reject) {
      var readyStateCheckInterval;
      if(document.readyState === 'complete') {
        resolve();
      } else {
        readyStateCheckInterval= setInterval(function() {
          if (document.readyState === 'complete') {
            resolve();
            clearInterval(readyStateCheckInterval);
          }
        }, 10);
      }
    });
  }

  return {
    getElement: getElement,
    documentReady: documentReady,
    onDocumentReady: onDocumentReady,
    el: el
  };

});