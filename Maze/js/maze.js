var $ = function(id){
    return document.getElementById(id);
};
var canvas = $('canvas'),
    width = canvas.width,
    maze_cells = {},
    start_cell = {},
    end_cell = {},
    visitRooms = [],
    roomLine = [],
    start_col,
    start_row,
    maze;
    time = new Date();
    timem = time.getMinutes();
    times = time.getSeconds();
var Maze = function(obj,col,row){    //接受canvans元素，行列
    this.col = col || 10;
    this.row = row || 10;
    this.canvas = obj.getContext('2d');
    this.init();
};
Maze.prototype = {
    init : function () {
        this.cell = (width - 2) /this.col;
        for (var i = 0; i < this.row; i++) {
            maze_cells[i] = [];
            for (var j = 0; j < this.col; j++) {
                maze_cells[i].push({
                    'x':j,
                    'y':i,
                    'top':false,
                    'bottom' : false,
                    'left' : false,
                    'right' : false,
                    'isVisited' : false,
                    'g' : 0,
                    'h' : 0,
                    'f' : 0
                });
            }
        }
        start_cell = {'x':0,'y':0};
        start_row = start_cell.x;
        start_col = start_cell.y;
        visitRooms.push(start_cell);
        roomLine.push(start_cell);
        maze_cells[0][0].isVisited = true;
        maze_cells[0][0].top = true;
        maze_cells[this.row-1][this.col-1].bottom= true;
        this.calcCells(0,0,maze_cells); //遍历所有的方格
        this.drawCells();
        maze_cells[0][0].top = false;
        this.drawRect(start_col,start_row);
        // this.bindEvent(0,0,maze_cells);
    },
    random : function(num){
        return Math.floor(Math.random()*num.length);
    },
    calcCells: function(x,y,arr){
        var neighbors = [];          //相邻格子
        if(x-1 >=0 && !maze_cells[x-1][y].isVisited){
            neighbors.push({'x':x-1,'y':y});
        }
        if(x+1 < this.row && !maze_cells[x+1][y].isVisited){
            neighbors.push({'x':x+1,'y':y});
        }
        if(y-1 >=0 && !maze_cells[x][y-1].isVisited){
            neighbors.push({'x':x,'y':y-1});
        }
        if(y+1 < this.col && !maze_cells[x][y+1].isVisited){
            neighbors.push({'x':x,'y':y+1});
        }
        if(neighbors.length >0){
            var current = {'x':x,'y':y};
            var next = neighbors[this.random(neighbors)];
            maze_cells[next.x][next.y].isVisited = true;
            visitRooms.push({'x':next.x,'y':next.y});
            roomLine.push({'x':next.x,'y':next.y});
            this.breakWall(current,next);
            this.calcCells(next.x,next.y,arr);
        }else {
            var next = roomLine.pop();
            if(next != null){
                this.calcCells(next.x,next.y,arr);
            }
        }
    },
    breakWall : function(cur,next){
        if(cur.x < next.x){
            maze_cells[cur.x][cur.y].bottom = true;
            maze_cells[next.x][next.y].top = true;
        }
        if(cur.x > next.x){
            maze_cells[cur.x][cur.y].top = true;
            maze_cells[next.x][next.y].bottom = true;
        }
        if(cur.y < next.y){
            maze_cells[cur.x][cur.y].right = true;
            maze_cells[next.x][next.y].left = true;
        }
        if(cur.y > next.y){
            maze_cells[cur.x][cur.y].left = true;
            maze_cells[next.x][next.y].right = true;
        }
    },
    drawCells : function(){
        var ctx = this.canvas,w = this.cell;
        ctx.clearRect(0,0,$('canvas').width,$('canvas').height)
        ctx.beginPath();
        ctx.save();
        ctx.translate(1,1);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        for(var i in maze_cells){ //i 为 row
            var len = maze_cells[i].length;
            for( var j = 0; j < len; j++){
                var cell = maze_cells[i][j];
                i = parseInt(i);    
                if(!cell.top){
                    ctx.moveTo(j*w,i*w);
                    ctx.lineTo((j+1)*w ,i*w);
                }
                if(!cell.bottom){
                    ctx.moveTo(j*w,(i+1)*w);
                    ctx.lineTo((j+1)*w ,(i+1)*w);
                }
                if(!cell.left){
                    ctx.moveTo(j*w,i*w);
                    ctx.lineTo(j*w,(i+1)*w );
                }
                if(!cell.right){
                    ctx.moveTo((j+1)*w,i*w);
                    ctx.lineTo((j+1)*w,(i+1)*w);
                }
            }
        }
        ctx.stroke();
        ctx.restore();
        this.drawOffset();
    },
    drawOffset : function(){
        var offsetCanvas = document.createElement('canvas');
        offsetCanvas.id = 'offset';
        document.body.appendChild(offsetCanvas);
        offsetCanvas.width = $('canvas').width;
        offsetCanvas.height = $('canvas').height;
        var offset = $('offset').getContext('2d');
        offset.clearRect(0,0,$('canvas').width,$('canvas').height);
        offset.drawImage($('canvas'),0,0,offsetCanvas.width,offsetCanvas.height);
        $('offset').style.display ='none';
    },
    drawRect : function(col,row){
        var ctx = this.canvas;
        ctx.save();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage($('offset'),0,0);
        ctx.translate(2,2);
        ctx.fillStyle = '#B8F23A';
        ctx.fillRect(col*this.cell,row*this.cell,this.cell-2,this.cell-2);
        ctx.restore();
    },
    bindEvent :　function(x,y,arr){
        var Linelink = [],num = [];
        arr[0][0].judge = true;
        Linelink.push({'x':x,'y':y});
        if(arr[0][0].right){y=y+1;num.push(1);}
        if(arr[0][0].bottom){x=x+1;num.push(2);}
        var i = 0;
        var b = 0;
        arr[x][y].judge = true;
        Linelink.push({'x':x,'y':y});
        while(x!=this.row-1||y!=this.col-1){
            var x1,y2;
            if(i==4||i==5){
                // console.log(Linelink)
                var next = Linelink.pop();
                // console.log(next)
                next = Linelink[Linelink.length-1];
                x= next.x;y=next.y;
                // console.log(x+""+y)
                i=num[num.length-1]+1;
                // console.log(i)
                num.pop();
            }
            // console.log(arr[0][0].judge)
            // console.log(x+""+y)
            var p = false;
            if(i==0&&x-1>=0&&arr[x-1][y].judge != true){p=arr[x][y].top;}
            if(i==1&&y+1<this.col&&arr[x][y+1].judge != true){p=arr[x][y].right;}
            if(i==2&&x+1<this.row&&arr[x+1][y].judge != true){p=arr[x][y].bottom;}
            if(i==3&&y-1>=0&&arr[x][y-1].judge != true){p=arr[x][y].left;}
            if(p){
                if(i==0){
                    x=x-1;
                }
                if(i==1){
                    y=y+1;
                }
                if(i==2){
                    x=x+1;
                }
                if(i==3){
                    y=y-1;
                }
                num.push(i);
                arr[x][y].judge = true;
                Linelink.push({'x':x,'y':y});
                // console.log(Linelink);
                i=-1;
                // console.log(333)
            }
            i++;
            // b++;
            // console.log(i)
        }
        console.log(Linelink.length)
        return Linelink;
    },
    drawrect: function(col,row){
        // console.log(col+" "+row);
        var ctx = this.canvas;
        ctx.save();
        ctx.drawImage($('offset'),0,0);
        ctx.translate(2,2);
        ctx.fillStyle = '#F9D063';
        ctx.fillRect(col*this.cell,row*this.cell,this.cell-2,this.cell-2);
        ctx.restore();
    }
};
$('button').addEventListener('click',function(){
    var col = $('col').value,
        row = $('row').value,
        obj = $('canvas');
    maze_cells = {};
    start_cell = {};
    visitRooms = [];
    roomsLine = [];
    maze = new Maze(obj,col,row);
});
$('button1').onclick = function(){
    var arr = maze.bindEvent(0,0,maze_cells);
    var str="路径：";
    console.log(arr);
        for (var j = 0; j < arr.length; j++) {
            str += " ("+arr[j].y+"，"+arr[j].x+") ";
        }
    var i=0;
        $('rood').innerText = str;
    var Roodtime = setTimeout(function Rood(){
        maze.drawrect(arr[i].y,arr[i].x);
        i++;
        if(i==arr.length){
            clearTimeout(Roodtime);
            return;
        }
        setTimeout(Rood,300);
    },300);
};
window.addEventListener('keydown',function(event){
    switch (event.keyCode) {
        case 37 : 
           event.preventDefault();
           if(maze_cells[start_row][start_col].left){
               start_col --;
           }
           break;
        case 38 :
           event.preventDefault();
           if(maze_cells[start_row][start_col].top){
               start_row --;
           }
           break;
        case 39 :
           event.preventDefault();
           if(maze_cells[start_row][start_col].right){
               start_col ++;
           }
           break;
        case 40 :
           event.preventDefault();
           if(maze_cells[start_row][start_col].bottom){
               start_row ++;
           }
           break;
    }
    maze.drawRect(start_col,start_row);
    if(start_col == (maze.col - 1)  && start_row == ( maze.row - 1)){
        timeend =new Date();
        timemend = timeend.getMinutes();
        timesend = timeend.getSeconds();
        alert('到达终点了,用了' + parseInt(timemend-timem)+"分钟"+parseInt(timesend-times)+"秒");
    }
});
maze = new Maze($('canvas'),6,6);