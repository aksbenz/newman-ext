const program = require('commander');

function collect(val, memo) {
    memo.push(val);
    return memo;
}
function map(val,obj){
    _.extend(obj,_.fromPairs([val.split('=')]));
    return obj;
}
function list(val) {
  return val.split(',');
}