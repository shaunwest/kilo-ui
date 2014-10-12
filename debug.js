/**
 * Created by Shaun on 6/17/14.
 */

jack2d('debug', ['helper', 'obj', 'chronoObject', 'Element'],
function(helper, obj, chronoObject, Element){
  'use strict';

  return obj.mixin([chronoObject, Element, {
    print: function(id, message) {
      var contentList = (this.contentList) ? this.contentList : this.contentList = {};
      if(!contentList.hasOwnProperty(id)) {
        contentList[id] = document.createElement('div');
        this.element.appendChild(contentList[id]);
      }
      if(contentList[id].innerHTML !== message) {
        contentList[id].innerHTML = message;
      }

      return this;
    },
    printObject: function(target) {
      var prop, value;
      for(prop in target) {
        if(target.hasOwnProperty(prop)) {
          value = target[prop];
          if(helper.isString(value) || helper.isNumber(value) || helper.isBoolean(value)) {
            this.print(prop, prop + ': ' + target[prop]);
          }
        }
      }
      return this;
    },
    livePrint: function(callback) {
      /*this.onFrame(function() {
        callback(helper.call(this, this.print));
      });*/
      this.onFrame(callback);
      return this;
    }
  }]);
});