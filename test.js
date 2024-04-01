const _ = require("lodash");

let original = { a: 1, b: { c: 2 } };

// 使用 lodash 的 _.cloneDeep 方法创建 original 的深拷贝
let copy = _.cloneDeep(original);

original.b.c = 3;

console.log(copy.b.c); // 输出：2，因为 copy.b 和 original.b 引用的是不同的对象
