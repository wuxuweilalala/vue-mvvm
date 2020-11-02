class Observer {
    constructor(data) {
        this.observe(data)
    }
    observe(data){
        if(data && typeof data === 'object') {
            Object.keys(data).forEach(key=>{
                this.defineReactive(data,key,data[key])
            })
        }
    }
    defineReactive(obj,key,value){
        // 递归遍历
        this.observe(value);
        const dep = new Dep();
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:false,
            get(){
                // 订阅数据变化时，往Dep中添加观察者
                Dep.target && dep.addSub(Dep.target);
                return value
            },
            set:(newValue)=>{
                this.observe(newValue);
                if(newValue !== value){
                    value = newValue
                }
                // 告诉Dep通知变化
                dep.notify()
            }
        })
    }
}
