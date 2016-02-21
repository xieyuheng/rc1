"use strict";

const _equal = require("deep-equal");

function equal (value1, value2) {
  return _equal(value1, value2);
}
function in_node () {
  return (typeof module) !== "undefined";
}

function in_browser () {
  return (typeof window) !== "undefined";
}

function function_p (value) {
  return (typeof value) === "function";
}

function array_p (value) {
  return Array.isArray(value);
}

function object_p (value) {
  return (value instanceof Object) &&
    !array_p(value) &&
    !(value === null);
}

function atom_p (value) {
  return !(array_p(value) || object_p(value));
}

function string_p (value) {
  return (typeof value) === "string";
}
function cat () {
  let argument_array = [];
  for (let argument of arguments) {
    argument_array.push(argument);
  }
  console.log.apply(
    console,
    argument_array);
}
function orz () {
  cat.apply(this, arguments);
  console.assert(false, "arguments");
}

// {
//   orz("k1", "k2", "k3");
// }
function asr () {
  console.assert.apply(console, arguments);
}
function STACK () {
  this.array = [];
}
STACK.prototype = {

  cursor: function () {
    return this.array.length;
  },

  set: function (index, value) {
    this.array[index] = value;
  },

  get: function (index) {
    return this.array[index];
  },

  push: function (value) {
    this.array.push(value);
  },

  pop: function () {
    return this.array.pop();
  },

  tos: function () {
    return this.array[this.array.length - 1];
  },

  push_array: function (array) {
    for (let value of array) {
      this.array.push(value);
    }
  },

  n_pop: function (n) {
    let array = [];
    while (n > 0) {
      array.push(this.array.pop());
      n = n - 1;
    }
    return array.reverse();
  },

  n_tos: function (n) {
    let array = [];
    while (n > 0) {
      array.push(this.array[this.array.length - n]);
      n = n - 1;
    }
    return array;
  },

  is_empty: function () {
    return (this.array.length === 0);
  },

};

{
  let testing_stack = new STACK();

  testing_stack.push(666);
  asr(testing_stack.pop() === 666);

  testing_stack.push_array([0,1,2]);
  let array = testing_stack.n_pop(3);
  asr(array[0] === 0);
  asr(array[1] === 1);
  asr(array[2] === 2);
}
function HASH_TABLE_ENTRY (index) {
  this.index = index;
  this.key = null;
  this.value = null;
  this.orbit_length = 0;
  this.orbiton = 0;
}

HASH_TABLE_ENTRY.prototype = {

  occured: function () {
    return this.key !== null;
  },

  used: function () {
    return this.value !== null;
  },

  no_collision: function () {
    return this.index === this.orbiton;
  },

};

function HASH_TABLE (size, key_equal, hash) {
  this.size = size;
  this.key_equal = key_equal;
  this.hash = hash;
  this.array = new Array(this.size);
  this.counter = 0;
  let i = 0;
  while (i < this.size) {
    this.array[i] = new HASH_TABLE_ENTRY(i);
    i = 1 + i;
  }
}

HASH_TABLE.prototype = {

  insert: function (key) {
    // key -> index
    //     -> null -- denotes the hash_table is filled
    let orbit_index = this.hash(key, 0);
    let counter = 0;
    while (true) {
      let index = this.hash(key, counter);
      let entry = this.index_to_entry(index);
      if (!entry.occured()) {
        entry.key = key;
        entry.orbiton = orbit_index;
        let orbit_entry = this.index_to_entry(orbit_index);
        orbit_entry.orbit_length = 1 + counter;
        this.counter = 1 + this.counter;
        return index;
      }
      else if (this.key_equal(key, entry.key)) {
        return index;
      }
      else if (counter === this.size) {
        return null;
      }
      else {
        counter = 1 + counter;
      }
    }
  },

  search: function (key) {
    // key -> index
    //     -> null -- denotes key not occured
    let counter = 0;
    while (true) {
      let index = this.hash(key, counter);
      let entry = this.index_to_entry(index);
      if (!entry.occured()) {
        return null;
      }
      else if (this.key_equal(key, entry.key)) {
        return index;
      }
      else if (counter === this.size) {
        return null;
      }
      else {
        counter = 1 + counter;
      }
    }
  },

  key_to_index: function (key) {
    let index = this.insert(key);
    if (index !== null) {
      return index;
    }
    else {
      console.log("hash_table is filled");
      throw "hash_table is filled";
    }
  },

  index_to_entry: function (index) {
    return this.array[index];
  },

  key_to_entry: function (key) {
    return index_to_entry(key_to_index(key));
  },

  report_orbit: function (index, counter) {
    let entry = this.index_to_entry(index);
    while (counter < entry.orbit_length) {
      let key = entry.key;
      let next_index = this.hash(key, counter);
      let next_entry = this.index_to_entry(next_index);
      if (index === next_entry.orbiton) {
        cat("  - ", next_index, " ",
            next_entry.key);
      }
      counter = 1 + counter;
    }
  },

  report: function () {
    console.log("\n");
    console.log("- hash_table-table report_used");
    let index = 0;
    while (index < this.size) {
      let entry = this.index_to_entry(index);
      if (entry.occured() && entry.no_collision()) {
        cat("  - ", index, " ",
            entry.key, " // ",
            entry.orbit_length);
        if (entry.used()) {
          cat("      ", entry.value);
        }
        this.report_orbit(index, 1);
      }
      index = 1 + index;
    }
    cat("\n");
    cat("- used : ", this.counter);
    cat("- free : ", this.size - this.counter);
  },

};
const argack = new STACK();
const retack = new STACK();
function RETACK_POINT (array) {
  this.array = array;
  this.cursor = 0;
  this.local_variable_map = new Map();
}

RETACK_POINT.prototype = {

  get_current_jo: function () {
    return this.array[this.cursor];
  },

  at_tail_position: function () {
    return this.cursor + 1 === this.array.length;
  },

  next: function () {
    this.cursor = 1 + this.cursor;
  },

};
function eva_with_map (array, map) {
  let base_cursor = retack.cursor();
  let first_retack_point = new RETACK_POINT(array);
  first_retack_point.local_variable_map = map;
  if (array.length === 0) {
    return first_retack_point;
  }
  else {
    retack.push(first_retack_point);
    while (retack.cursor() > base_cursor) {
      let retack_point = retack.pop();
      let jo = retack_point.get_current_jo();
      if (!retack_point.at_tail_position()) {
        retack_point.next();
        retack.push(retack_point);
      }
      eva_dispatch(jo, retack_point);
    }
    return first_retack_point;
  }
}
function eva (array) {
  return eva_with_map(array, new Map());
}
function eva_dispatch (jo, retack_point) {
  if (function_p(jo)) {
    eva_primitive_function(jo);
  }
  else if (jo === undefined) {
    // do nothing
  }
  else if (!object_p(jo)) {
    argack.push(jo);
  }
  else if (array_p (jo._fun)) {
    retack.push(new RETACK_POINT(jo._fun));
  }
  else if (array_p(jo._into)) {
    eva_into(
      jo._into,
      retack_point.local_variable_map);
  }
  else if (array_p(jo._out)) {
    eva_out(
      jo._out,
      retack_point.local_variable_map);
  }
  else {
    argack.push(jo);
  }
}
function eva_primitive_function (jo) {
  let count_down = jo.length;
  let arg_list = [];
  while (count_down !== 0) {
    arg_list.push(argack.pop());
    count_down = count_down - 1;
  }
  arg_list.reverse();
  let result = jo.apply(this, arg_list);
  if (result !== undefined) {
    argack.push(result);
  }
}
function into () {
  let array = [];
  for (let element of arguments) {
    array.push(element);
  }
  return { _into: array };
}
function eva_into (array, local_variable_map) {
  let i = 0;
  while (i < array.length) {
    local_variable_map.set(
      array[(array.length - i) - 1],
      argack.pop());
    i = 1 + i;
  }
}
function out () {
  let array = [];
  for (let element of arguments) {
    array.push(element);
  }
  return { _out: array };
}
function eva_out (array, local_variable_map) {
  for (let name_string of array) {
    let result = local_variable_map.get(name_string);
    if (result === undefined) {
      // ><><><
      // better error handling
      orz("- in eva_out\n",
          "  meet undefined name : ", name_string);
    }
    else {
      argack.push(result);
    }
  }
}
function recur () {
  orz("- recur\n",
      "  recur is a function used as an unique id\n",
      "  it should never be called\n");
}
function fun (array) {
  let result = { _fun: null };
  result._fun = _fun_rec(array, result);
  return result;
}

function _fun_rec (array, _fun) {
  let result = [];
  let index = 0;
  while (index < array.length) {
    if (array_p(array[index])) {
      result.push(
        _fun_rec(array[index], _fun));
    }
    else if (array[index] === recur) {
      result.push(_fun);
    }
    else {
      result.push(array[index]);
    }
    index = 1 + index;
  }
  return result;
}
function tes (array1, array2) {
  let cursor = argack.cursor();
  eva(array1);
  let result1 = argack.n_pop(argack.cursor() - cursor);
  cursor = argack.cursor();
  eva(array2);
  let result2 = argack.n_pop(argack.cursor() - cursor);
  let success = equal(result1, result2);
  if (success) {
    // nothing
  }
  else {
    orz("- tes fail\n",
        "program1:", array1, "\n",
        "program2:", array2, "\n");
  }
}
tes ([
], [
]);

tes ([
  1, 2, 3,
], [
  1, 2, 3,
]);

tes ([
  [1, 2, 3],
], [
  [1, 2, 3],
]);

tes ([
  [1, 2, 3],
  [1, 2, 3],
  tes,
],[
  [4, 5, 6],
  [4, 5, 6],
  tes,
]);
const drop = fun ([
  into("1"),
]);

const dup = fun ([
  into("1"),
  out("1", "1"),
]);

const over = fun ([
  into("1", "2"),
  out("1", "2", "1"),
]);

const tuck = fun ([
  into("1", "2"),
  out("2", "1", "2"),
]);

const swap = fun ([
  into("1", "2"),
  out("2", "1"),
]);
tes ([
  1, 2, swap,
], [
  2, 1,
]);

tes ([
  1, 2, over,
], [
  1, 2, 1,
]);

tes ([
  1, 2, tuck,
], [
  2, 1, 2,
]);
function anp (bool1, bool2) {
  return bool1 && bool2;
}

function orp (bool1, bool2) {
  return bool1 || bool2;
}

function nop (bool) {
  return !bool;
}
function get (array, index) {
  return array[index];
}

function set (array, index, value) {
  // be careful about side-effect
  array[index] = value;
}
tes ([
  [4, 5, 6],
  dup, 0, 0, set,
  dup, 1, 1, set,
  dup, 2, 2, set,
],[
  [0, 1, 2],
]);
function length (array) {
  return array.length;
}
tes ([
  [4, 5, 6], length,
],[
  3,
]);
function concat (array1, array2) {
  return array1.concat(array2);
}
tes ([
  [1, 2, 3], dup, concat,
],[
  [1, 2, 3, 1, 2, 3],
]);
function cons (value, array) {
  let result = [];
  result.push(value);
  return result.concat(array);
}

function car (array) {
  return array[0];
}

function cdr (array) {
  let result = [];
  let index = 1;
  while (index < array.length) {
    result.push(array[index]);
    index = 1 + index;
  }
  return result;
}
function unit (value) {
  let result = [];
  result.push(value);
  return result;
}
function empty (array) {
  return array.length === 0;
}
function reverse (array) {
  let result = [];
  for (let element of array) {
    result.push(element);
  }
  return result.reverse();
}
tes ([
  [1, 2, 3],
  dup, reverse, concat,
  dup, length,
],[
  [1, 2, 3, 3, 2, 1],
  6,
]);
function add (a, b) { return a + b; }
function sub (a, b) { return a - b; }

function mul (a, b) { return a * b; }
function div (a, b) { return a / b; }
function mod (a, b) { return a % b; }

function pow (a, b) { return Math.pow(a, b); }
function log (a, b) { return Math.log(a, b); }

function abs (a) { return Math.abs(a); }
function neg (a) { return -a; }

function max (a, b) { return Math.max(a, b); }
function min (a, b) { return Math.min(a, b); }
function eq   (value1, value2) { return value1 === value2; }
function lt   (value1, value2) { return value1 <  value2 ; }
function gt   (value1, value2) { return value1 >  value2 ; }
function lteq (value1, value2) { return value1 <= value2 ; }
function gteq (value1, value2) { return value1 >= value2 ; }
tes ([
  2, 3, pow,
  8, eq,
], [
  true,
]);

tes ([
  2, 3, pow,
  8, equal,
], [
  true,
]);
function apply (array) {
  if (array.length === 0) {
    // do nothing
  }
  else {
    retack.push(new RETACK_POINT(array));
  }
}
tes ([
  [], apply,
],[

]);

tes ([
  [1], apply,
  [dup, dup], apply,
],[
  1, 1, 1,
]);

tes ([
  [1], eva, drop,
  [dup, dup], eva, drop,
],[
  1, 1, 1,
]);
function ifte (predicate_array, true_array, false_array) {
  eva (predicate_array);
  if (argack.pop()) {
    eva(true_array);
  }
  else {
    eva(false_array);
  }
}
function cond (sequent_array) {
  let index = 0;
  while (index + 1 < sequent_array.length) {
    let antecedent = sequent_array[index];
    let succedent = sequent_array[index + 1];
    eva (antecedent);
    let result = argack.pop();
    if (result) {
      let new_retack_point = new RETACK_POINT(succedent);
      retack.push (new_retack_point);
      return;
    }
    index = 2 + index;
  }
  orz("cond fail\n",
      "sequent_array:", sequent_array);
}
tes ([
  [[false], [321],
   [true], [123],
  ],cond,
],[
  123,
]);
function va (string) {
  return { _va: string };
}
function guard (array) {
  return { _guard: array };
}
function antecedent_actual_length (antecedent) {
  let index = 0;
  let counter = 0;
  while (index < antecedent.length) {
    if ((object_p (antecedent[counter])) &&
        (array_p (antecedent[counter]._guard))) {
      // do nothing
    }
    else {
      counter = 1 + counter;
    }
    index = 1 + index;
  }
  return counter;
}
function unify_array (source, pattern, map) {
  let index = 0;
  while (index < pattern.length) {
    let success =
        unify_dispatch (
          source[index],
          pattern[index],
          map);
    if (success) {
      // do nothing
    }
    else {
      return false;
    }
    index = 1 + index;
  }
  return map;
}
function unify_dispatch (source, pattern, map) {

  if (array_p (pattern)) {
    return unify_array(source, pattern, map);
  }

  else if (string_p (pattern._va)) {
    if (map.has (pattern._va)) {
      if (source === map.get (pattern._va)) {
        return map;
      }
      else {
        return false;
      }
    }
    else {
      map.set (pattern._va, source);
      return map;
    }
  }

  else if (array_p (pattern._guard)) {
    eva_with_map (pattern._guard, map);
    let result = argack.pop();
    if (result) {
      return map;
    }
    else {
      return false;
    }
  }

  else {
    if (equal (source, pattern)) {
      return map;
    }
    else {
      return false;
    }
  }

}
function unify (source, pattern) {
  let result_map = new Map();
  let success =
      unify_dispatch (
        source,
        pattern,
        result_map);
  if (success) {
    return result_map;
  }
  else {
    return false;
  }
}
function match (sequent_array) {
  let index = 0;
  while (index + 1 < sequent_array.length) {
    let antecedent = sequent_array[index];
    let succedent = sequent_array[index + 1];
    let length = antecedent_actual_length (antecedent);
    let argument_array = argack.n_tos (length);
    let result_map =
        unify (argument_array, antecedent);
    if (result_map) {
      argack.n_pop (length);
      let new_retack_point = new RETACK_POINT(succedent);
      new_retack_point.local_variable_map = result_map;
      retack.push (new_retack_point);
      return;
    }
    index = 2 + index;
  }
  orz("match fail\n",
      "sequent_array:", sequent_array);
}
tes ([
  666,
  666, 1,

  [[2],
   [1, 2, 3],

   [666, 1],
   [4, 5, 6],
  ],match,

],[
  666,
  [4, 5, 6],
  apply,
]);

tes ([
  1, 2, 3,
  [[1, va ("2"), 4],
   [null],

   [1, va ("2"), 3],
   [out ("2"), out ("2")],
  ],match,
], [
  2, dup,
]);

tes ([
  1, 2, 3,
  [[1, va ("2"), 4],
   [null],

   [1, va ("2"), 3],
   [out ("2")],
  ],match,
], [
  2,
]);

tes ([
  1, 2, 3,
  [[1, va ("2"), 4],
   [null],

   [1, va ("2"), 3,
    guard ([false])],
   [false, out ("2")],

   [1, va ("2"), 3,
    guard ([true])],
   [true, out ("2")],
  ],match,
], [
  true, 2,
]);

tes ([
  1, 2, 3,
  [[1, va ("2"), 4],
   [null],

   [1, va ("2"), 3,
    guard ([1, out ("2"), gt])],
   [false, out ("2")],

   [1, va ("2"), 3,
    guard ([1, out ("2"), lt])],
   [true, out ("2")],
  ],match,
], [
  true, 2,
]);
function linrec (predicate_array, base_array, before_array, after_array) {
  let rec_array = [];
  rec_array.push (predicate_array);
  rec_array.push (base_array);
  rec_array.push (before_array);
  rec_array.push (after_array);
  rec_array.push (linrec);
  eva (predicate_array);
  if (argack.pop()) {
    eva (base_array);
  }
  else {
    eva (before_array);
    eva (rec_array);
    eva (after_array);
  }
}
// factorial
tes ([
  6,
  [dup, 1, eq],
  [],
  [dup, 1, sub], [mul],
  linrec,
],[
  720,
]);

tes ([
  6,
  fun ([
    [dup, 1, eq],
    [],
    [dup, 1, sub, recur, mul],
    ifte,
  ])
],[
  720,
]);
function binrec (predicate_array, base_array, before_array, after_array) {
  let rec_array = [];
  rec_array.push (predicate_array);
  rec_array.push (base_array);
  rec_array.push (before_array);
  rec_array.push (after_array);
  rec_array.push (binrec);
  eva (predicate_array);
  if (argack.pop()) {
    eva (base_array);
  }
  else {
    eva (before_array);
    let a2 = argack.pop();
    eva (rec_array);
    argack.push (a2);
    eva (rec_array);
    eva (after_array);
  }
}
function genrec (predicate_array, base_array, before_array, after_array) {
  let rec_array = [];
  rec_array.push (predicate_array);
  rec_array.push (base_array);
  rec_array.push (before_array);
  rec_array.push (after_array);
  rec_array.push (genrec);
  eva (predicate_array);
  if (argack.pop()) {
    eva (base_array);
  }
  else {
    eva (before_array);
    argack.pop (rec_array);
    eva (after_array);
  }
}
const tailrec = fun ([
  into ("predicate_array", "base_array", "before_array"),

  out ("predicate_array", "base_array", "before_array"),
  concat, concat, into ("rec_array"),

  out ("predicate_array", "base_array", "before_array"),
  ifte,

  out ("rec_array"), apply,
]);




function ya (object, message) {
  if (function_p (object[message])) {
    let arg_length = object[message].length;
    let arg_list = [];
    while (arg_length !== 0) {
      arg_list.push (argack.pop());
      arg_length = arg_length - 1;
    }
    arg_list.reverse();
    let result = object[message].apply(object, arg_list);
    if (result !== undefined) {
      argack.push(result);
    }
  }
  else {
    argack.push (object[message]);
  }
}

argack.print = function () {
  let index = 0;
  let arg_list = [];
  while (index < argack.cursor()) {
    arg_list.push (argack.array[index]);
    index = 1 + index;
  }
  arg_list.unshift("  *", argack.cursor(), "*  --");
  arg_list.push("--");
  console.log.apply (console, arg_list);
};
function repl_with_map (array, map) {
  let base_cursor = retack.cursor();
  let first_retack_point = new RETACK_POINT(array);
  first_retack_point.local_variable_map = map;
  if (array.length === 0) {
    return first_retack_point;
  }
  else {
    retack.push (first_retack_point);
    while (retack.cursor() > base_cursor) {
      let retack_point = retack.pop();
      let jo = retack_point.get_current_jo();
      if (!retack_point.at_tail_position()) {
        retack_point.next();
        retack.push (retack_point);
      }
      eva_dispatch (jo, retack_point);
      argack.print();
    }
    return first_retack_point;
  }
}
function repl (array) {
  return repl_with_map (array, new Map());
}
let last = fun ([
  [dup, length, 1, eq],
  [car],
  [cdr],
  [],
  linrec,
]);

repl ([
  [
    [1, 2, 3],
    dup, reverse, concat,
    dup, length,
  ], apply,
  [1, 2, 3], last
]);
// module.exports = {
//   in_node, in_browser,
//   function_p, array_p, object_p, atom_p, string_p
//   cat, orz, asr
//   STACK, HASH_TABLE
//   argack, retack
//   fun, into, out, ya, eva
// }
