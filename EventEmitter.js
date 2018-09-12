function EventEmitter() {
    this._eventList = [];
}

EventEmitter.prototype = {
    constructor: EventEmitter,
    on: function (name, fn) {
        if (!this._eventList[name]) {
            this._eventList[name] = [];
        }
        this._eventList[name].push(fn);
    },
    once: function (name, fn) {
        function one() {
            fn.apply(this, arguments);
            //先绑定 执行后再删除
            this.remove(name, one);
        }
        fn.isOnce = true;
        this.on(name, one);
    },
    emit: function () {
        var name = Array.prototype.shift.call(arguments);
        var fns = this._eventList[name];
        var onceArr = [];
        if (!fns || fns.length === 0) {
            return false;
        }
        for (var i = 0; i < fns.length; i++) {
            var fn = fns[i];
            fn.apply(this, arguments);
            if (fn.isOnce) {
                onceArr.push(i);
            }
        }

        for (var j = onceArr.length; j > 0; j--) {
            fns.splice(onceArr[j], 1);
        }
    },
    remove: function (name, fn) {
        var fns = this._eventList[name];
        if (!fns) {
            return false;
        }
        if (!fn) {
            fns.length = 0;
        } else {
            for (var i = 0; i < fns.length; i++) {
                var _fn = fns[i];
                if (_fn === fn) {
                    fns.splice(i, 1);
                }
            }
        }
    }
}