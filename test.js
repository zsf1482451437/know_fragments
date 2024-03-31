function decimalToBase(num, hex = 7) {
  let res = "";
  while (num > 0) {
    res = (num % hex) + res;
    num = Math.floor(num / hex);
  }
  return res || "0";
}
console.log(decimalToBase(100)); // '202'
