class Watcher {
    constructor(vm,expr,callback) {
        this.vm = vm;
        this.expr= expr;
        this.callback = callback;
        this.oldVal = this.getOldVal()
    }
    update(){
       const newVal = compileUtil.getVal(this.expr,this.vm);
       if(newVal !== this.oldVal){
           this.callback(newVal)
       }
    }
    getOldVal(){
        Dep.target = this;
        const oldVal = compileUtil.getVal(this.expr,this.vm);
        Dep.target = null;
        return oldVal
    }
}
