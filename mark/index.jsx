import React, { Component } from 'react';
import { CustomBreadcrumb } from '../../../component'
import { Button, message } from 'antd';
import uuid from 'uuid';
import router from 'umi/router';
import './style.less';

class Mark extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cursor: "default", //拖拽显示的小手
            canvasWidth: undefined,
            canvasHeight: undefined,
        }
        this.canvas = null;
        this.ctx = null;
        this.marksArray = {};//存标注的数组
        this.selectMark = {};//选中的标注
        this.startX = 0;//起始x坐标
        this.startY = 0;//起始y坐标
        this.moveX = 0;//移动x坐标
        this.moveY = 0;//移动y坐标
        this.moveingX = 0;//移动中x坐标
        this.moveingY = 0;//移动中y坐标
        this.canvasX = 0;//图片在画布上的起始位置
        this.canvasY = 0;
        this.scaleX = 0;//缩放时滚轮的坐标
        this.scaleY = 0;
        this.leftDistance = 0;//点击时左边的距离
        this.topDistance = 0; //点击时上边的距离
        this.op = 0;//op操作类型 0 无操作 1 画矩形框 2 拖动矩形框
        this.scale = 1; // 缩放大小
        this.scaleing = 1; // 缩放之前的大小
        this.flag = 0;//是否点击鼠标的标志
        this.draw = false; //是否按下a键
        this.img = undefined; //加载的照片


    }
    componentDidMount() {
        const src = `http://169.254.112.82:3000/DJI_0008.JPG`;
        this.init(src);
        document.addEventListener("keydown", (e) => {
            this.keydown(e, this)
        });
        document.addEventListener("keypress", (e) => {
            this.keypress(e, this)
        });
        document.addEventListener("keyup", (e) => {
            this.keyup(e, this)
        });
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", (e) => { this.keydown(e, this) });
        document.removeEventListener("keypress", (e) => { this.keypress(e, this) });
        document.removeEventListener("keyup", (e) => { this.keyup(e, this) });
    }
    render() {
        const { cursor, canvasWidth, canvasHeight } = this.state;
        return (
            <div className="container">
                <CustomBreadcrumb arr={["检查员标注"]} />
                <div className="content">
                    <div className="content_mark">
                        <div className="mark_canvas">
                            <div className="canvas_fa" id="canvas_fa">
                                <canvas id="mark_canvas"
                                    width={canvasWidth}
                                    height={canvasHeight}
                                    style={{ cursor }}
                                    //  onMouseUp={e => this.mouseUpListener(e)}
                                    onMouseDown={e => this.mouseDownMark(e)}
                                    onMouseMove={e => this.mouseMoveMark(e)}
                                    onWheel={e => this.changeScale(e)}
                                >
                                    你的浏览器不支持canvas,请使用高版本chrome浏览器
                            </canvas >
                            </div>
                        </div>
                        <div className="mark_action">
                            <div className="action_add">
                                <div className="add_move">
                                    <Button type="primary" onClick={() => {
                                        this.downLoad();
                                    }}>
                                        保存
                                </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
        /**
         * @description: 页面进入时加载canvas,canvas大小为图片的大小
         * @param {type} 
         * @return: 
         * @author: yetm
         */
    }
    init(src) {
        this.img = new Image();   // 创建img元素
        this.img.setAttribute('crossOrigin', 'anonymous'); //设置可以访问不同域的图片，在生产url的时候需要
        this.img.onload = () => {
            this.canvas = document.getElementById('mark_canvas');
            const canvas_fa = document.getElementById('canvas_fa');
            this.setState({
                canvasWidth: canvas_fa.offsetWidth,
                canvasHeight: canvas_fa.offsetHeight,
            });
            if (this.canvas.getContext) {
                this.ctx = this.canvas.getContext('2d');
                this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.canvasX, this.canvasY, this.img.width, this.img.height);
            }
        }
        this.img.src = src; // 设置图片源地址
        window.addEventListener('mouseup', this.mouseUpListener);

    }
    /**
* @description: 向左拉
* @param {type}
* @return:
* @author: yetm
*/
    resizeLeft(rect, x, y) {
        this.setState({
            cursor: "w-resize",
        });
        if (this.flag && this.op === 0) { this.op = 3; }
        if (this.flag && this.op === 3) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.x1 = x;
            this.selectMark.width = this.selectMark.x2 - this.selectMark.x1;
        }
    }
    /**
    * @description: 向左上
    * @param {type}
    * @return:
    * @author: yetm
    */
    resizeLT(rect, x, y) {
        this.setState({
            cursor: "se-resize",
        });
        if (this.flag && this.op === 0) { this.op = 4; }
        if (this.flag && this.op === 4) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.x1 = x;
            this.selectMark.y1 = y;
            this.selectMark.width = this.selectMark.x2 - this.selectMark.x1;
            this.selectMark.height = this.selectMark.y2 - this.selectMark.y1;
        }
    }
    /**
   * @description: 向左下
   * @param {type}
   * @return:
   * @author: yetm
   */
    resizeLB(rect, x, y) {
        this.setState({
            cursor: "ne-resize",
        });
        if (this.flag && this.op === 0) { this.op = 5; }
        if (this.flag && this.op === 5) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.x1 = x;
            this.selectMark.y2 = y;
            this.selectMark.width = this.selectMark.x2 - this.selectMark.x1;
            this.selectMark.height = this.selectMark.y2 - this.selectMark.y1;
        }
    }
    /**
    * @description: 向左下
    * @param {type}
    * @return:
    * @author: yetm
    */
    resizeRight(rect, x, y) {
        this.setState({
            cursor: "w-resize",
        });
        if (this.flag && this.op === 0) { this.op = 6; }
        if (this.flag && this.op === 6) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.x2 = x;
            this.selectMark.width = this.selectMark.x2 - this.selectMark.x1;
        }
    }
    /**
    * @description: 向右下
    * @param {type}
    * @return:
    * @author: yetm
    */
    resizeRB(rect, x, y) {
        this.setState({
            cursor: "se-resize",
        });
        if (this.flag && this.op === 0) { this.op = 7; }
        if (this.flag && this.op === 7) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.x2 = x;
            this.selectMark.y2 = y;
            this.selectMark.width = this.selectMark.x2 - this.selectMark.x1;
            this.selectMark.height = this.selectMark.y2 - this.selectMark.y1;
        }
    }
    /**
   * @description: 向右下
   * @param {type}
   * @return:
   * @author: yetm
   */
    resizeRT(rect, x, y) {
        this.setState({
            cursor: "ne-resize",
        });
        if (this.flag && this.op === 0) { this.op = 8; }
        if (this.flag && this.op === 8) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.x2 = x;
            this.selectMark.y1 = y;
            this.selectMark.width = this.selectMark.x2 - this.selectMark.x1;
            this.selectMark.height = this.selectMark.y2 - this.selectMark.y1;
        }
    }
    /**
    * @description: 向上
    * @param {type}
    * @return:
    * @author: yetm
    */
    resizeTop(rect, x, y) {
        this.setState({
            cursor: "s-resize",
        });
        if (this.flag && this.op === 0) { this.op = 9; }
        if (this.flag && this.op === 9) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.y1 = y;
            this.selectMark.height = this.selectMark.y2 - this.selectMark.y1;
        }
    }
    /**
  * @description: 向下
  * @param {type}
  * @return:
  * @author: yetm
  */
    resizeBottom(rect, x, y) {
        this.setState({
            cursor: "s-resize",
        });
        if (this.flag && this.op === 0) { this.op = 10; }
        if (this.flag && this.op === 10) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            this.selectMark.y2 = y;
            this.selectMark.height = this.selectMark.y2 - this.selectMark.y1;
        }
    }
    /**
     * @description: 点击画布，获取点击时的相对画布的坐标，判断是否标记里面
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    mouseDownMark(event) {
        event.persist();
        const { offsetX, offsetY } = event.nativeEvent;
        this.startX = offsetX;
        this.startY = offsetY;
        this.moveX = offsetX;
        this.moveY = offsetY;
        const { marksArray } = this;
        for (const key in marksArray) {
            if (marksArray.hasOwnProperty(key)) {
                const mark = marksArray[key];
                const { x1, y1, x2, y2 } = mark;
                if (this.startX > x1 && this.startX < x2 && this.startY > y1 && this.startY < y2) {
                    this.selectMark = mark;
                    //判断鼠标是否保持在节点上
                    this.leftDistance = this.startX - x1;
                    this.topDistance = this.startY - y1;
                    break;
                }
            }
        }
        this.flag = 1;
    }
    /**
     * @description: 移动画布
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    mouseMoveMark(event) {
        if (this.flag) {
            event.persist();
            const { offsetX, offsetY } = event.nativeEvent;
            this.moveingX = offsetX;
            this.moveingY = offsetY;
            if (this.draw) {
                this.ctx.strokeStyle = "red";
                this.ctx.save();
                this.ctx.setLineDash([5]);
                this.setState({
                    cursor: "default",
                });
            }
            this.drawScreen();
        }
    }
    /**
    * @description: 固定画布的位置
    * @param {type}
    * @return:
    * @author: yetm
    */
    fixPosition(position) {
        const mark = { ...position };
        if (position.x1 > position.x2) {
            mark.x1 = position.x2;
            mark.x2 = position.x1;

        }
        if (position.y1 > position.y2) {
            mark.y1 = position.y2;
            mark.y2 = position.y1;
        }
        mark.width = mark.x2 - mark.x1;
        mark.height = mark.y2 - mark.y1;
        mark.scale = this.scale;
        mark.canvasX = this.canvasX;
        mark.canvasY = this.canvasY;
        mark.firstx1 = mark.x1;
        mark.firstx2 = mark.x2;
        mark.firsty1 = mark.y1;
        mark.firsty2 = mark.y2;
        return mark;
    }

    /**
    * @description: 移动
    * @param {type}
    * @return:
    * @author: yetm
    */
    dragMark(rect, x, y) {
        this.setState({
            cursor: 'move'
        });
        if (this.flag && this.op === 0) { this.op = 2; }
        if (this.flag && this.op === 2) {
            if (!this.selectMark) {
                this.selectMark = rect;
            }
            const minX = 0;
            const minY = 0;
            const maxX = this.img.width - this.selectMark.width;
            const maxY = this.img.height - this.selectMark.height;
            let posX = x - this.leftDistance;
            posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
            let posY = y - this.topDistance;
            posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);
            this.selectMark.x2 = this.selectMark.x2 - this.selectMark.x1 + posX;
            this.selectMark.x1 = posX;
            this.selectMark.y2 = this.selectMark.y2 - this.selectMark.y1 + posY;
            this.selectMark.y1 = posY;
        }
    }
    /**
     * @description: 重绘画布 
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    drawScreen(change) {
        const { canvasWidth, canvasHeight } = this.state;
        let mx = 0;
        let my = 0;
        //不按a和鼠标点击
        if (!this.draw && this.flag) {
            //算出与前一次的偏移量
            let canvasX = this.canvasX + (this.moveingX - this.moveX);
            let canvasY = this.canvasY + (this.moveingY - this.moveY);
            //画布的起始坐标的范围
            if (canvasX < (this.img.width * (-this.scale) + canvasWidth)) {
                canvasX = this.img.width * (-this.scale) + canvasWidth;
            } else if (canvasX > 0) {
                canvasX = 0;
            }
            if (canvasY < (this.img.height * (-this.scale) + canvasHeight)) {
                canvasY = this.img.height * (-this.scale) + canvasHeight;
            } else if (canvasY > 0) {
                canvasY = 0;
            }
            mx = canvasX - this.canvasX;
            my = canvasY - this.canvasY;
            this.canvasX = canvasX;
            this.canvasY = canvasY;
            this.moveX = this.moveingX;
            this.moveY = this.moveingY;
        }
        //清除画布
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // 缩放时
        if (change === "scale") {
            this.canvasX = this.scaleChange(this.canvasX, "x");
            this.canvasY = this.scaleChange(this.canvasY, "y");
        }
        this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.canvasX, this.canvasY, this.img.width * this.scale, this.img.height * this.scale);
        if (this.flag && this.op === 1 && this.draw) {
            this.ctx.strokeRect(this.startX, this.startY, this.moveingX - this.startX, this.moveingY - this.startY);
        }
        this.ctx.restore();
        const { marksArray } = this;
        //在canvas上渲染节点
        let create = true;
        for (let key in marksArray) {
            if (marksArray.hasOwnProperty(key)) {
                this.ctx.beginPath();
                const mark = marksArray[key];
                if (change !== "create") {
                    mark.x1 += mx;
                    mark.y1 += my;
                    mark.x2 += mx;
                    mark.y2 += my;
                    if (change === "scale") {
                        mark.x1 = this.scaleChange(mark.x1, "x");
                        mark.y1 = this.scaleChange(mark.y1, "y");
                        mark.x2 = this.scaleChange(mark.x2, "x");
                        mark.y2 = this.scaleChange(mark.y2, "y");
                    }
                }
                const { x1, y1, x2, y2, width, height, strokeStyle, scale } = mark;
                this.ctx.rect(x1, y1, width * this.scale / scale, height * this.scale / scale);
                this.ctx.strokeStyle = strokeStyle;
                if (this.draw) {
                    if (this.moveingX >= (x1 - 20) && this.moveingX <= (x1 + 20)) {  //左侧
                        if ((this.moveingY <= y2 - 20) && this.moveingY >= (y1 + 20)) { //向左
                            this.resizeLeft(mark, this.moveingX, this.moveingY);
                        } else if (this.moveingY <= (y1 + 20) && this.moveingY >= (y1 - 20)) { //左上
                            this.resizeLT(mark, this.moveingX, this.moveingY);
                        } else if (this.moveingY >= (y2 - 20) && this.moveingY <= (y2 + 20)) { //左下
                            this.resizeLB(mark, this.moveingX, this.moveingY);
                        }
                    } else if (this.moveingX >= (x2 - 20) && this.moveingX <= (x2 + 20)) { //右侧
                        if ((this.moveingY <= y2 - 20) && this.moveingY >= (y1 + 20)) { //向右
                            this.resizeRight(mark, this.moveingX, this.moveingY);
                        } else if ((this.moveingY <= y2 + 20) && this.moveingY >= (y2 - 20)) { //右下
                            this.resizeRB(mark, this.moveingX, this.moveingY);
                        } else if ((this.moveingY <= y1 + 20) && this.moveingY >= (y1 - 20)) { //右上
                            this.resizeRT(mark, this.moveingX, this.moveingY);
                        }
                    } else if (this.moveingX <= (x2 + 20) && this.moveingX >= (x1 + 20)) {
                        if ((this.moveingY <= y1 + 20) && this.moveingY >= (y1 - 20)) { //向上
                            this.resizeTop(mark, this.moveingX, this.moveingY);
                        } else if ((this.moveingY <= y2 + 20) && this.moveingY >= (y2 - 20)) { //右下
                            this.resizeBottom(mark, this.moveingX, this.moveingY);
                        }
                    }
                    if (this.ctx.isPointInPath(this.moveingX, this.moveingY)) {
                        create = false;
                        this.dragMark(mark, this.moveingX, this.moveingY);
                    }
                }
                this.ctx.stroke();
            }
        }
        if (this.flag && this.op < 3 && create && this.draw) {
            this.op = 1;
        }
    }
    /**
     * @description: 滚轮缩放的算法
     * 1,画布是不动的,图片怎么放大
     * 2,以原点放大N倍
     * 3,将放大的图向左上平移，最终使放大的图片在画布中合适位置。先把鼠标位置相对原图的位置计算出来，然后以该点为中心重新进行缩放
     * 4,最重要的就是计算左上平移
     * @param {type}n是当前坐标，type是X或Y轴
     * @return: 
     * @author: yetm
     */
    scaleChange(n, type) {
        const scale = type === "x" ? this.scaleX : this.scaleY;
        const newN = parseFloat(((scale - n) / this.scaleing).toFixed(2), 10);
        //相对原来画布左上移动的位置(1 - this.scale) * newN 加上相对于之前点的位置的偏移量
        return ((1 - this.scale) * newN + (scale - newN));
    }
    /**
     * @description: 缩小到1
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    reScale(n, scaleing) {
        const newN = parseFloat(((-n) / scaleing).toFixed(2), 10);
        return -newN;
    }
    /**
     * @description: 画布缩放 

     * @param {type} 
     * @return: 
     * @author: yetm
     */
    changeScale(e) {
        e.persist();
        const { offsetX, offsetY } = e.nativeEvent;
        this.scaleX = offsetX;
        this.scaleY = offsetY;
        const { deltaY } = e;
        if (deltaY > 0) {
            this.scale -= 0.1;
            if (this.scale < 1) {
                this.scale = 1;
            }
        } else {
            this.scale += 0.1;
        }
        this.scale = parseFloat(this.scale.toFixed(1), 10);
        this.drawScreen("scale");
        this.scaleing = this.scale;
    }
    /**
     * @description: 鼠标释放
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    mouseUpListener = () => {
        if (this.op === 1) {
            const id = uuid();
            this.marksArray[id] = this.fixPosition({
                id,
                x1: this.startX,
                y1: this.startY,
                x2: this.moveingX,
                y2: this.moveingY,
                strokeStyle: 'red',
            });
            this.drawScreen("create");

        } else if (this.op >= 3) {
            this.marksArray[this.selectMark["id"]] = this.fixPosition(this.selectMark);
            this.drawScreen();
        }
        this.flag = 0;
        this.op = 0;
    };
    /**
    * @description: 下载
    * @param {type}
    * @return:
    * @author: yetm
    */
    downLoad() {
        try {
            const marks = {};
            console.log("this.marksArray", this.marksArray);
            for (const key in this.marksArray) {
                if (this.marksArray.hasOwnProperty(key)) {
                    const item = this.marksArray[key];
                    const { firstx1, firsty1, firstx2, firsty2, width, height, strokeStyle, scale, canvasX, canvasY } = item;
                    marks[key] = {
                        x1: parseFloat((this.reScale(firstx1, scale) - this.reScale(canvasX, scale)), 10),
                        y1: parseFloat((this.reScale(firsty1, scale) - this.reScale(canvasY, scale)), 10),
                        x2: parseFloat((this.reScale(firstx2, scale) - this.reScale(canvasX, scale)), 10),
                        y2: parseFloat((this.reScale(firsty2, scale) - this.reScale(canvasY, scale)), 10),
                        strokeStyle,
                        width,
                        height,
                        scale,
                    };
                }
            }
            localStorage.removeItem("marks");
            localStorage.setItem("marks", JSON.stringify(marks));
            router.push('/data/check');
            // const url = this.canvas.toDataURL();
            // const oA = document.createElement("a");
            // oA.download = new Date().getTime();// 设置下载的文件名，默认是'下载'
            // oA.href = url;
            // document.body.appendChild(oA);
            // oA.click();
            // oA.remove(); // 下载之后把创建的元素删除
        }
        catch (err) {
            console.log(111, err);
        }

    };
    /**
    * @description: 下载方法
    * @param {type} 文件链接可以是一个dataURL 也可以是一个 blob 对象
    * @return: 
    * @author: yetm
    */
    downloadImg(imgSrc, imgName) {
        const elem = document.createElement('a');
        elem.setAttribute('href', imgSrc);
        elem.setAttribute('download', imgName);
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
    /**
    * @description: 下载
    * @param {type}
    * @return:
    * @author: yetm
    */
    // downLoad() {
    //     try {
    //         const marks = JSON.parse(localStorage.getItem("marks"));
    //         const canvas = document.createElement("canvas");
    //         const width = this.img.width;
    //         const height = this.img.height;
    //         const rate = 1; //(width < height ? width / height : height / width) / 4;
    //         canvas.width = width * rate;
    //         canvas.height = height * rate;
    //         console.log("canvas", canvas);
    //         const ctx = canvas.getContext("2d");
    //         // 按比例压缩倍
    //         ctx.drawImage(this.img, 0, 0, width, height, 0, 0, width * rate, height * rate);
    //         for (let key in marks) {
    //             if (marks.hasOwnProperty(key)) {
    //                 ctx.beginPath();
    //                 const mark = marks[key];
    //                 const { x1, y1, width, height, strokeStyle, scale } = mark;
    //                 ctx.rect(x1, y1, width / scale, height / scale);
    //                 ctx.strokeStyle = strokeStyle;
    //                 ctx.stroke();
    //             }
    //         }
    //         canvas.toBlob((blob) => {
    //             let imgSrc = window.URL.createObjectURL(blob);
    //             let imgName = `${new Date().getTime()}.jpg`;
    //             this.downloadImg(imgSrc, imgName);
    //             window.URL.revokeObjectURL(imgSrc);
    //         }, 'image/jpg', 0.9);
    //     }
    //     catch (err) {
    //         console.log(111, err);
    //     }
    // };
    /**
     * @description: 删除
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    delMark() {
        const { marksArray, selectMark } = this;
        if (JSON.stringify(selectMark) !== "{}") {
            delete marksArray[selectMark["id"]];
            this.selectMark = {};
            this.drawScreen();
        } else {
            message.warning('请先选择一个标注');
        }
    };
    /**
     * @description: 键盘事件
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    keydown(e, that) {
        const { keyCode } = e;
        switch (keyCode) {
            case 46:
                that.delMark();
                break;
            default:
                break;
        }
    };
    keypress(e, that) {
        const { keyCode } = e;
        switch (keyCode) {
            case 97:
                that.draw = true;
                break;
            default:
                break;
        }
    };
    /**
     * @description: 键盘事件
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    keyup(e, that) {
        const { keyCode } = e;
        switch (keyCode) {
            case 65:
                that.draw = false;
                that.mouseUpListener();
                break;
            default:
                break;
        }
    };
}
export default Mark