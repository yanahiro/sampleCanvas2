/**
 * 
 */

var getStyleSheetValue = (function(elem, prop) {
  if (!elem || !prop) {
    return null;
  }

  var style = window.getComputedStyle(elem);
  var value = style.getPropertyValue(prop);

  return value;
});

var bWidth = 0;
var setCanvasSize = (function() {
  var csObj = document.querySelector('#cs');
  var width = getStyleSheetValue(csObj, 'width');
  var height = getStyleSheetValue(csObj, 'height');

  console.log('width : ' + width);
  console.log('height : ' + height);

  // 幅(Width)が変わった場合はリサイズする
  if (bWidth == 0 || bWidth != width) {
    var elem = document.getElementById("cs");
    elem.setAttribute('width', width);
    elem.setAttribute('height', height);
    bWidth = width;
  }
});

// ロードイベント処理
window.addEventListener('load', function() {
  setCanvasSize();
})

// ウィンドウサイズが変わった場合
window.addEventListener("resize", function() {
  // setCanvasSize();
});
