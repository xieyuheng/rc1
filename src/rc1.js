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

const ds = new STACK();
const rs = new STACK();

function RSP (array) {
  this.array = array;
  this.cursor = 0;
}

RSP.prototype = {

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

function apply (array) {
  if (array.length === 0) {
    // do nothing
  }
  else {
    rs.push(new RSP(array));
  }
}

function eva (array, map) {
  let base_cursor = rs.cursor();
  apply (array);
  while (rs.cursor() > base_cursor) {
    let rs_point = rs.pop();
    let jo = rs_point.get_current_jo();
    if (!rs_point.at_tail_position()) {
      rs_point.next();
      rs.push(rs_point);
    }
    eva_dispatch(jo, rs_point);
  }
}

function eva_dispatch (jo, rs_point) {
  if (function_p(jo)) {
    eva_primitive_function(jo);
  }
  else if (jo === undefined) {
    // do nothing
  }
  else {
    ds.push(jo);
  }
}

function eva_primitive_function (jo) {
  let count_down = jo.length;
  let arg_list = [];
  while (count_down !== 0) {
    arg_list.push(ds.pop());
    count_down = count_down - 1;
  }
  arg_list.reverse();
  let result = jo.apply(this, arg_list);
  if (result !== undefined) {
    ds.push(result);
  }
}

function tes (array1, array2) {
  let cursor = ds.cursor();
  eva(array1);
  let result1 = ds.n_pop(ds.cursor() - cursor);
  cursor = ds.cursor();
  eva(array2);
  let result2 = ds.n_pop(ds.cursor() - cursor);
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

function drop (a1) {
  apply ([
  ]);
}

function dup (a1) {
  apply ([
    a1, a1
  ]);
}

function over (a1, a2) {
  apply ([
    a1, a2, a1
  ]);
}

function tuck (a1, a2) {
  apply ([
    a2, a1, a2
  ]);
}

function swap(a1, a2) {
  apply([
    a2, a1
  ]);
}

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

function anp (bool1, bool2) { return bool1 && bool2; }
function orp (bool1, bool2) { return bool1 || bool2; }
function nop (bool) { return !bool; }

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

// the deep-equal
tes ([
  2, 3, pow,
  8, equal,
], [
  true,
]);

function ifte (predicate_array, true_array, false_array) {
  eva (predicate_array);
  if (ds.pop()) {
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
    let result = ds.pop();
    if (result) {
      let new_rs_point = new RSP(succedent);
      rs.push (new_rs_point);
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

function linrec (predicate_array, base_array, before_array, after_array) {
  let rec_array = [];
  rec_array.push (predicate_array);
  rec_array.push (base_array);
  rec_array.push (before_array);
  rec_array.push (after_array);
  rec_array.push (linrec);
  eva (predicate_array);
  if (ds.pop()) {
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

function binrec (predicate_array, base_array, before_array, after_array) {
  let rec_array = [];
  rec_array.push (predicate_array);
  rec_array.push (base_array);
  rec_array.push (before_array);
  rec_array.push (after_array);
  rec_array.push (binrec);
  eva (predicate_array);
  if (ds.pop()) {
    eva (base_array);
  }
  else {
    eva (before_array);
    let a2 = ds.pop();
    eva (rec_array);
    ds.push (a2);
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
  if (ds.pop()) {
    eva (base_array);
  }
  else {
    eva (before_array);
    ds.push (rec_array);
    eva (after_array);
  }
}

function tailrec (predicate_array, base_array, before_array) {
  let rec_array = [];
  rec_array.push (predicate_array);
  rec_array.push (base_array);
  rec_array.push (before_array);
  rec_array.push (tailrec);
  eva (predicate_array);
  if (ds.pop()) {
    eva (base_array);
  }
  else {
    eva (before_array);
    apply (rec_array);
  }
}

// last
tes ([
  [1, 2, 3, 4, 5, 6],
  [dup, length, 1, eq],
  [car],
  [cdr],
  tailrec
],[
  6
]);

function number_primrec (base_array, after_array) {
  apply ([
    [ dup, 0, eq ],
    base_array,
    [ dup, 1, sub ],
    after_array,
    linrec,
  ]);
}

// factorial
tes ([
  6,
  [drop, 1],
  [mul],
  number_primrec,
],[
  720,
]);

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

function array_primrec (base_array, after_array) {
  apply ([
    [dup, empty],
    base_array,
    [dup, car, swap, cdr],
    after_array,
    linrec,
  ]);
}

function filter (predicate_array) {
  apply ([
    [],
    [[over, predicate_array, apply],
     [cons],
     [swap, drop],
     ifte],
    array_primrec,
  ]);
}

tes ([
  [1, 2, 3, 4, 5, 6, 7, 8], [5, lt], filter
],[
  [1, 2, 3, 4]
]);

function map (fun) {
  apply ([
    [],
    [swap, fun, apply,
     swap, cons],
    array_primrec,
  ]);
}

tes ([
  [1, 2, 3, 4, 5, 6, 7, 8], [5, lt], map
],[
  [true, true, true, true, false, false, false, false]
]);

function fold (base, binfun) {
  apply ([
    [drop, base],
    [binfun, apply],
    array_primrec
  ]);
}

tes ([
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0, [add], fold
],[
  55
]);

function ya (object, message) {
  if (function_p (object[message])) {
    let arg_length = object[message].length;
    let arg_list = [];
    while (arg_length !== 0) {
      arg_list.push (ds.pop());
      arg_length = arg_length - 1;
    }
    arg_list.reverse();
    let result = object[message].apply(object, arg_list);
    if (result !== undefined) {
      ds.push(result);
    }
  }
  else {
    ds.push (object[message]);
  }
}

function instance_p (value, fun_array) {
  let fun = fun_array[0];
  return (value instanceof fun);
};

ds.print = function () {
  let index = 0;
  let arg_list = [];
  while (index < ds.cursor()) {
    arg_list.push (ds.array[index]);
    index = 1 + index;
  }
  cat("------", ds.cursor(), "------");
  for (let arg of arg_list) {
    cat (arg);
  }
  cat("---------------\n");
};

function repl (array, map) {
  let base_cursor = rs.cursor();
  apply (array);
  while (rs.cursor() > base_cursor) {
    let rs_point = rs.pop();
    let jo = rs_point.get_current_jo();
    if (!rs_point.at_tail_position()) {
      rs_point.next();
      rs.push(rs_point);
    }
    eva_dispatch(jo, rs_point);
    ds.print();
  }
}

{

  function DD () {
    this.d1 = "d1";
    this.d2 = "d2";
  }
  DD.prototype = {

    k1: function () {
      return this.d1.length;
    },
  };

  let d = new DD();

  repl ([
    d,
    d, "d1", ya,
    d, "k1", ya,
  ]);

}

// module.exports = {
// };
