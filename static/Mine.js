;var Mine = (function ($) {
    function Mine(config) {
        this._config = config || {};
        this.init();
    }

    Mine.prototype.init = function () {
        this.el = this._config.el || '#mine';
        this.container = $(this.el);
        this.cols = this._config.cols || 10;
        this.rows = this._config.rows || 10;
        this.mines = this._config.mines || 10;
        this.boxWidth = this._config.boxWidth || 40;

        this.boxData = [];
        this.boxStatus = [];
        this.boxDom = [];
        for (var i = 0; i < this.cols; i++) {
            this.boxData.push(getArray(this.rows, 0));
            this.boxStatus.push(getArray(this.rows, 0));
            this.boxDom.push(getArray(this.rows, null));
        }

        // 随机生成雷
        for (var i = 0; i < this.mines; i++) {
            var ci = Math.floor(Math.random() * this.cols);
            var ri = Math.floor(Math.random() * this.rows);
            this.boxData[ci][ri] === -1 && i--;
            this.boxData[ci][ri] = -1;
        }

        // 复制矩阵，并在周围增加一圈0
        var boxDataTemp = [];
        boxDataTemp.push(getArray(this.rows + 2, 0));
        for (var i = 0; i < this.cols; i++) {
            boxDataTemp.push([0, ...this.boxData[i], 0]);
        }
        boxDataTemp.push(getArray(this.rows + 2, 0));

        // 计算格子周围雷数
        for (var i = 0; i < this.cols; i++) {
            for (var j = 0; j < this.rows; j++) {
                if (this.boxData[i][j] === -1) continue;
                var sum = boxDataTemp[i][j] + boxDataTemp[i][j + 1] + boxDataTemp[i][j + 2]
                    + boxDataTemp[i + 1][j] + boxDataTemp[i + 1][j + 2]
                    + boxDataTemp[i + 2][j] + boxDataTemp[i + 2][j + 1] + boxDataTemp[i + 2][j + 2];
                this.boxData[i][j] = -sum;
            }
        }

        this.createCanvas();
        this.container.html('');
        for (var i = 0; i < this.cols; i++) {
            var col = $('<div></div>');
            col.css({
                'margin': '0',
                'padding': '0',
                'height': this.boxWidth + 'px'
            })
            for (var j = 0; j < this.rows; j++) {
                var box = createBox();
                !function (ctx, i, j) {
                    box.mousedown((e) => {
                        if (e.button == 2 && ctx.boxStatus[i][j] === 0) {
                            ctx.boxDom[i][j].text('flag');
                        }
                    });
                    box.contextmenu(() => false);
                    box.click(() => {
                        if (ctx.boxStatus[i][j] == 1) return;
                        if (ctx.boxData[i][j] == -1) {
                            ctx.boxDom[i][j].text('*').addClass('mine-box');
                            ctx.boxStatus[i][j] = 1;
                            // alert('踩到雷了！');
                        } else if (ctx.boxData[i][j] === 0) {
                            displayBlanks(ctx, i, j);
                        } else {
                            ctx.boxDom[i][j].text(ctx.boxData[i][j] === 0 ? '' : ctx.boxData[i][j]).addClass('done');
                            ctx.boxStatus[i][j] = 1;
                        }
                    });
                }(this, i, j);
                this.boxDom[i][j] = box;
                col.append(box);
            }
            this.container.append(col);
        }
    }

    Mine.prototype.createCanvas = function () {
        this.container.css({
            'min-width': (this.boxWidth * this.rows) + 'px',
            'min-height': (this.boxWidth * this.cols) + 'px',
            'text-align': 'center',
            'background-color': '#eee'
        });
        createStyle(this);
    };

    function displayBlanks(ctx, i, j) {
        if (i < 0 || j < 0 || i >= ctx.cols || j >= ctx.rows) return;
        ctx.boxDom[i][j].text(ctx.boxData[i][j] === 0 ? '' : ctx.boxData[i][j]).addClass('done');
        if (ctx.boxStatus[i][j] === 1) return;
        ctx.boxStatus[i][j] = 1;
        if (ctx.boxData[i][j] !== 0) return;
        displayBlanks(ctx, i - 1, j - 1);
        displayBlanks(ctx, i - 1, j);
        displayBlanks(ctx, i - 1, j + 1);
        displayBlanks(ctx, i, j - 1);
        displayBlanks(ctx, i, j + 1);
        displayBlanks(ctx, i + 1, j - 1);
        displayBlanks(ctx, i + 1, j);
        displayBlanks(ctx, i + 1, j + 1);
    }

    function createBox(text) {
        var box = $('<div></div>');
        box.text(text ? text : '');
        box.addClass('box');
        return box;
    }

    // 创建样式
    function createStyle(obj) {
        var style = `
<style>
.box{
    display: inline-block;
    overflow: hidden;
    width: ${obj.boxWidth}px;
    height: ${obj.boxWidth}px;
    line-height: ${obj.boxWidth}px;
    border: 1px solid white;
    background-color: #787878;
    color: white;
    cursor: pointer;
    transition: all .3s;
}
.box:hover{
    background-color: #9A9A9A;
}
.mine-box{
    background-color:#FF4949;
}
.mine-box:hover{
    background-color:#FF6B6B;
}
.done{
    background-color: #AAAAAA !important;
    cursor: default;
}

</style>
        `;
        $('head').append(style);
    }

    /**
     * new a array
     * @param length 数组长度
     * @param value 数组的值
     * @returns {Array}
     */
    function getArray(length = 1, value = 0) {
        return '0'.repeat(length).split('').map(x => value);
    }

    return Mine;
})(jQuery);
