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
  // Style 
  var csObj = document.querySelector('#cs');
  var width = getStyleSheetValue(csObj, 'width');
  var height = getStyleSheetValue(csObj, 'height');

  // window
  // var wWidth = window.parent.screen.width;
  // var wHeight = window.parent.screen.height;
  // // 縦も横も768以上の場合
  // if (wWidth > 767 && wHeight > 767) {
  //   // スマートフォン以外と判定
  // } else {
  //   // スマートフォンと判定
  // }
  // console.log('width : ' + width);
  // console.log('height : ' + height);

  // 初回設定または、幅(Width)が変わった場合はリサイズする
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
