/**
 * Created by Shaun on 6/17/14.
 */

jack2d('debug', ['helper', 'obj', 'proxy', 'chronoObject', 'Element'],
function(helper, obj, proxy, chronoObject, Element){
  'use strict';

  return obj.mixin([chronoObject, Element, proxy.defer({
    print: function(id, message) {
      var contentList = (this.contentList) ? this.contentList : this.contentList = {};
      if(!contentList.hasOwnProperty(id)) {
        contentList[id] = document.createElement('div');
        this.element.appendChild(contentList[id]);
      }
      contentList[id].innerHTML = message;

      return this;
    },
    livePrint: function(callback) {
      this.onFrame(function() {
        callback(helper.call(this, this.print));
      });
      return this;
    }
  })]);
});