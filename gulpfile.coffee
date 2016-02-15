gulp = require("gulp")
{ execSync } = require("child_process")

org_array = [
  "src/sad.org"
]

run = () ->
  result = ""
  for string in arguments
    do (string) ->
    result = result.concat(" ", string)
    console.log(execSync(result).toString())

fs = require("fs")
path = require("path")

tangle = (input_file_name) ->
  output_file_name = null
  line_array =
      fs.readFileSync(input_file_name)
        .toString()
        .split("\n")
  cursor = 0
  result_array = []
  while (cursor < line_array.length)
    line = line_array[cursor]
    cursor = 1 + cursor
    if (line.match (new RegExp "#\\+begin_src.*"))
      indentation = (line.match (new RegExp "#\\+begin_src.*")).index
    if (line.match new RegExp "#\\+PROPERTY: tangle .*")
      output_file_name = path.join(
        __dirname,
        path.dirname(input_file_name),
        line
          .match(new RegExp "#\\+PROPERTY: tangle .*")[0]
          .match(new RegExp "\\b[A-Za-z0-9_\\-]*\\..*\\b")[0])
    else if (line.match (new RegExp "#\\+begin_src.*")) and \
            (not line.match (new RegExp ".*:tangle no.*"))
      while (cursor < line_array.length)
        line = line_array[cursor]
        cursor = 1 + cursor
        if (line.match (new RegExp "#\\+end_src.*"))
          break
        else
          result_array.push(line.substring(indentation))
    else
      # do nothing
  console.log("- tangle to :", output_file_name)
  fs.writeFileSync(
    output_file_name,
    line_array_to_string(result_array))

line_array_to_string = (line_array) ->
  result_string = ""
  for line in line_array
    do (line) ->
    result_string = result_string.concat(line, "\n")
  result_string

gulp.task "default", () ->
  console.log("-", task_name) \
  for task_name in Object.keys(gulp.tasks).slice(1)

gulp.task "build", () ->
  console.log("- coffeeing: src/")
  run("coffee --compile --output lib/ src/")

gulp.task "tangle", () ->
  tangle org for org in org_array

gulp.task "run", () ->
  run("coffee src/sad.coffee")

gulp.task "dev", [ "tangle", "build", "run" ], () ->

gulp.task "test", [ "tangle", "build" ] () ->
  run("coffee src/sad.coffee")

gulp.task "clean", () ->
  console.log("cleaning *~")
  run("find . -name '*~' -delete")
