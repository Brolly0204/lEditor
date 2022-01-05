class ToolTips {
  constructor(root) {
    this.container = null;
    this.editor = root;
    this.create(root);
  }
  create(root) {
    this.container = document.createElement('div');
    this.container.id = 'sizeTool';
    this.container.className = 'w-e-tooltip w-e-tooltip-up';
    this.container.style.cssText = 'top:0; left:0; z-index:10002; display: none;';
    //   <div class="w-e-tooltip-item-wrapper ">
    //   <span class="w-e-icon-trash-o"></span>
    // </div>
    const fragment = this.createToolTip(root.cfg.sizes);
    this.container.appendChild(fragment);
    root.$editor.appendEle([this.container]);
    this.container.addEventListener('click', (event) => {
      if (root.insertImgTarget && event.target.dataset.size) {
        root.insertImgTarget.style.width = event.target.dataset.size;
      }
      this.container.style.display = 'none';
    });
  }
  createToolTip(sizes) {
    const fragment = document.createDocumentFragment();
    sizes.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'w-e-tooltip-item-wrapper';
      const span = document.createElement('span');
      span.dataset.size = `${item}%`;
      span.innerText = `${item}%`;
      div.appendChild(span);
      fragment.appendChild(div);
    });
    return fragment;
  }
}

export default ToolTips;
