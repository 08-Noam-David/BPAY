const readlineSync = require('readline-sync');

exports.print = output => {
  console.log(output);
};

exports.stringInput = () => readlineSync.question();


exports.intInput = () => Number.parseInt(readlineSync.question());