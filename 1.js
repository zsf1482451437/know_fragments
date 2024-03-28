const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void (async function () {
  const input = (await readline()).split(" ");
  const targetWord = input[input.length - 2];
  const targetPosition = input[input.length - 1];

  const sortedTargetWord = targetWord.split("").sort().join("");
  const siblingWords = input.filter((word) => {
    return (
      word !== targetWord && word.split("").sort().join("") === sortedTargetWord
    );
  });

  siblingWords.sort();

  console.log(siblingWords.length);
  if (siblingWords.length >= targetPosition) {
    console.log(siblingWords[targetPosition - 1]);
  }
})();
