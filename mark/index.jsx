import React, { Component } from 'react';
import { CustomBreadcrumb } from '../../component'
import { Button, message } from 'antd';
import uuid from 'uuid';
import './style.less';

class Mark extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cursor: "default", //拖拽显示的小手
            canvas: {
                width: 0,
                height: 0
            }
        }
        this.canvas = null;
        this.ctx = null;
        this.marksArray = {};//存标注的数组
        this.selectMark = {};//选中的标注
        this.startX = 0;//起始x坐标
        this.startY = 0;//起始y坐标
        this.moveX = 0;//起始x坐标
        this.moveY = 0;//起始y坐标
        this.leftDistance = 0;//点击时左边的距离
        this.topDistance = 0; //点击时上边的距离
        this.op = 0;//op操作类型 0 无操作 1 画矩形框 2 拖动矩形框
        this.scaleStep = 1.1; // 缩放大小
        this.scale = 1; // 缩放大小
        this.flag = 0;//是否点击鼠标的标志
        this.minWidth = 0; //图片本身的宽
        this.minHeight = 0;//图片本身的高

    }
    componentDidMount() {
        const src = `http://169.254.112.82:8001/timg.jpg`;
        this.init(src);
        document.addEventListener("keydown", (e) => { this.keydown(e, this) });
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", (e) => { this.keydown(e, this) });
    }
    render() {
        const { canvas, cursor } = this.state;
        return (
            <div className="container">
                <CustomBreadcrumb arr={["标注"]} />
                <div className="content">
                    <div className="content_mark">
                        <div className="mark_canvas">
                            <canvas id="mark_canvas"
                                width={canvas.width}
                                height={canvas.height}
                                style={{ cursor }}
                                //  onMouseUp={e => this.mouseUpListener(e)}
                                onMouseDown={e => this.mouseDownMark(e)}
                                onMouseMove={e => this.mouseMoveMark(e)}
                                onWheel={e => this.changeScale(undefined, e)}
                            >
                                你的浏览器不支持canvas,请使用高版本chrome浏览器
                            </canvas >
                            <img id="canvas_img" crossOrigin="anonymous" ref={ref => (this.imgRef = ref)} src="http://169.254.112.82:8001/timg.jpg" alt="" />
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
                            <div>
                                <Button type="primary" shape="circle" icon="plus" onClick={() => {
                                    this.changeScale("plus")
                                }}>
                                </Button>
                                缩放
                                <Button type="primary" shape="circle" icon="minus" onClick={() => {
                                    this.changeScale("")
                                }}>
                                </Button>
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
        const img = new Image();   // 创建img元素
        img.setAttribute('crossOrigin', 'anonymous'); //设置可以访问不同域的图片，在生产url的时候需要
        img.onload = () => {
            this.canvas = document.getElementById('mark_canvas');
            // this.canvas.style.backgroundImage = `url(${src})`;
            // this.canvas.style.backgroundSize = `${img.width}px ${img.height}px`;
            this.setState({
                canvas: {
                    width: img.width,
                    height: img.height
                }
            });
            this.minWidth = img.width;
            this.minHeight = img.height;
            if (this.canvas.getContext) {
                this.ctx = this.canvas.getContext('2d');
                this.ctx.drawImage(img, 0, 0);
            }
        }
        img.src = src; // 设置图片源地址
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
        this.startX = offsetX / this.scale;
        this.startY = offsetY / this.scale;
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
        this.ctx.strokeStyle = "red";
        this.flag = 1;

    }
    /**
     * @description: 移动画布
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    mouseMoveMark(event) {
        event.persist();
        const { offsetX, offsetY } = event.nativeEvent;
        this.moveX = offsetX / this.scale;
        this.moveY = offsetY / this.scale;
        this.ctx.save();
        this.ctx.setLineDash([5]);
        this.setState({
            cursor: "default",
        });
        this.drawScreen(this.moveX, this.moveY);
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
            const maxX = this.state.canvas.width - this.selectMark.width;
            const maxY = this.state.canvas.height - this.selectMark.height;
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
    drawScreen(x, y) {
        const { canvas } = this.state;
        //清除画布
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(this.imgRef, 0, 0);
        if (this.flag && this.op === 1) {
            this.ctx.strokeRect(this.startX, this.startY, x - this.startX, y - this.startY);
        }
        this.ctx.restore();
        const { marksArray } = this;
        //在canvas上渲染节点
        let create = true;
        for (let key in marksArray) {
            if (marksArray.hasOwnProperty(key)) {
                this.ctx.beginPath();
                const mark = marksArray[key];
                const { x1, y1, x2, y2, width, height, strokeStyle } = mark;
                this.ctx.rect(x1, y1, width, height);
                this.ctx.strokeStyle = strokeStyle;
                if (x >= (x1 - 20 / this.scale) && x <= (x1 + 20 / this.scale)) {  //左侧
                    if ((y <= y2 - 20 / this.scale) && y >= (y1 + 20 / this.scale)) { //向左
                        this.resizeLeft(mark, x, y);
                    } else if (y <= (y1 + 20 / this.scale) && y >= (y1 - 20 / this.scale)) { //左上
                        this.resizeLT(mark, x, y);
                    } else if (y >= (y2 - 20 / this.scale) && y <= (y2 + 20 / this.scale)) { //左下
                        this.resizeLB(mark, x, y);
                    }
                } else if (x >= (x2 - 20 / this.scale) && x <= (x2 + 20 / this.scale)) { //右侧
                    if ((y <= y2 - 20 / this.scale) && y >= (y1 + 20 / this.scale)) { //向右
                        this.resizeRight(mark, x, y);
                    } else if ((y <= y2 + 20 / this.scale) && y >= (y2 - 20 / this.scale)) { //右下
                        this.resizeRB(mark, x, y);
                    } else if ((y <= y1 + 20 / this.scale) && y >= (y1 - 20 / this.scale)) { //右上
                        this.resizeRT(mark, x, y);
                    }
                } else if (x <= (x2 + 20 / this.scale) && x >= (x1 + 20 / this.scale)) {
                    if ((y <= y1 + 20 / this.scale) && y >= (y1 - 20 / this.scale)) { //向上
                        this.resizeTop(mark, x, y);
                    } else if ((y <= y2 + 20 / this.scale) && y >= (y2 - 20 / this.scale)) { //右下
                        this.resizeBottom(mark, x, y);
                    }
                }
                if (this.ctx.isPointInPath(x * this.scale, y * this.scale)) {
                    create = false;
                    this.dragMark(mark, x, y);
                }
                this.ctx.stroke();
            }
        }
        if (this.flag && this.op < 3 && create) {
            this.op = 1;
        }
    }
    /**
     * @description: 画布缩放
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    changeScale(type, e) {
        const { canvas } = this.state;
        let width, height;
        if (typeof e === "undefined") {
            if (type === "plus") {
                if (this.scale > 2) {
                    message.warning('已放大到最大宽度');
                    return;
                }
                width = canvas.width * this.scaleStep;
                height = canvas.height * this.scaleStep;
            } else {
                if (this.scale <= 1) {
                    message.warning('已经是原本图片大小');
                    return;
                }
                width = canvas.width / this.scaleStep;
                height = canvas.height / this.scaleStep;
            }
        } else {
            e.persist();
            const { deltaY } = e;
            if (deltaY > 0) {
                if (this.scale <= 1) {
                    return;
                }
                width = canvas.width / this.scaleStep;
                height = canvas.height / this.scaleStep;
            } else {
                if (this.scale > 2) {
                    return;
                }
                width = canvas.width * this.scaleStep;
                height = canvas.height * this.scaleStep;
            }
        }
        this.setState(
            {
                canvas: {
                    width,
                    height,
                }
            }, () => {
                this.imgRef.style.width = `${width}px`;
                this.imgRef.style.height = `${height}px`;
                this.scale = height / this.minHeight;
                this.ctx.scale(this.scale, this.scale);
                this.drawScreen();
            });
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
                x2: this.moveX,
                y2: this.moveY,
                strokeStyle: 'red',
            });
        } else if (this.op >= 3) {
            this.marksArray[this.selectMark["id"]] = this.fixPosition(this.selectMark);
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
        const url = this.canvas.toDataURL();
        const oA = document.createElement("a");
        oA.download = new Date().getTime();// 设置下载的文件名，默认是'下载'
        oA.href = url;
        document.body.appendChild(oA);
        oA.click();
        oA.remove(); // 下载之后把创建的元素删除
    };
    /**
     * @description: 删除
     * @param {type} 
     * @return: 
     * @author: yetm
     */
    delMark() {
        const { marksArray, selectMark } = this;
        if (selectMark) {
            delete marksArray[selectMark["id"]];
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
    }
}
export default Mark