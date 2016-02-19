_equal = require "deep-equal"

equal = (value1, value2) ->
  _equal value1, value2
in_node = () ->
  typeof module isnt "undefined"

in_browser = () ->
  typeof window isnt "undefined"

function_p = (value) ->
  typeof value is "function"

array_p = (value) ->
  Array.isArray(value)

object_p = (value) ->
  (value instanceof Object) and
  (not (array_p value)) and
  (not (value is null))

atom_p = (value) ->
  not (array_p(value) or object_p(value))

string_p = (value) ->
  typeof value is "string"
cat_indentation = 0

cat_get_indentation_array = () ->
  result = []
  i = 0
  while i < cat_indentation
    result.push(" ")
    i = 1 + i
  result

cat = () ->
  argument_array = []
  argument_array.push(argument) for argument in arguments
  if in_node()
    console.log.apply console,
      cat_get_indentation_array().concat(argument_array)
  else if in_browser()
    console.log.apply(console, argument_array)
  else
    console.log.apply console,
      cat_get_indentation_array().concat(argument_array)

call_with_indentation = (fun) ->
  if in_node()
    cat_indentation = 1 + cat_indentation
    fun.call(this)
    cat_indentation = cat_indentation - 1
  else if in_browser()
    console.group()
    fun.call(this)
    console.groupEnd()
  else
    cat_indentation = 1 + cat_indentation
    fun.call(this)
    cat_indentation = cat_indentation - 1

incat = () ->
  call_with_indentation () ->
    cat.apply(this, arguments)

# cat("k1", "k2", "k3")
# incat("k1", "k2", "k3")
# call_with_indentation () ->
#   call_with_indentation () -> cat("k1", "k2", "k3")
#   call_with_indentation () -> incat("k1", "k2", "k3")

# cat("k1", "k2", "k3")
# incat("k1", "k2", "k3")
# call_with_indentation () ->
#   call_with_indentation () -> cat("k1", "k2", "k3")
#   call_with_indentation () -> incat("k1", "k2", "k3")
orz = () ->
  cat.apply(this, arguments)
  console.assert(false)

# orz("k1", "k2", "k3")
asr = () ->
  console.assert.apply(console, arguments)
class STACK
  constructor: () ->
    @array = []

  cursor: () ->
    @array.length

  set: (index, value) ->
    @array[index] = value

  get: (index) ->
    @array[index]

  push: (value) ->
    @array.push(value)

  pop: () ->
    @array.pop()

  tos: () ->
    @array[@array.length - 1]

  push_array: (array) ->
    @array.push(value) for value in array

  n_pop: (n) ->
    array = []
    while (n > 0)
      array.push(@array.pop())
      n = n - 1
    array.reverse()

  n_tos: (n) ->
    array = []
    while (n > 0)
      array.push(@array[@array.length - n])
      n = n - 1
    array

  is_empty: () ->
    @array.length is 0

do ->
  testing_stack = new STACK()

  testing_stack.push(666)
  asr(testing_stack.pop() is 666)

  testing_stack.push_array([0,1,2])
  array = testing_stack.n_pop(3)
  asr(array[0] is 0)
  asr(array[1] is 1)
  asr(array[2] is 2)
class HASH_TABLE_ENTRY
  constructor: (@index) ->
    @key = null
    @value = null
    @orbit_length = 0
    @orbiton = 0

  occured: () ->
    @key isnt null

  used: () ->
    @value isnt null

  no_collision: () ->
    @index is @orbiton

class HASH_TABLE
  constructor: (@size, @key_equal, @hash) ->
    @array = new Array(@size)
    @counter = 0
    i = 0
    while i < @size
      @array[i] = new HASH_TABLE_ENTRY(i)
      i = 1 + i

  insert: (key) ->
    # key -> index
    #     -> null -- denotes the hash_table is filled
    orbit_index = @hash(key, 0)
    counter = 0
    while true
      index = @hash(key, counter)
      entry = @index_to_entry(index)
      if not entry.occured()
        entry.key = key
        entry.orbiton = orbit_index
        orbit_entry = @index_to_entry(orbit_index)
        orbit_entry.orbit_length = 1 + counter
        @counter = 1 + @counter
        return index
      else if @key_equal(key, entry.key)
        return index
      else if counter is @size
        return null
      else
        counter = 1 + counter

  search: (key) ->
    # key -> index
    #     -> null -- denotes key not occured
    counter = 0
    while true
      index = @hash(key, counter)
      entry = @index_to_entry(index)
      if not entry.occured()
        return null
      else if @key_equal(key, entry.key)
        return index
      else if counter is @size
        return null
      else
        counter = 1 + counter

  key_to_index: (key) ->
    index = @insert(key)
    if index isnt null
      index
    else
      console.log("hash_table is filled")
      throw "hash_table is filled"

  index_to_entry: (index) ->
    @array[index]

  key_to_entry: (key) ->
    index_to_entry(key_to_index(key))

  report_orbit: (index, counter) ->
    entry = @index_to_entry(index)
    while counter < entry.orbit_length
      key = entry.key
      next_index = @hash(key, counter)
      next_entry = @index_to_entry(next_index)
      if index is next_entry.orbiton
        cat("  - ", next_index, " ",
            next_entry.key)
      counter = 1 + counter

  report: () ->
    console.log("\n")
    console.log("- hash_table-table report_used")
    index = 0
    while (index < @size)
      entry = @index_to_entry(index)
      if entry.occured() and entry.no_collision()
        cat("  - ", index, " ",
            entry.key, " # ",
            entry.orbit_length)
        if entry.used()
          cat "      ", entry.value
        @report_orbit(index, 1)
      index = 1 + index
    cat "\n"
    cat "- used : ", @counter
    cat "- free : ", @size - @counter
argack = new STACK()
retack = new STACK()
class RETACK_POINT
  constructor: (@array) ->
    @cursor = 0
    @local_variable_map = new Map()

  get_current_jo: () ->
    @array[@cursor]

  at_tail_position: () ->
    @cursor + 1 is @array.length

  next: () ->
    @cursor = 1 + @cursor
eva_with_map = (array, map) ->
  base_cursor = retack.cursor()
  first_retack_point = new RETACK_POINT array
  first_retack_point.local_variable_map = map
  if array.length is 0
    return first_retack_point
  else
    retack.push first_retack_point
    while retack.cursor() > base_cursor
      retack_point = retack.pop()
      jo = retack_point.get_current_jo()
      if !retack_point.at_tail_position()
        retack_point.next()
        retack.push(retack_point)
      eva_dispatch(jo, retack_point)
    return first_retack_point
eva = (array) ->
  eva_with_map array, new Map()
eva_dispatch = (jo, retack_point) ->

  if function_p(jo)
    eva_primitive_function jo

  else if jo is undefined
    # do nothing

  else if not object_p jo
    argack.push jo

  else if array_p jo._sad
    retack.push new RETACK_POINT(jo._sad)

  else if array_p jo._into
    eva_into \
      jo._into,
      retack_point.local_variable_map

  else if array_p jo._out
    eva_out \
      jo._out,
      retack_point.local_variable_map

  else
    argack.push jo
eva_primitive_function = (jo) ->
  count_down = jo.length
  arg_list = []
  while count_down isnt 0
    arg_list.push(argack.pop())
    count_down = count_down - 1
  arg_list.reverse()
  result = jo.apply(this, arg_list)
  if result isnt undefined
    argack.push(result)
into = () ->
  array = []
  array.push(element) for element in arguments
  _into: array
eva_into = (array, local_variable_map) ->
  i = 0
  while i < array.length
    local_variable_map.set array[(array.length - i) - 1], argack.pop()
    i = 1 + i
out = () ->
  array = []
  array.push(element) for element in arguments
  _out: array
eva_out = (array, local_variable_map) ->
  for name_string in array
    do (name_string) ->
    result = local_variable_map.get(name_string)
    if result is undefined
      # ><><><
      # better error handling
      orz "- in eva_out\n",
          "  meet undefined name : ", name_string
    else
      argack.push(result)
sad = (array) -> _sad: array
tes = (array1, array2) ->
  cursor = argack.cursor()
  eva array1
  result1 = argack.n_pop (argack.cursor() - cursor)
  cursor = argack.cursor()
  eva array2
  result2 = argack.n_pop (argack.cursor() - cursor)
  success = equal result1, result2
  if success
    # nothing
  else
    orz "- tes fail\n",
        "program1:", array1, "\n"
        "program2:", array2, "\n"
tes [
], [
]

tes [
  1, 2, 3
], [
  1, 2, 3
]

tes [
  [1, 2, 3]
], [
  [1, 2, 3]
]

tes [
  [1, 2, 3]
  [1, 2, 3]
  tes
],[
  [4, 5, 6]
  [4, 5, 6]
  tes
]
drop = sad [
  (into "1")
]

dup = sad [
  (into "1")
  (out "1", "1")
]

over = sad [
  (into "1", "2")
  (out "1", "2", "1")
]

tuck = sad [
  (into "1", "2")
  (out "2", "1", "2")
]

swap = sad [
  (into "1", "2")
  (out "2", "1")
]
tes [
  1, 2, swap
], [
  2, 1
]

tes [
  1, 2, over
], [
  1, 2, 1
]

tes [
  1, 2, tuck
], [
  2, 1, 2
]
anp = (bool1, bool2) -> bool1 and bool2
orp = (bool1, bool2) -> bool1 or  bool2
nop = (bool) -> not bool
get = (array, index) ->
  array[index]

set = (array, index, value) ->
  # be careful about side-effect
  array[index] = value
  return undefined
tes [
  [4, 5, 6]
  dup, 0, 0, set
  dup, 1, 1, set
  dup, 2, 2, set
],[
  [0, 1, 2]
]
length = (array) -> array.length
concat = (array1, array2) ->
  array1.concat array2
tes [
  [1, 2, 3], dup, concat
],[
  [1, 2, 3, 1, 2, 3]
]
cons = (value, array) ->
  result = []
  result.push(value)
  result.concat(array)

car = (array) ->
  array[0]

cdr = (array) ->
  result = []
  index = 1
  while index < array.length
    result.push(array[index])
    index = 1 + index
  result
unit = (value) ->
  result = []
  result.push(value)
  result
empty = (array) ->
  array.length is 0
reverse = (array) ->
  result = []
  result.push(element) for element in array
  return result.reverse()
tes [
  [1, 2, 3]
  dup, reverse, concat
  dup, length
],[
  [1, 2, 3, 3, 2, 1]
  6
]
add = (a, b) -> a + b
sub = (a, b) -> a - b

mul = (a, b) -> a * b
div = (a, b) -> a / b
mod = (a, b) -> a % b

pow = (a, b) -> Math.pow a, b
log = (a, b) -> Math.log a, b

abs = (a) -> Math.abs a
neg = (a) -> - a

max = (a, b) -> Math.max a, b
min = (a, b) -> Math.min a, b
eq   = (value1, value2) -> value1 is value2
lt   = (value1, value2) -> value1 <  value2
gt   = (value1, value2) -> value1 >  value2
lteq = (value1, value2) -> value1 <= value2
gteq = (value1, value2) -> value1 >= value2
tes [
  2, 3, pow
  8, eq
], [
  true
]

tes [
  2, 3, pow
  8, equal
], [
  true
]
apply = (array) ->
  if array.length is 0
    return undefined
  else
    retack.push new RETACK_POINT(array)
    return undefined
tes [
  [], apply
],[
]

tes [
  [1], apply
  [dup, dup], apply
],[
  1, 1, 1
]
ifte = (predicate_array, true_array, false_array) ->
  eva predicate_array
  if argack.pop()
    eva true_array
    return undefined
  else
    eva false_array
    return undefined
cond = (sequent_array) ->
  index = 0
  while index + 1 < sequent_array.length
    antecedent = sequent_array[index]
    succedent = sequent_array[index + 1]
    eva antecedent
    result = argack.pop()
    if result
      new_retack_point = new RETACK_POINT(succedent)
      retack.push new_retack_point
      return undefined
    index = 2 + index
  orz "cond fail\n",
      "sequent_array:", sequent_array
tes [
  [[false], [321]
   [true], [123]
  ],cond
],[
  123
]
va = (string) -> _va: string
guard = (array) ->
  _guard: array
antecedent_actual_length = (antecedent) ->
  index = 0
  counter = 0
  while index < antecedent.length
    if (object_p antecedent[counter]) and
       (array_p antecedent[counter]._guard)
      # do nothing
    else
      counter = 1 + counter
    index = 1 + index
  counter
unify_array = (source, pattern, map) ->
  index = 0
  while index < pattern.length
    success = unify_dispatch source[index], pattern[index], map
    if success
      # do nothing
    else
      return false
    index = 1 + index
  return map
unify_dispatch = (source, pattern, map) ->

  if array_p pattern
    unify_array source, pattern, map

  else if string_p pattern._va
    if map.has pattern._va
      if source is map.get pattern._va
        return map
      else
        return false
    else
      map.set pattern._va, source
      return map

  else if array_p pattern._guard
    eva_with_map pattern._guard, map
    result = argack.pop()
    if result
      return map
    else
      return false

  else
    if equal source, pattern
      return map
    else
      return false
unify = (source, pattern) ->
  result_map = new Map()
  success = unify_dispatch source, pattern, result_map
  if success
    result_map
  else
    false
match = (sequent_array) ->
  index = 0
  while index + 1 < sequent_array.length
    antecedent = sequent_array[index]
    succedent = sequent_array[index + 1]
    length = antecedent_actual_length antecedent
    argument_array = argack.n_tos length
    result_map =
      unify argument_array, antecedent
    if result_map
      argack.n_pop length
      new_retack_point = new RETACK_POINT(succedent)
      new_retack_point.local_variable_map = result_map
      retack.push new_retack_point
      return undefined
    index = 2 + index
  orz "match fail\n",
      "sequent_array:", sequent_array
tes [
  666
  666, 1

  [[2]
   [1, 2, 3]

   [666, 1]
   [4, 5, 6]
  ],match

],[
  666
  [4, 5, 6]
  apply
]

tes [
  1, 2, 3
  [[1, (va "2"), 4]
   [null]

   [1, (va "2"), 3]
   [(out "2"), (out "2")]
  ],match
], [
  2, dup
]

tes [
  1, 2, 3
  [[1, (va "2"), 4]
   [null]

   [1, (va "2"), 3]
   [(out "2")]
  ],match
], [
  2
]

tes [
  1, 2, 3
  [[1, (va "2"), 4]
   [null]

   [1, (va "2"), 3
    (guard [false])]
   [false, (out "2")]

   [1, (va "2"), 3
    (guard [true])]
   [true, (out "2")]
  ],match
], [
  true, 2
]

tes [
  1, 2, 3
  [[1, (va "2"), 4]
   [null]

   [1, (va "2"), 3
    (guard [1, (out "2"), gt])]
   [false, (out "2")]

   [1, (va "2"), 3
    (guard [1, (out "2"), lt])]
   [true, (out "2")]
  ],match
], [
  true, 2
]




map = (argument_array, function_array) ->

ya = (object, message) ->
  if function_p object[message]
    arg_length = object[message].length
    arg_list = []
    while arg_length isnt 0
      arg_list.push(argack.pop())
      arg_length = arg_length - 1
    arg_list.reverse()
    result = object[message].apply(object, arg_list)
    if result isnt undefined
      argack.push(result)
  else
    argack.push(object[message])
  return undefined

argack.print = () ->
  index = 0
  arg_list = []
  while (index < argack.cursor())
    arg_list.push(argack.array[index])
    index = 1 + index
  arg_list.unshift("  *", argack.cursor(), "*  --")
  arg_list.push("--")
  console.log.apply console, arg_list
repl_with_map = (array, map) ->
  base_cursor = retack.cursor()
  first_retack_point = new RETACK_POINT array
  first_retack_point.local_variable_map = map
  if array.length is 0
    return first_retack_point
  else
    retack.push first_retack_point
    while retack.cursor() > base_cursor
      retack_point = retack.pop()
      jo = retack_point.get_current_jo()
      if !retack_point.at_tail_position()
        retack_point.next()
        retack.push(retack_point)
      eva_dispatch(jo, retack_point)
      argack.print()
    return first_retack_point
repl = (array) ->
  repl_with_map array, new Map()
factorial = sad [
  [dup, 1, eq]
  []
  [dup, 1, sub, factorial, mul]
  ifte
]

repl [
  3, factorial
  6, factorial
]
