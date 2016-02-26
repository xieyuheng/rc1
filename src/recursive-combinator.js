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
    console.log("- hash_table_table report_used");
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
function apply (array) {
  if (array.length === 0) {
    // do nothing
  }
  else {
    retack.push(new RETACK_POINT(array));
  }
}
function RETACK_POINT (array) {
  this.array = array;
  this.cursor = 0;
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
function eva (array, map) {
  let base_cursor = retack.cursor();
  apply (array);
  while (retack.cursor() > base_cursor) {
    let retack_point = retack.pop();
    let jo = retack_point.get_current_jo();
    if (!retack_point.at_tail_position()) {
      retack_point.next();
      retack.push(retack_point);
    }
    eva_dispatch(jo, retack_point);
  }
}
function eva_dispatch (jo, retack_point) {
  if (function_p(jo)) {
    eva_primitive_function(jo);
  }
  else if (jo === undefined) {
    // do nothing
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
    argack.push (rec_array);
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
  if (argack.pop()) {
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
function instance_p (value, fun_array) {
  let fun = fun_array[0];
  return (value instanceof fun);
};
function self () {
  orz("this function is used as unique id");
}

function DATA () {
  let constructor_array = [];
  for (let argument of arguments) {
    constructor_array.push(argument);
  }
  this.constructor_array = constructor_array;
  for (let constructor of constructor_array) {
    if (constructor.length === 1) {
      this[constructor[0]] = () => {
        return [this, constructor[0]];
      };
    }
    else if (constructor.length === 2) {
      this[constructor[0]] = (a1) => {
        return [this, constructor[0], a1];
      };
    }
    else if (constructor.length === 3) {
      this[constructor[0]] = (a1, a2) => {
        return [this, constructor[0], a1, a2];
      };
    }
    else if (constructor.length === 4) {
      this[constructor[0]] = (a1, a2, a3) => {
        return [this, constructor[0], a1, a2, a3];
      };
    }
    else if (constructor.length === 5) {
      this[constructor[0]] = (a1, a2, a3, a4) => {
        return [this, constructor[0], a1, a2, a3, a4];
      };
    }
    else if (constructor.length === 6) {
      this[constructor[0]] = (a1, a2, a3, a4, a5) => {
        return [this, constructor[0], a1, a2, a3, a4, a5];
      };
    }
    else if (constructor.length === 7) {
      this[constructor[0]] = (a1, a2, a3, a4, a5, a6) => {
        return [this, constructor[0], a1, a2, a3, a4, a5, a6];
      };
    }
    else {
      orz("DATA fail on constructor:", constructor);
    }
  }
}
function match (value, pattern) {
  let type = car(pattern);
  let pattern_array = cdr(pattern);
  if (!array_p(value)) {
    orz("match fail\n",
        "value is not array:", value);
  }
  if (value.length < 1) {
    orz("match fail\n",
        "value is not a taged data:", value);
  }
  if (value[0] === type) {
    for (let clause of pattern_array) {
      if (value[1] === clause[0]) {
        argack.push_array(cdr(cdr(value)));
        apply(clause[1]);
        return;
      }
    }
    orz("match fail\n",
        "can not match value:", value, "\n",
        "with pattern:", pattern);
  }
  else {
    orz("match fail\n",
        "value:", value, "\n",
        "is not of type:", type);
  }
}
{
  let tree = new DATA (
    ["empty"],
    ["leaf", "value"],
    ["node", self, self]
  );

  function depth () {
    apply ([
      [tree,
       ["empty", [0]],
       ["leaf", [drop, 1]],
       ["node", [depth, swap, depth,
                 max, 1, add]],
      ],match
    ]);
  }

  tes ([
    1, tree.leaf,
    1, tree.leaf, tree.node,
    1, tree.leaf, tree.node,
    depth
  ],[
    3
  ]);
}
function data_member_p (value, data) {
  apply ([
    [[data, [DATA], instance_p, nop], [false],
     [value, array_p, nop], [false],
     [value, length, 1, lt], [false],
     [true], [value, car, data, eq],
    ],cond
  ]);
}
{
  let tree = new DATA (
    ["empty"],
    ["leaf", "value"],
    ["node", self, self]
  );

  tes ([
    1, tree.leaf,
    tree, data_member_p,
    ["string"],
    tree, data_member_p,
  ],[
    true,
    false,
  ]);
}
function match_p (value, data, constructor_string) {
  apply ([
    [value, data, data_member_p],
    [value, cdr, car, constructor_string, eq],
    [false],
    ifte,
  ]);
}
{
  let tree = new DATA (
    ["empty"],
    ["leaf", "value"],
    ["node", self, self]
  );

  tes ([
    1, tree.leaf,
    tree, "leaf", match_p,
  ],[
    true,
  ]);
}
function decons (array) {
  let value_array = cdr (cdr (array));
  argack.push_array (value_array);
  return;
}
{
  let tree = new DATA (
    ["empty"],
    ["leaf", "value"],
    ["node", self, self]
  );

  function depth () {
    apply ([
      [[dup, tree, "empty", match_p],
       [drop, 0],
       [dup, tree, "leaf", match_p],
       [drop, 1],
       [dup, tree, "node", match_p],
       [decons,
        depth, swap, depth,
        max, 1, add],
      ],cond
    ]);
  }

  tes ([
    1, tree.leaf,
    1, tree.leaf, tree.node,
    1, tree.leaf, tree.node,
    depth
  ],[
    3
  ]);
}
let list = new DATA (
  ["empty"],
  ["node", self, "value"]
);
{
  function length () {
    apply ([
      [list,
       ["empty", [0]],
       ["node", [drop, length, 1, add]],
      ],match
    ]);
  }

  tes ([
    list.empty,
    1, list.node,
    2, list.node,
    3, list.node,
    length
  ],[
    3
  ]);
}
list.associate = function recur (list1, key, equality) {
  apply ([
    list1,
    [list,
     ["empty", [false]],
     ["node", [
       [dup, car, key, equality, apply],
       [swap, drop],
       [drop, key, equality, recur],
       ifte]],
    ],match
  ]);
};
tes ([
  list.empty,
  [1,"k1"], list.node,
  [2,"k2"], list.node,
  [3,"k3"], list.node,
  dup,
  4, [eq], list.associate,
  swap,
  2, [eq], list.associate,
],[
  false,
  [2,"k2"],
]);




function TYPE () {

}
{
  let sequent = new TYPE (
    ["arrow", [self], [self]],
    ["literal", "data"],
    ["or", [self]]
  );
}
let sequent = new DATA (
  ["arrow", [self], [self]],
  ["literal", "data"],
  ["or", [self]]
);
function cut (sequent1, sequent2) {
  apply ([
    [[], [],
     [], [],
     [], [],
    ],cond
  ]);
}
argack.print = function () {
  let index = 0;
  let arg_list = [];
  while (index < argack.cursor()) {
    arg_list.push (argack.array[index]);
    index = 1 + index;
  }
  cat("------", argack.cursor(), "------");
  for (let arg of arg_list) {
    cat (arg);
  }
  cat("---------------\n");
};
function repl (array, map) {
  let base_cursor = retack.cursor();
  apply (array);
  while (retack.cursor() > base_cursor) {
    let retack_point = retack.pop();
    let jo = retack_point.get_current_jo();
    if (!retack_point.at_tail_position()) {
      retack_point.next();
      retack.push(retack_point);
    }
    eva_dispatch(jo, retack_point);
    argack.print();
  }
}
// {
//   repl ([
//     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
//     0, [add], fold,
//   ]);
// }
// module.exports = {
// };
