class Mine {
    static TYPE = {
        MINE: -1,
    };
    static CLASS_TYPE = {
        MINE: 'is-mine',
        BOMB: 'is-bomb',
        FLAG: 'is-flag',
        CHECKED: 'is-checked',
        UNCHECK: 'is-uncheck',
    };
    _config = {
        el: '', // 容器选择器
        container: null, // 容器节点
        rows: 10, // 行数
        cols: 10, // 列数
        mines: 10, // 雷数
    };
    _boxData = [];
    _boxDOM = [];
    _checkCount = 0;

    constructor({ el, rows, cols, mines } = {}) {
        this._config.el = el;
        this._config.rows = rows || this._config.rows;
        this._config.cols = cols || this._config.cols;
        this._config.mines = mines || this._config.mines;
        this._config.container = document.querySelector(el);
        if (!this._config.container) {
            throw new Error(`[Mine] element \`${el}\` cannot be found.`);
        }
        this._config.container.classList.add('mine');
        document.body.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    initialize() {
        const { rows, cols, mines, container } = this._config;

        this._boxData = [];
        this._boxDOM = [];
        this._checkCount = 0;

        // 初始化数据
        this._boxData = this.generateArray(rows)
            .map(() => this.generateArray(cols, 0));
        this._boxDOM = this.generateArray(rows)
            .map(() => this.generateArray(cols, this.generateBox));

        this._boxDOM.forEach((row, ri) => {
            row.forEach((box, ci) => {
                box.classList.add(Mine.CLASS_TYPE.UNCHECK);
                box.dataset.ri = ri.toString();
                box.dataset.ci = ci.toString();
            });
        });

        // 随机生成雷
        for (let i = 0; i < mines; i++) {
            const ri = Math.floor(Math.random() * rows);
            const ci = Math.floor(Math.random() * cols);
            if (this._boxData[ri][ci] === Mine.TYPE.MINE) {
                i--;
            } else {
                this._boxData[ri][ci] = Mine.TYPE.MINE;
            }
        }

        // 生成一个周围包含 0 的矩阵
        const boxDataTemp = [];
        boxDataTemp.push(this.generateArray(cols + 2));
        for (let i = 0; i < rows; i++) {
            boxDataTemp.push([0, ...this._boxData[i], 0]);
        }
        boxDataTemp.push(this.generateArray(cols + 2));

        // 计算每个格子周围雷数
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this._boxData[i][j] === Mine.TYPE.MINE) continue;
                this._boxData[i][j] = Math.abs(
                    [
                        boxDataTemp[i][j], boxDataTemp[i][j + 1], boxDataTemp[i][j + 2],
                        boxDataTemp[i + 1][j], boxDataTemp[i + 1][j + 1], boxDataTemp[i + 1][j + 2],
                        boxDataTemp[i + 2][j], boxDataTemp[i + 2][j + 1], boxDataTemp[i + 2][j + 2],
                    ].reduce((a, b) => a + b, 0),
                );
            }
        }

        this._boxDOM.forEach(row => {
            const rowDOM = document.createElement('div');
            rowDOM.classList.add('mine-row');
            row.forEach((box) => {
                rowDOM.append(box);
            });
            container.append(rowDOM);
        });

        function checkBox(ctx, ri, ci) {
            if (ri < 0 || ci < 0 || ri >= cols || ci >= rows) return;
            const target = ctx._boxDOM[ri][ci];
            const data = ctx._boxData[ri][ci];
            const classList = [...target.classList];
            if (classList.includes(Mine.CLASS_TYPE.UNCHECK)) {
                target.classList.replace(Mine.CLASS_TYPE.UNCHECK, Mine.CLASS_TYPE.CHECKED);
                if (data === Mine.TYPE.MINE) {
                    target.classList.add(Mine.CLASS_TYPE.BOMB);
                    gameOver(ctx);
                } else {
                    ctx._checkCount += 1;
                    if (ctx._checkCount === ctx._config.rows * ctx._config.cols - ctx._config.mines) {
                        success(ctx);
                    }
                    if (data > 0) {
                        target.innerText = data;
                    } else {
                        checkBox(ctx, ri - 1, ci - 1);
                        checkBox(ctx, ri - 1, ci);
                        checkBox(ctx, ri - 1, ci + 1);
                        checkBox(ctx, ri, ci - 1);
                        checkBox(ctx, ri, ci + 1);
                        checkBox(ctx, ri + 1, ci - 1);
                        checkBox(ctx, ri + 1, ci);
                        checkBox(ctx, ri + 1, ci + 1);
                    }
                }
            }
        }

        function success(ctx) {
            ctx._boxDOM.forEach((row, ri) => {
                row.forEach((box, ci) => {
                    box.classList.replace(Mine.CLASS_TYPE.UNCHECK, Mine.CLASS_TYPE.CHECKED);
                    const data = ctx._boxData[ri][ci];
                    if (data === Mine.TYPE.MINE) {
                        box.classList.remove(Mine.CLASS_TYPE.BOMB);
                        box.classList.add(Mine.CLASS_TYPE.MINE);
                    } else if (data > 0) {
                        box.innerText = data;
                    }
                });
            });
            setTimeout(() => {
                alert('你赢了');
            }, 500);
        }

        function gameOver(ctx) {
            ctx._boxDOM.forEach((row, ri) => {
                row.forEach((box, ci) => {
                    box.classList.replace(Mine.CLASS_TYPE.UNCHECK, Mine.CLASS_TYPE.CHECKED);
                    const data = ctx._boxData[ri][ci];
                    if (data === Mine.TYPE.MINE) {
                        box.classList.add(Mine.CLASS_TYPE.BOMB);
                    } else if (data > 0) {
                        box.innerText = data;
                    }
                });
            });
            setTimeout(() => {
                alert('你输了');
            }, 500);
        }

        container.addEventListener('click', (e) => {
            const { target } = e;
            const { ri, ci } = target.dataset;
            if (ri && ci)
                checkBox(this, +ri, +ci);
        });

        container.addEventListener('contextmenu', (e) => {
            const { target } = e;
            const classList = [...target.classList];
            if (!classList.includes(Mine.CLASS_TYPE.CHECKED)) {
                target.classList.toggle(Mine.CLASS_TYPE.FLAG);
            }
        });

        console.table(this._boxDOM);
    }

    setBoxData(r, c, { count, mine, flag, done }) {
        const box = this._boxData[r][c];
        if (count !== undefined) box.count = count;
        if (mine !== undefined) box.mine = mine;
        if (flag !== undefined) box.flag = flag;
        if (done !== undefined) box.done = done;
    }

    generateBox() {
        const box = document.createElement('div');
        box.classList.add('mine-box');
        return box;
    }

    generateArray(length, defaultValue) {
        if (typeof defaultValue === 'function')
            return new Array(length).fill(0).map(defaultValue);
        return new Array(length).fill(defaultValue || 0);
    }
}
