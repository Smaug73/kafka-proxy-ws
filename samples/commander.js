#!/usr/bin/env node

// This is used as an example in the README for variadic options.
const { option } = require('commander');
//const commander = require('commander'); // (normal include)
//const commander = require('../'); // include commander in git clone of commander repo
const program = require('commander');

program
  .option('-n, --number <numbers...>', 'specify numbers')
  .option('-l, --letter [value...]', 'specify letters');

program.parse(process.argv);

console.log('Options: ', program.opts());
console.log('Remaining arguments: ', program.args);

const options = program.opts();

console.log('Numeri: ', options.number);

// Try the following:
//  node options-variadic.js -n 1 2 3 --letter a b c
//  node options-variadic.js --letter=A -n80 operand
//  node options-variadic.js --letter -n 1 -n 2 3 -- operand