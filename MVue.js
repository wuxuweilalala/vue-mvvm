const compileUtil = {
    getVal(expr, vm) {
        // 取到变量即data中定义的变量
        return expr.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, vm.$data)
    },
    text(node, expr, vm) {
      let value
      if(expr.indexOf('{{') !== -1){
        value = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
         return this.getVal(args[1], vm);
        })
      }else {
        value = this.getVal(expr, vm);
      }
      this.updater.textUpdater(node, value)
    },
    html(node, expr, vm) {
        const value = this.getVal(expr, vm);
        this.updater.htmlUpdater(node, value)
    },
    model(node, expr, vm) {
        const value = this.getVal(expr, vm);
        this.updater.modelUpdater(node, value)
    },
    on(node, expr, vm, eventName) {

    },
    // 更新的函数
    updater: {
        textUpdater(node, value) {
            node.textContent = value
        },
        htmlUpdater(node, value) {
            node.innerHTML = value
        },
        modelUpdater(node, value) {
            node.value = value
        }
    }
};

class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm;
        // 1. 获取文档碎片对象 放入内存中 会减少页面的回流和重绘
        const fragment = this.node2Fragment(this.el);

        //2.编译模版
        this.compile(fragment);

        // 3.追加子元素到根元素
        this.el.appendChild(fragment)
    }

    compile(fragment) {
        // 1.获取子节点
        const childNodes = fragment.childNodes;
        [...childNodes].forEach(child => {

            if (this.isElementNode(child)) {
                // 是元素节点
                // 编译元素节点
                this.compileElement(child)
            } else {
                // 是文本节点
                this.compileText(child)
            }
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        })
    }

    compileElement(node) {
        const attributes = node.attributes;
        [...attributes].forEach(attr => {
            const {name, value} = attr;

            if (this.isDirective(name)) {
                // 是一个指令 v-text v-html v-model v-on:click
                const directive = name.split('-')[1];
                const [dirName, eventName] = directive.split(':');

                // 更新数据 数据驱动视图
                compileUtil[dirName](node, value, this.vm, eventName);

                // 删除有指令的标签上的属性
                node.removeAttribute('v-'+directive)
            }
        });
    }

    compileText(node) {
      const content = node.textContent;
      // 正则匹配带有双括号的文本内容
      if(/\{\{(.+?)\}\}/.test(content)){
        console.log(content)
        compileUtil.text(node,content,this.vm)
      }
    }

    isDirective(attrName) {
        return attrName.startsWith('v-')
    }

    isElementNode(node) {
        return node.nodeType === 1;
    }

    node2Fragment(el) {
        // 创建文档碎片
        const f = document.createDocumentFragment();
        while (el.firstChild) {
            f.appendChild(el.firstChild)
        }
        return f
    }
}

class MVue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        if (this.$el) {
            // 实现 Observer 、 class Compile
            new Compile(this.$el, this)
        }
    }
}
