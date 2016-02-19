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

  print: () ->
    index = 0
    arg_list = []
    while (index < @cursor())
      arg_list.push(@array[index])
      index = 1 + index
    arg_list.unshift("  *", @cursor(), "*  --")
    arg_list.push("--")
    console.log.apply console, arg_list

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
eva = (array) ->
  eva_with_map array, new Map()
eva_dispatch = (jo, retack_point) ->

  if function_p(jo)
    eva_primitive_function(jo, retack_point)

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
eva_primitive_function = (jo, retack_point) ->
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
anp = (bool1, bool2) -> bool1 and bool2
orp = (bool1, bool2) -> bool1 or  bool2
nop = (bool) -> not bool
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
  else if atom_p pattern
    if source is pattern
      return map
    else
      return false
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
    orz "unify_dispatch fail\n",
        "source:", source, "\n"
        "pattern:", pattern, "\n"
        "map:", map
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
get = (array, index) ->
  array[index]

set = (array, index, value) ->
  # be careful about side-effect
  array[index] = value
  return undefined
length = (array) -> array.length
concat = (array1, array2) ->
  array1.concat array2
reverse = (array) ->
  result = []
  result.push(element) for element in array
  return result.reverse()
apply = (array) ->
  if array.length is 0
    return undefined
  else
    retack.push new RETACK_POINT(array)
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

do ->
  eva [
    [3, dup, dup], [add, add], concat, apply
    [], apply

    [1, 2, 3]
    dup, reverse
    dup, length

    [4, 5, 6]
    dup, 1, 666, set

    666, 66
    1

    [[2]
     [4, 5, 6]

     [666, 1]
     [4, 5, 6]

     [(va "1")
      (guard [
        (out "1"), 2
        gt])]
     [(out "1"), (out "1")
      (out "1"), (out "1")]

     [(va "1")
      (guard [
        (out "1"), 2
        lt])]
     [(out "1"), dup, add]

    ],match

  [[false]
   [321]

   [true]
   [123]
  ],cond

  ]
