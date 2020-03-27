---
title: Ameba v0.12.0 has been released 
date: 2020-03-27 12:54:30
tags:
  - releases
category:
  - Release announcement
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/release-v0.12.0.md
---

Checkout the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v0.12.0)
to see a full scope of changes. Here we will go through the most important changes.

<!-- more -->

### Globs and Excluded configuration options

Ameba now allows to globally configure the list of sources to run the inspection
on. There are two new sections which can be added to `.ameba.yml`:

```yml
Globs:
  - **/*.cr
  - !lib
  
Excluded:
  - src/compiler
```

* `Globs` is used to define paths to include to the inspection. Defaults to `%w(**/*.cr !lib)`
* `Excluded` is used to exclude from the list defined by `Globs`

### Crystal 0.34 compatibility

Crystal `0.34` is not yet released, but thanks to [@bcardiff](https://github.com/bcardiff)
Ameba is now ready to the upcoming release and is still compatible to the current
Crystal version `0.33`.

### New Rules

#### [`Style/RedundantNext`](/ameba/Ameba/Rule/Style/RedundantNext.html)

Crystal has [`next`](https://crystal-lang.org/reference/syntax_and_semantics/next.html)
keyword which can be used to go to the next iteration in a loop. However, it can
also be used to exit from a block, for example:

```crystal
(1..3).each do |e|
  break if e.even?
  puts e
end # => 1, 3
```

And in some places `next` can be overused, especially when it combines in the
last expression in the block. For example:

```crystal
block do |v|
  case v
  when .nil?
    next "nil"
  when .blank?
    next "blank"
  else
    next "empty"
  end
end
```

In all three places above the `next` keyword is redundant and is reported by the
new rule.

<hr>

#### [`Lint/SharedVarInFiber`](/ameba/Ameba/Rule/Lint/SharedVarInFiber.html)

To achieve [concurrency and parallelism](https://crystal-lang.org/reference/guides/concurrency.html#spawning-a-call)
Crystal uses Fibers and Channels. There is a tricky behavior which happens when
a shared variable is used across multiple fibers and is mutated during
iterations. For example:

```crystal
n = 0
channel = Channel(Int32).new

while n ‹ 3
  n = n + 1
  spawn { channel.send n }
end

3.times { puts channel.receive }
```

You might expect the code above to print `1 2 3`, however it prints `3 3 3`. The
problem is there is a shared variable `n` and when `channel.receive` is executed
its value is `3`.

To solve it, the code above can be written to the following:

```diff
n = 0
channel = Channel(Int32).new

while n ‹ 3
  n = n + 1
+ m = n
- spawn do { channel.send n }
+ spawn do { channel.send m }
end

3.times { puts channel.receive }
```

So instead of using a shared variable `n` which is declared at the top and
mutated in a `while` loop, we reassign the value to variable `m` and use it in
our spawn. As the result, the code above prints the expected `1 2 3`.
The new rule properly reports the issue on the first sample and passes on the
second one.

**There are also other technics to solve the problem above which are
[officially documented](https://crystal-lang.org/reference/guides/concurrency.html#spawning-a-call).**

<hr>

#### [`Lint/EmptyLoop`](/ameba/Ameba/Rule/Lint/EmptyLoop.html)

After some round of refactoring it can happen that the loop body becomes empty
but for whatever reason such an empty loop is forgotten to be removed. A new
rule is able to detect a few situations:

```crystal
while true
 # empty body
end

until false
 # empty body
end

loop do
  # empty block
end
```

And these samples are valid and not reported:

```crystal
a = 1
while a ‹ 10
  a += 1
end

until socket_opened?; end

loop { run }
```

<hr>

#### [`Lint/RedundantStringCoercion`](/ameba/Ameba/Rule/Lint/RedundantStringCoercion.html)

This is typical situation when a value is being converted to string using
[`Object.to_s`](https://crystal-lang.org/api/0.33.0/Object.html#to_s:String-instance-method)
method in the interpolation.

```crystal
"Hello, #{name.to_s}"
```

Since each value enclosed by `{ ... }` ends up invoking `Object.to_s` explicit
calls are redundant and are now reported by Ameba.
The code above is forced to be changed to

```crystal
"Hello, #{name}"
```

### Support

A new Patreon page has been created recently to support Ameba.
If you enjoy the project please consider becoming a patreon which will give
more attention to the project from the development perspective and make it better.

[![](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/join/2488933/checkout)
