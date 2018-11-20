/**
 * canvas操作
 * canvasに文字を書くための処理
 *
 * ※1 Androidではlocalstorageが使えないパターンがあるため、
 *     localStorageを利用しないパターンの署名ライブラリ
 * 
 * ※2 IE,EdgeとChromeはイベントの発生順序が異なるため
 *     発生順序を意識しする
 */

// esは「ElectronicSignature」自身が引数となっている
var ElectronicSignature  = (function(es) {

  es.execute = function(canvas_id, btns) {

    var c_id = canvas_id;
    var reset_id = btns.reset;
    var prev_id = btns.prev;
    var next_id = btns.next;
    var image_id = btns.image;
    var myStorage = localStorage;

    // 描画した線の管理
    var undoImage = [];
    var redoImage = [];

    // オブジェクト定義
    var canvas;
    var ctx;
    var moveflg = 0;
    var Xpoint;
    var Ypoint;
    var currentCanvas;
    var temp = [];

    //初期値（サイズ、色、アルファ値）の決定
    var defSize = 1;
    var defColor = "#333";


    // Touch操作用
    // 直前と直後の座標位置を管理
    var finger = [];
    // for (var i=0; i < 10 ;i++) {
    //   finger[i] = {x:0,y:0,x1:0,y1:0};
    // }


    this.init = function() {
      init();
    };

    function init() {
      // オブジェクトを設定
      canvas = document.getElementById(c_id);
      ctx = canvas.getContext('2d'),       

      // イベント定義
      // PC対応
      canvas.addEventListener('mouseover', mouseOver, false);
      canvas.addEventListener('mousedown', startPoint, false);
      canvas.addEventListener('mousemove', movePoint, false);
      canvas.addEventListener('mouseup', endPoint, false);
      canvas.addEventListener('mouseleave', mouseLeave, false);
      // スマホ対応
      // canvas.addEventListener('touchstart', startPoint, false);
      // canvas.addEventListener('touchmove', movePoint, false);
      // canvas.addEventListener('touchend', endPoint, false);

      canvas.addEventListener("touchstart",function(e){
        e.preventDefault();
        var rect=e.target.getBoundingClientRect();
        // undoImage=ctx.getImageData(0,0,canvas.width,canvas.height);
        undoImage.unshift(ctx.getImageData(0,0,canvas.width,canvas.height));
        redoImage = [];

        // 開始時の座標位置を退避
        finger.x1=e.touches[0].clientX-rect.left;
        finger.y1=e.touches[0].clientY-rect.top;
        // for(var i=0;i<finger.length;i++){
        //   finger[i].x1=e.touches[i].clientX-rect.left;
        //   finger[i].y1=e.touches[i].clientY-rect.top;
        // }
      });

      canvas.addEventListener("touchmove",function(e){
        e.preventDefault();
        var rect=e.target.getBoundingClientRect();
        finger.x=e.touches[0].clientX-rect.left;
        finger.y=e.touches[0].clientY-rect.top;
        ctx.beginPath();
        ctx.moveTo(finger[i].x1,finger[i].y1);
        ctx.lineTo(finger[i].x,finger[i].y);
        ctx.lineCap="round";
        ctx.stroke();

        // 現在の座標位置を退避
        finger.x1=finger.x;
        finger.y1=finger.y;
        // for(var i=0;i<finger.length;i++){
        //   finger[i].x=e.touches[i].clientX-rect.left;
        //   finger[i].y=e.touches[i].clientY-rect.top;
        //   ctx.beginPath();
        //   ctx.moveTo(finger[i].x1,finger[i].y1);
        //   ctx.lineTo(finger[i].x,finger[i].y);
        //   ctx.lineCap="round";
        //   ctx.stroke();
        //   finger[i].x1=finger[i].x;
        //   finger[i].y1=finger[i].y;
        // }
      });

      // 各種ボタンイベント定義
      var reset = document.getElementById(reset_id);
      reset.addEventListener('click', clearCanvas, false);
      var prev = document.getElementById(prev_id);
      prev.addEventListener('click', prevCanvas, false);
      var next = document.getElementById(next_id);
      next.addEventListener('click', nextCanvas, false);
      var image = document.getElementById(image_id);
      image.addEventListener('click', chgImg, false);

    };

    // ポインタがcanvas上に存在するかを管理するフラグ
    // canvas判定フラグ
    var isOnCanvas = false;

    // 保存可否判定フラグ
    var saveflg = false;

    /**
     * マウスオーバーイベント
     * （フォーカスイン）
     * canvas上にカーソルがある場合
     * 
     * @param  なし
     * @return なし
     */
    var mouseOver = (function(e) {
      console.log('mouseOver');
      // canvas上からフォーカスが外れて
      // 戻ってきた場合に直前までの
      // 内容を保存する
      if (saveflg) {
        moveflg = 0;
        // e.preventDefault();
        ctx.beginPath();
        saveflg = false;
        console.log('mouseOver:save');
      }
      // IE,Edge制御用項目
      isOnCanvas = true;
    });

    /**
     * マウスリーブイベント
     * （フォーカスアウト）
     * canvas上からカーソルが外れた場合
     * 
     * @param  なし
     * @return なし
     */
    var mouseLeave = (function(e) {
      // IE,Edge制御用項目
      isOnCanvas = false;
      console.log('mouseLeave');
    });

    /**
     * マウスダウンイベント（マウスボタンを押したとき）
     * タッチスタートイベント
     * canvas上でマウスクリック、もしくはタッチした場合
     * 
     * @param  なし
     * @return なし
     */
    var startPoint = (function(e) {
      e.preventDefault();
      ctx.beginPath();
     
      Xpoint = e.layerX;
      Ypoint = e.layerY;
       
      ctx.moveTo(Xpoint, Ypoint);
      console.log('start');
      saveflg = true;
      isOnCanvas = true;
      undoImage.unshift(ctx.getImageData(0,0,canvas.width,canvas.height));
      redoImage = [];
    });

    /**
     * マウスムーブイベント
     * タッチムーブイベント
     * canvas上でマウスを移動、
     * もしくはタッチしたまま移動した場合
     * 
     * @param  なし
     * @return なし
     */
    var movePoint = (function(e) {
      // タッチによる画面スクロールを止める
      e.preventDefault();
      // IE,Edge制御用項目
      // mouseoverよりmousemoveが先に発火するため
      // mouseoverイベント前は処理しない
      if (!isOnCanvas) {
        console.log('movePoint : false');
        return;
      }

      if (e.buttons === 1 || e.witch === 1 || e.type == 'touchmove') {
        console.log('in');
        Xpoint = e.layerX;
        Ypoint = e.layerY;
        moveflg = 1;
         
        ctx.lineTo(Xpoint, Ypoint);
        ctx.lineCap = "round";
        ctx.lineWidth = defSize * 2;
        ctx.strokeStyle = defColor;
        ctx.stroke();     

        saveflg = true;
      }


      e.preventDefault();
      var rect=e.target.getBoundingClientRect();
      for(var i=0;i<finger.length;i++){
        finger[i].x=e.touches[i].clientX-rect.left;
        finger[i].y=e.touches[i].clientY-rect.top;
        ctx.beginPath();
        ctx.moveTo(finger[i].x1,finger[i].y1);
        ctx.lineTo(finger[i].x,finger[i].y);
        ctx.lineCap="round";
        ctx.stroke();
        finger[i].x1=finger[i].x;
        finger[i].y1=finger[i].y;
      }
    });

    /**
     * マウスアップイベント（マウスボタンを離したとき）
     * タッチエンドイベント
     * canvas上でマウスのクリックを離す、
     * もしくはタッチを終了した場合
     * 
     * @param  なし
     * @return なし
     */
    var endPoint = (function(e) { 
      if (moveflg === 0) {
         ctx.lineTo(Xpoint-1, Ypoint-1);
         ctx.lineCap = "round";
         ctx.lineWidth = defSize * 2;
         ctx.strokeStyle = defColor;
         ctx.stroke();
         saveflg = true;
      }
      moveflg = 0;
      saveflg = false;
    });


    var touch


    /**
     * リセット処理
     * canvas上に描画した内容をクリアする
     * 
     * @param  なし
     * @return なし
     */
    var resetCanvas = (function() {
      // border分の幅と高さを足す(2px)
      ctx.clearRect(0, 0, ctx.canvas.clientWidth + 2, ctx.canvas.clientHeight + 2);
    });

     
    /**
     * 戻る処理
     * １つ前の描画内容に戻す
     * 
     * @param  なし
     * @return なし
     */
    var prevCanvas = (function() {
      if (undoImage.length > 0) {
        // イメージを退避
        redoImage.unshift(ctx.getImageData(0,0,canvas.width,canvas.height));
        ctx.putImageData(undoImage[0], 0, 0);
        // 直前の線を除去
        undoImage.shift();
      } else {
        alert("戻る描画は存在しません。");
      }
    });
     
    /**
     * 進む処理
     * １つ先の描画内容に戻す
     * 
     * @param  なし
     * @return なし
     */
    var nextCanvas = (function() {
      if (redoImage.length > 0) {
        // イメージを元に戻す
        undoImage.unshift(ctx.getImageData(0,0,canvas.width,canvas.height));
        ctx.putImageData(redoImage[0], 0, 0);
        // 退避していたイメージを除去
        redoImage.shift();
      } else {
        alert("進めません。");
      }
    });


    /**
     * リセット処理
     * 確認後、localStorageとcanvasを初期化する
     * 
     * @param  なし
     * @return なし
     */
    var clearCanvas = (function() {
        if (confirm('Canvasを初期化しますか？')) {
            temp = [];
            resetCanvas();
        }
    });
     
    /**
     * 画像変換処理
     * canvas上に記載した内容を画像変換する
     * 
     * @param  なし
     * @return なし
     */
    var chgImg = (function() {
      var png = canvas.toDataURL();
     
      document.getElementById("newImg").src = png;
    });
  }

  return es;
})(ElectronicSignature || {});
