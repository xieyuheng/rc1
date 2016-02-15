in_node = () ->
  typeof module isnt "undefined"

in_browser = () ->
  typeof window isnt "undefined"

function_p = (value) ->
  typeof value is "function"

undefined_p = (value) ->
  value is undefined

array_p = (value) ->
  Array.isArray(value)

object_p = (value) ->
  (value instanceof Object) and not array_p(value)

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
Array::last = () -> this[@length - 1]
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
    array.reverse()

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
eva = (array) ->
  base_cursor = retack.cursor()
  first_retack_point = new RETACK_POINT array
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
eva_dispatch = (jo, retack_point) ->

  if function_p(jo)
    eva_primitive_function(jo, retack_point)

  else if undefined_p(jo)
    # do nothing

  else if array_p jo._sad
    retack.push new RETACK_POINT(jo._sad)

  else if array_p jo._into_local_variable
    eva_into_local_variable \
      jo._into_local_variable,
      retack_point.local_variable_map

  else if array_p jo._out_local_variable
    eva_out_local_variable \
      jo._out_local_variable,
      retack_point.local_variable_map

  else
    argack.push(jo)
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
  _into_local_variable: array
eva_into_local_variable = (array, local_variable_map) ->
  array = array.reverse()
  for name_string in array
    do (name_string) ->
    local_variable_map.set name_string, argack.pop()
out = () ->
  array = []
  array.push(element) for element in arguments
  _out_local_variable: array
eva_out_local_variable = (array, local_variable_map) ->
  for name_string in array
    do (name_string) ->
    result = local_variable_map.get(name_string)
    if result is undefined
      # ><><><
      # better error handling
      orz "- in eva_out_local_variable\n",
          "  meet undefined name : ", name_string
    else
      argack.push(result)
sad = (array) -> _sad: array
send = (object, message) ->
  if typeof object[message] is "function"
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
do ->
  add = (a, b) -> a + b

  testing_sad = sad [
    1, 2, 3
  ]

  my_object =
    k1: "value k1 of my_object"

  eva [ 1, 2, 3, add, add,
    (sad [1, 2, 3]) , add, add,
    testing_sad, add, add,
    my_object,"k1",send
  ]

  asr(argack.pop() is my_object.k1)
  asr(argack.pop() is 6)
  asr(argack.pop() is 6)
  asr(argack.pop() is 6)

  asr(argack.cursor() is 0)
exports = {
  cat, orz, asr
  STACK, HASH_TABLE
}
