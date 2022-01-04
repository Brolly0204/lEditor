// XDom 主类
import $ from '../dom';
import { getElementLeft, getElementTop } from '../tools/el';
import color from '../tools/color';
import svgFn from '../tools/svg';
import { isTwoArray } from '../tools/typeof';

// 小圆点的固定宽高边框阴影
const dot = 5;
// 外框的内边距
const colorPadding = 8;
// 小点最大移动的距离
const dotMaxX = 172 - 5;
const dotMaxY = 172 - 5;
// hue 最大的 top
const hueMaxY = 172 - 3;
const hueNumber = 10;
// 颜色对话框对象
let $colorDialog = {
  remove() {},
};
/**
* XMenuColorBase 对象
* fontcolor|backcolor 继承
* @example
* new XMenuColorBase(editor);
*/
const XMenuColorBase = class {
  /**
   * 构造函数
   *
   * @param {Object} editor 编辑器的对象
   * @param {String} type 什么类型，如 backcolor
   */
  constructor(editor, type) {
    this.editor = editor;
    this.$editor = editor.$editor;
    this.cfg = editor.cfg;
    this.type = type;
    this.$doc = $(document);
    this.hsb = {
      h: 0,
      s: 100,
      b: 100,
    };
    this.rgb = {
      r: 255,
      g: 255,
      b: 255,
    };
    // 默认颜色
    this.defaultHex = 'ffffff';
    // 重置一下
    this.reset();
    // 初始化
    this.create();
  }

  create() {
    const { cfg, type, editor } = this;
    const { lang } = cfg;
    this.$tem = $(`<a id="xe-${type}${editor.uid}" href="javascript:void('${lang[type]}');" title="${lang[type]}" class="xe-menu-link xe-menu-link-font"><?xml version="1.0" encoding="UTF-8"?></a>`);
    svgFn(this.$tem, type);
  }

  bind() {
    const { type, editor, cfg } = this;
    const {
      mode,
    } = cfg.color;
    $(`#xe-${type}${editor.uid}`).on('click', () => {
      const { selection, code } = editor;
      // 如果是源代码
      if (code) {
        return;
      }
      // 只有选中了才有效果
      if (!selection.isSelectionEmpty()) {
        if (mode === 'palette') {
          this.createPalette();
        } else {
          this.panel();
          this.setColor();
        }
      }
    });
  }
  // 创建颜色板
  createPalette() {
    const { uid, cfg, menu } = this.editor;
    const {
      base,
      standard,
      baseplaceholder,
      standardplaceholder,
      diyplaceholder,
      okplaceholder,
      clearplaceholder,
    } = cfg.color;

    this.remove();

    const itemWidth = 14;
    const itemMarginRight = 2;
    const paletteWidth = (base.length * itemWidth) + ((base.length - 1) * itemMarginRight);

    const $palette = $(`<div id="xe-palette${uid}" class="xe-palette" style="top: ${menu.$menu.css('height')}; width: ${paletteWidth + 20}px"></div>`);
    this.$editor.append($palette);
    $colorDialog = $(`#xe-palette${uid}`);

    const $close = $(`<a id="xe-dialog-close${uid}" href="javascript:;" class="xe-dialog-close-btn">
      <i class="xe-dialog-close"></i>
    </a>`);
    $colorDialog.append($close);
    $(`#xe-dialog-close${uid}`).on('click', () => {
      this.remove();
    });

    const $header = $(`<div class="xe-dialog-header">
      <a href="javascript:;" class="xe-dialog-title xe-dialog-title-active">${cfg.lang[this.type]}</a>
    </div>`);
    $colorDialog.append($header);

    const $title1 = $(`<div class="xe-palette-title">${baseplaceholder}</div>`);
    $colorDialog.append($title1);
    // 主体颜色的盒子
    const $main = $(`<div id="xe-palette-main${uid}" class="xe-palette-main"></div>`);
    $colorDialog.append($main);
    this.$main = $(`#xe-palette-main${uid}`);

    // 渲染主题色 start
    let colorMainHtml = '';

    if (isTwoArray(base)) {
      base.forEach((baseColor) => {
        colorMainHtml += '<ul class="xe-palette-list">';
        baseColor.forEach((specificColor) => {
          colorMainHtml += `<li class="xe-palette-item" color="${specificColor}" style="background:
      ${specificColor};"></li>`;
        });
        colorMainHtml += '</ul>';
      });
    } else {
      base.forEach((baseColor) => {
        colorMainHtml += '<ul class="xe-palette-list">';
        for (let i = 0; i < hueNumber; i++) {
          colorMainHtml += `<li class="xe-palette-item" color="${color
            .colorPalette(baseColor, i + 1)}" style="background:
      ${color.colorPalette(baseColor, i + 1)};"></li>`;
        }
        colorMainHtml += '</ul>';
      });
    }
    this.$main.html(colorMainHtml);
    // 渲染主题色 end
    const $title2 = $(`<div class="xe-palette-title">${standardplaceholder}</div>`);
    $colorDialog.append($title2);
    // 标准颜色的盒子
    const $standard = $(`<ul id="xe-palette-standard${uid}" class="xe-palette-standard"></ul>`);
    $colorDialog.append($standard);
    this.$standard = $(`#xe-palette-standard${uid}`);
    // 渲染标准色
    let colorStandardHtml = '';
    standard.forEach((standardColor) => {
      const border = standardColor === '#ffffff' ? 'border: 1px solid #dcdcdc;width: 12px;height: 12px;' : '';
      colorStandardHtml += `<li class="xe-palette-standard-item" color="${standardColor}" style="background: ${standardColor};${border}"></li>`;
    });
    this.$standard.html(colorStandardHtml);
    // 自定义颜色
    const $title3 = $(`<div class="xe-palette-title">${diyplaceholder}</div>`);
    $colorDialog.append($title3);
    const $diyBoxTem = $(`<div id="xe-palette-diy${uid}" class="xe-palette-diy">
      <div id="xe-palette-diy-box${uid}" class="xe-palette-diy-box"></div>
    </div>`);
    $colorDialog.append($diyBoxTem);
    this.$diy = $(`#xe-palette-diy${uid}`);
    this.$diyBox = $(`#xe-palette-diy-box${uid}`);
    const $diyIcon = $('<span class="xe-palette-diy-icon">#</span>');
    this.$diyBox.append($diyIcon);
    const $diyInputTem = $(`<input id="xe-palette-diy-input${uid}" type="tel" maxlength="6" size="6" class="xe-palette-diy-input">`);
    this.$diyBox.append($diyInputTem);
    this.$diyInput = $(`#xe-palette-diy-input${uid}`);
    const $diyOkTem = $(`<a id="xe-palette-ok${uid}" class="xe-palette-ok" href="javascript:;">${okplaceholder}</a>`);
    this.$diy.append($diyOkTem);
    this.$diyOk = $(`#xe-palette-ok${uid}`);
    const $diyClearTem = $(`<a id="xe-palette-clear${uid}" class="xe-palette-ok" href="javascript:;">${clearplaceholder}</a>`);
    this.$diy.append($diyClearTem);
    this.$diyClear = $(`#xe-palette-clear${uid}`);

    this.$link = $(`#xe-${this.type}${uid} g`);

    // 获取当前颜色
    this.getColor();
    // 绑定事件
    $colorDialog.on('click', 'li', (ev) => {
      this.subPalette($(ev.target).attr('color'));
    });
    this.$diyOk.on('click', () => {
      this.subPalette();
    });
    this.$diyClear.on('click', () => {
      this.subPalette('#ffffff');
    });
  }
  // 颜色板出来的时候获取一下当前颜色
  getColor() {
    const { selection } = this.editor;
    const $range = selection.getSelectionContainerElem(selection.getRange());
    if ($range) {
      this.oldColor = $range.css(this.type === 'backcolor' ? 'background' : 'color');
    }
  }
  // 确定
  subPalette(value) {
    const { editor } = this;
    const { selection, text } = editor;
    // 恢复选区，不然添加不上
    selection.restoreSelection();

    const type = this.type.replace(/(c)o/, $1 => `${$1[0].toUpperCase()}${$1[1]}`);

    text.handle(type, value || `#${this.$diyInput.val()}`);
    this.remove();
  }
  // 设置当前颜色
  setColor() {
    const { selection } = this.editor;
    const $range = selection.getSelectionContainerElem(selection.getRange());
    if ($range) {
      const oldColor = $range.css(this.type === 'backcolor' ? 'background' : 'color');
      this.setOldColor(oldColor);
    }
  }
  // 创建颜色面板
  panel() {
    const { uid, cfg, menu } = this.editor;

    this.remove();

    const $dialog = $(`<div id="xe-dialog${uid}" class="xe-dialog" style="top: ${menu.$menu.css('height')}"></div>`);
    this.$editor.append($dialog);
    $colorDialog = $(`#xe-dialog${uid}`);

    const $close = $(`<a id="xe-dialog-close${uid}" href="javascript:;" class="xe-dialog-close-btn">
      <i class="xe-dialog-close"></i>
    </a>`);
    $colorDialog.append($close);
    $(`#xe-dialog-close${uid}`).on('click', () => {
      this.remove();
    });

    const $header = $(`<div class="xe-dialog-header">
      <a href="javascript:;" class="xe-dialog-title xe-dialog-title-active">${cfg.lang[this.type]}</a>
    </div>`);
    $colorDialog.append($header);

    const $box = $(`<div id="xe-dialog-box${uid}" class="xe-dialog-color-box">`);
    $colorDialog.append($box);
    this.$box = $(`#xe-dialog-box${uid}`);

    const $color = $(`<div id="xe-dialog-color${uid}" class="xe-dialog-color" style="background-color: ${this.color};">
      <div id="xe-dialog-inner${uid}" class="xe-dialog-color-inner"></div>
    </div>`);
    this.$box.append($color);
    this.$inner = $(`#xe-dialog-inner${uid}`);
    this.$color = $(`#xe-dialog-color${uid}`);

    const $hue = $(`<div id="xe-dialog-hue${uid}" class="xe-dialog-color-hue">
      <div id="xe-dialog-move${uid}" class="xe-dialog-color-hue-move"></div>
    </div>`);
    this.$box.append($hue);
    this.$move = $(`#xe-dialog-move${uid}`);

    const $left = $('<i class="xe-dialog-color-hue-left"></i>');
    this.$move.append($left);

    const $right = $('<i class="xe-dialog-color-hue-right"></i>');
    this.$move.append($right);

    const $handle = $('<div class="xe-dialog-color-handle"></div>');

    const $show = $(`<div class="xe-dialog-color-show-color">
      <div id="xe-dialog-new${uid}" class="xe-dialog-color-new-color" style="background: ${this.newColor};"></div>
    </div>`);

    const $old = $(`<div id="xe-dialog-old${uid}" class="xe-dialog-color-old-color" style="background: ${this.oldColor};"></div>`);
    $show.append($old);

    $handle.append($show);

    const $fieldR = $(`<div class="xe-dialog-color-field">
      <p class="xe-dialog-color-title">R</p>
    </div>`);

    const $r = $(`<input id="xe-dialog-r${uid}" type="tel" maxlength="3" size="3" class="xe-dialog-color-inp">`);
    $fieldR.append($r);
    $handle.append($fieldR);

    const $fieldG = $(`<div class="xe-dialog-color-field">
      <p class="xe-dialog-color-title">G</p>
    </div>`);

    const $g = $(`<input id="xe-dialog-g${uid}" type="tel" maxlength="3" size="3" class="xe-dialog-color-inp">`);
    $fieldG.append($g);
    $handle.append($fieldG);

    const $fieldB = $(`<div class="xe-dialog-color-field">
      <p class="xe-dialog-color-title">B</p>
    </div>`);

    const $b = $(`<input id="xe-dialog-b${uid}" type="tel" maxlength="3" size="3" class="xe-dialog-color-inp">`);
    $fieldB.append($b);
    $handle.append($fieldB);

    const $fieldWrite = $(`<div class="xe-dialog-color-field">
      <p class="xe-dialog-color-title">#</p>
    </div>`);

    const $write = $(`<input id="xe-dialog-w${uid}" type="tel" maxlength="6" size="6" class="xe-dialog-color-inp">`);
    $fieldWrite.append($write);
    $handle.append($fieldWrite);

    const $fieldSub = $(`<a id="xe-dialog-sub${uid}" class="xe-dialog-color-sub" href="javascript:;">确定</a>`);
    $handle.append($fieldSub);

    this.$box.append($handle);

    $(`#xe-dialog-sub${uid}`).on('click', () => {
      this.subPanel();
    });

    this.$r = $(`#xe-dialog-r${uid}`).on('input', () => {
      this.writeColor();
    });
    this.$g = $(`#xe-dialog-g${uid}`).on('input', () => {
      this.writeColor();
    });
    this.$b = $(`#xe-dialog-b${uid}`).on('input', () => {
      this.writeColor();
    });
    this.$w = $(`#xe-dialog-w${uid}`).on('input', () => {
      this.writeColor('hex');
    });
    this.$new = $(`#xe-dialog-new${uid}`);
    this.$old = $(`#xe-dialog-old${uid}`).on('click', () => {
      this.setOldColor(this.oldColor);
    });
    this.$hue = $(`#xe-dialog-hue${uid}`);

    this.$link = $(`#xe-${this.type}${uid} g`);

    this.someEvent();
    this.setRgbVal();
  } // end panel
  setOldColor(value) {
    const rgbMatch = value.match(/rgba?\((.+)\)/);
    if (rgbMatch[1]) {
      const rgb = rgbMatch[1].split(',');
      const hex = color.rgbToHex({
        r: rgb[0] - 0,
        g: rgb[1] - 0,
        b: rgb[2] - 0,
      });
      this.setPanelColor(hex);
    }
  }
  // 输入色值
  writeColor(type = 'rgb') {
    const r = this.$r.val() - 0;
    const g = this.$g.val() - 0;
    const b = this.$b.val() - 0;
    const w = this.$w.val();
    this.updateOld();

    if (type === 'rgb') {
      /* eslint-disable */
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const hex = color.rgbToHex({
          r,
          g,
          b,
        });
        this.$w.val(hex);
        this.setPanelColor(`#${hex}`);
      }
    } else {
      const rgb = color.hexToRgb(w);
      this.$r.val(rgb.r);
      this.$g.val(rgb.g);
      this.$b.val(rgb.b);
      this.setPanelColor(w);
    }
  }
  // 设置初始颜色
  setPanelColor(newColor) {
    this.hsb = color.rgbToHsb(color.hexToRgb(newColor));
    const sbPos = color.offsetSB(this, this.hsb);

    this.left = sbPos.left;
    this.top = sbPos.top;
    this.hubTop = color.offsetH(this, this.hsb);

    this.setMoveElem();
    this.setInnerElem();
    this.setHubVal();

    this.rgb = color.hsbToRgb({ h: this.hsb.h, s: 100, b: 100 });
    // 主色系渲染
    this.$color.css('background-color', `#${color.rgbToHex(this.rgb)}`);
    // 备份新颜色，切换颜色的时候替换旧颜色
    this.oldColor = newColor;
    this.hex = newColor;
    this.defaultHex = newColor;
    this.setRgbVal();
  }
  // 确定
  subPanel() {
    const { editor } = this;
    const { selection, text } = editor;
    // 恢复选区，不然添加不上
    selection.restoreSelection();

    const type = this.type.replace(/(c)o/, ($1) => `${$1[0].toUpperCase()}${$1[1]}`);

    text.handle(type, `#${this.hex}`);
    this.remove();
  }

  remove() {
    $colorDialog.remove();
    this.isActive();
    this.reset();
  }
  // 重置
  reset() {
    this.hex = this.defaultHex;
    this.left = 0;
    this.top = 0;
    this.hubTop = 0;
    this.oldColor = 'rgb(255, 255, 255)';
    this.newColor = 'rgb(255, 255, 255)';
    this.color = 'rgb(255, 0, 0)';
  }
  // 拖拽绑定事件
  someEvent() {
    this.colorboxSize = this.$color[0].clientWidth - (colorPadding * 2);

    this.$color.on('mousedown', (ev = window.event) => {
      this.colorDown(ev);
    });

    this.$hue.on('mousedown', (ev = window.event) => {
      this.hubDown(ev);
    });
  }
  // 颜色的点击
  colorDown(ev) {
    this.left = ev.pageX - getElementLeft(this.$color[0]) - dot;
    this.top = ev.pageY - getElementTop(this.$color[0]) - dot;

    this.setInnerElem();
    this.getRgbColor();
    this.setRgbVal();

    this.$doc.on('mousemove', (evMove = window.evente) => {
      this.colorMove(evMove);
    }).on('mouseup', () => {
      this.colorUp();
    });
  }
  // 左边颜色
  colorMove(ev) {
    this.left = ev.pageX - getElementLeft(this.$color[0]) - dot;
    this.top = ev.pageY - getElementTop(this.$color[0]) - dot;
    // 拖拽限制
    if (this.left > dotMaxX) {
      this.left = dotMaxX;
    }
    if (this.left < -dot) {
      this.left = -dot;
    }
    if (this.top > dotMaxY) {
      this.top = dotMaxY;
    }
    if (this.top < -dot) {
      this.top = -dot;
    }

    this.setInnerElem();
    this.getRgbColor();
    this.setRgbVal();
  }

  colorUp() {
    this.$doc.off('mousemove mouseup');
  }
  // 颜色的点击
  hubDown(ev) {
    this.hubTop = ev.pageY - getElementTop(this.$color[0]) - dot;
    this.setMoveElem();

    this.setHubVal();

    this.$doc.on('mousemove', (evMove = window.evente) => {
      this.hubMove(evMove);
    }).on('mouseup', () => {
      this.hubUp();
    });
  }
  // 左边颜色
  hubMove(ev) {
    this.hubTop = ev.pageY - getElementTop(this.$color[0]) - dot;
    // 拖拽限制
    if (this.hubTop > hueMaxY) {
      this.hubTop = hueMaxY;
    }
    if (this.hubTop < 0) {
      this.hubTop = 0;
    }
    this.setMoveElem();
    this.setHubVal();
  }

  hubUp() {
    this.$doc.off('mousemove mouseup');
  }
  // 更新旧颜色
  updateOld() {
    this.$old.css('background', this.oldColor);
  }
  // 设置移动盒子的颜色
  setMoveElem() {
    this.$move.css({
      top: this.hubTop,
    });
  }
  // 设置移动盒子的颜色
  setInnerElem() {
    this.$inner.css({
      left: this.left,
      top: this.top,
    });
  }
  // 根据 top 获取颜色
  getHueColor() {
    const { r, g, b } = this.rgb;
    this.hsb.h = color.getH(this, this.hubTop);
    this.oldColor = `rgb(${r}, ${g}, ${b})`;
    const oldHsb = color.rgbToHsb(this.rgb);
    oldHsb.h = this.hsb.h;
    this.rgb = color.hsbToRgb(oldHsb);
    this.hex = color.rgbToHex(this.rgb);

    this.color = color.rgbToHex(color.hsbToRgb({
      h: this.hsb.h,
      s: 100,
      b: 100,
    }));
  }
  // 根据 left top 获取颜色
  getRgbColor() {
    const sb = color.getSB(this, this.left, this.top);
    const { r, g, b } = this.rgb;
    this.hsb.s = sb.s;
    this.hsb.b = sb.b;
    this.oldColor = `rgb(${r}, ${g}, ${b})`;
    this.rgb = color.hsbToRgb(this.hsb);
    this.hex = color.rgbToHex(this.rgb);
  }
  // 设置数值
  setRgbVal() {
    this.$r.val(this.rgb.r);
    this.$g.val(this.rgb.g);
    this.$b.val(this.rgb.b);
    this.$w.val(this.hex);
    this.updateOld();
    this.$new.css('background', `#${this.hex}`);
  }
  // 设置数值
  setHubVal() {
    this.getHueColor();
    this.setRgbVal();

    this.$color.css('background-color', `#${this.color}`);
  }
  // 是否是加粗
  isActive() {
    const { selection, uid } = this.editor;
    const $rang = selection.getSelectionContainerElem(selection.getRange());

    if (this.$link && $rang) {
      if (this.type === 'backcolor') {
        const color = this.getBackColor($rang);
        this.$link.css('fill', /rgba/.test(color) ? '#666' : color);
        ;
      } else {
        const color = $rang.css('color');
        this.$link.css('fill', /rgba/.test(color) ? '#666' : color);
      }
    }
  }
  // 获取背景
  getBackColor($rang) {
    let backColor = null;
    const getback = ($rang) => {
      const $parent = $rang.parent();
      backColor = $rang.css('background-color');
      if (/rgba/.test(backColor) && $parent.length > 0 && $parent[0].tagName !== 'P' && $rang[0].tagName !== 'P') {
        getback($parent);
      }
    }

    if ($rang) {
      getback($rang);
    }

    return backColor;
  }
};
/**
 * XMenuColorBase 模块.
 * @module XMenuColorBase
 */
export default XMenuColorBase;
