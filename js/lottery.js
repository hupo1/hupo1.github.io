const allMember = ["落葵", "连翘", "山楂", "泽兰", "麦冬", "白术", "川贝", "曾青", "甘草", "重楼", "黄柏", "三七", "麦芽", "赤芍", "决明子", "五味子"
    , "金银花", "龙眼", "桔梗", "陈皮", "琥珀"];

const shuffle = (deck) => {
    let randomizedDeck = [];
    let array = deck;
    while ( array.length !== 0) {
        let rIndex = Math.floor(array.length * Math.random());
        randomizedDeck.push(array[rIndex]);
        array.splice(rIndex, 1)
    }
    return randomizedDeck;
};

const initialResult = [
    {w: '.o1', t: '一等奖: ', name: ''},
    {w: '.o2', t: '二等奖: ', name: ''},
    {w: '.o3', t: '二等奖: ', name: ''},
    {w: '.o4', t: '三等奖: ', name: ''},
    {w: '.o5', t: '三等奖: ', name: ''},
    {w: '.o6', t: '三等奖: ', name: ''}
];

//随机数
function rnd(max){
	//return Math.floor(Math.random()*(m-n+1)+n);
	return fetch("https://www.random.org/integers/?num=1&min=0&max=" + max + "&col=1&base=10&format=plain&rnd=new").then(resp => {
		return resp.text()
	})
}

//显示提示框
var toast_timer = 0;
function showToast(message){
	var alert = document.getElementById("toast"), toastHTML = '';
	if (alert == null){
		toastHTML = '<div id="toast">' + message + '</div>';
		document.body.insertAdjacentHTML('beforeEnd', toastHTML);
	}else{
		alert.style.opacity = .9;
	}
	toast_timer = setTimeout("hideToast()", 1000);
}

//隐藏提示框
function hideToast(){
	var alert = document.getElementById("toast");
	alert.style.opacity = 0;
	clearTimeout(toast_timer);
}

var $lottery = $('#lotterys'),
    $go = $('#go'),
    $rightNameList = $('#rightNameList'),
    $redrawBtn = $('#redraw'),
    $resetBtn = $('#reset');
var canvas = document.getElementById("lotterys"), w = h = 500;  
var ctx = canvas.getContext("2d");
var _lottery = {
	title: [],			 //奖品名称
	colors: [],			 //奖品区块对应背景颜色
	endColor: '#FF5B5C', //中奖后区块对应背景颜色
	outsideRadius: 250,	 //外圆的半径
	insideRadius: 0,	 //内圆的半径
	textRadius: 210,	 //奖品位置距离圆心的距离
	startAngle: 0,		 //开始角度
	isLock: false		 //false:停止; ture:旋转
};

window.onload = function(){
	drawLottery();
}

//画出转盘
function drawLottery(lottery_index){
  	if (canvas.getContext) {
	  var arc = Math.PI / (_lottery.title.length / 2); //根据奖品个数计算圆周角度
	  ctx.clearRect(0,0,w,h); //在给定矩形内清空一个矩形
	  ctx.strokeStyle = "#e95455"; //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
	  ctx.font = '16px Microsoft YaHei'; //font 属性设置或返回画布上文本内容的当前字体属性
	  for(var i = 0; i < _lottery.title.length; i++) { 
		  var angle =  _lottery.startAngle + i * arc;
		  ctx.fillStyle = _lottery.colors[i%_lottery.colors.length];
		   
		  //创建阴影（两者同时使用） shadowBlur:阴影的模糊级数   shadowColor:阴影颜色 【注：相当耗费资源】
		  //ctx.shadowBlur = 1;
		  //ctx.shadowColor = "#fff";
		 
		  ctx.beginPath();
		  //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）  
		  ctx.arc(w / 2, h / 2, _lottery.outsideRadius, angle + 0.001, angle + arc - 0.001, false);
		  ctx.arc(w / 2, h / 2, _lottery.insideRadius, angle + arc - 0.001, angle + 0.001, true);
		  ctx.stroke();
		  ctx.fill();
		  ctx.save();
		  
		  //----绘制文字开始----
		  //中奖后改变背景色
		  if(lottery_index != undefined && i == lottery_index){
		  	ctx.fillStyle = _lottery.endColor;
		  	ctx.fill();
		  }
		  ctx.fillStyle = "#781d00";
		  
		  var text = _lottery.title[i], line_height = 17, x, y;
		  x = w / 2 + Math.cos(angle + arc / 2) * _lottery.textRadius;
		  y = h / 2 + Math.sin(angle + arc / 2) * _lottery.textRadius;
		  ctx.translate(x, y); //translate方法重新映射画布上的 (0,0) 位置
		  ctx.rotate(angle + arc / 2 + Math.PI / 2); //rotate方法旋转当前的绘图
          ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
		  ctx.restore(); //把当前画布返回（调整）到上一个save()状态之前 
		  //----绘制文字结束----
	  	}     
  	}
}

//旋转转盘  angles：角度; item：位置; txt：提示语;
var rotateFn = function (item, angles, txt){
	$lottery.stopRotate();
	$lottery.rotate({
		angle: 0,
		animateTo: angles + 7200,
		duration: 10000,
		callback: function (){
			// $modal.hide();
			drawLottery(item); //中奖后改变背景颜色
			// $popover.show().find('.m5').show().find('font').text(txt);
			recordResult(txt); //插入已中奖纪录
			_lottery.isLock = !_lottery.isLock;
		}
	});
};

//开始抽奖
function lottery(){
	if(_lottery.isLock) { showToast('心急吃不了热豆腐哦'); return; }
	if(_lottery.title.length <= 1) {
		alert("至少两人参与抽奖");
		return;
	}
    let record = JSON.parse(localStorage.getItem("record"));
	if(record[0].name) {
        alert("所有奖项已产生！");
        return;
	}
	_lottery.isLock = !_lottery.isLock;
	drawLottery();
	rnd(_lottery.title.length - 1).then(item => {
	    rotateFn(item, -item * (360/_lottery.title.length) - (360/_lottery.title.length/2) - 90, _lottery.title[+item]);
	}).catch(_ => {
	    _lottery.isLock = !_lottery.isLock;
		alert('调用random.org接口获取随机数失败！')
	})
}

//插入已中奖纪录
function recordResult(name){
    let record = localStorage.getItem("record") ? JSON.parse(localStorage.getItem("record")) : initialResult;
    if(name) {
        _lottery.title.splice(_lottery.title.indexOf(name), 1);
        $rightNameList.val(_lottery.title.join("\n"));
        for(let i = record.length; i--;) {
            let r = record[i];
            if(!r.name) {
                r.name = name;
                break;
            }
        }
    }
    localStorage.setItem("allMember", JSON.stringify(_lottery.title));
    localStorage.setItem("record", JSON.stringify(record));
    record.forEach(function(item) {
        $(item.w).html(item.name ? item.t + item.name : '?')
    });
}

//重新排序
function reset () {
    _lottery.title = shuffle(JSON.parse(localStorage.getItem("allMember")));
    $rightNameList.val(_lottery.title.join("\n"));
    localStorage.setItem("allMember", JSON.stringify(_lottery.title));
    localStorage.setItem("record", JSON.stringify(initialResult));
    recordResult();
    drawLottery();
}

$(function(){
    //初始化
	if(!localStorage.getItem("allMember")) {
        localStorage.setItem("allMember", JSON.stringify(allMember));
        reset();
	} else {
        _lottery.title = JSON.parse(localStorage.getItem("allMember"));
        recordResult();
	}
    
	//动态添加大转盘的奖品与奖品区域背景颜色
	$rightNameList.val(_lottery.title.join("\n"));
	_lottery.colors = ["#edbf20", "#edbf20"];

	//go 点击事件
	$go.click(function (){
		lottery();
	});

	$redrawBtn.click(_ => {
		_lottery.title = $rightNameList.val().split("\n").map(_ => _.replace(/\s*/g, "")).filter(_ => {return !!_});
        localStorage.setItem("allMember", JSON.stringify(_lottery.title));
    	reset ();
	});

    $resetBtn.click(_ => {
        localStorage.setItem("allMember", JSON.stringify(allMember));
    	reset();
	})

	$('.right img').click(function() {
        $('.right').css({
            right: $('.right').css('right') === '0px' ? '-200px' : 0
        });
        $(this).toggleClass('expand');
    });
});