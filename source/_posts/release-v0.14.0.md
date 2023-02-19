---
title: Ameba v0.14.0 has been released
date: 2021-02-12 12:54:30
tags:
  - releases
category:
  - Release announcement
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/release-v0.14.0.md
---

Checkout the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v0.14.0)
to see a full scope of changes. Here we will go through the most important changes.

### New Lint Rules

#### [`Lint/DuplicatedRequire`](/ameba/Ameba/Rule/Lint/DuplicatedRequire.html)

Duplicated requires in the source file do not have too much effect on the running program,
however it creates a mess. This rule reports such cases.

```crystal
require "./thing"
require "./stuff"
require "./thing" # duplicated require
```

<!-- more -->

#### [`Lint/SpecFocus`](/ameba/Ameba/Rule/Lint/SpecFocus.html)

In specs `focus: true` is mainly used to focus on a spec item locally during development.
However, if such change is committed, it silently runs only focused spec on all other
enviroments, which is undesired.

This rule reports if specs are focused.

For example, this is considered invalid:

```crystal
it "works", focus: true do
  # ...
end
```

### New Performance Rules

#### [`Performance/AnyInsteadOfEmpty`](/ameba/Ameba/Rule/Performance/AnyInsteadOfEmpty.html)

Using `Enumerable#any?` instead of `Enumerable#empty?` might lead to an unexpected results
(like `[nil, false].any? # => false`). In some cases it also might be less efficient,
since it iterates until the block will return a _truthy_ value, instead of just checking
if there's at least one value present.

Now this is considered bad:

```crystal
[1, 2, 3].any?
```

and it should be written as this:

```crystal
![1, 2, 3].empty?
```

### [`Performance/ChainedCallWithNoBang`](/ameba/Ameba/Rule/Performance/ChainedCallWithNoBang.html)

This rule is used to identify usage of chained calls not utilizing the bang method variants.
This is a nice way to find all the places to reduce unnecessary collection allocations.

For example, this is considered inefficient:

```crystal
names = %w[Alice Bob]
chars = names
  .flat_map(&.chars)
  .uniq
  .sort
```

And can be written as this:

```crystal
names = %w[Alice Bob]
chars = names
  .flat_map(&.chars)
  .uniq!
  .sort!
```

There is a configuration property that allows to add/remove the method call names
to take into account during the check:

```yml
Performance/ChainedCallWithNoBang:
  CallNames:
    - uniq
    - sort
    - sort_by
    - shuffle
    - reverse
```

### [`Performance/CompactAfterMap`](/ameba/Ameba/Rule/Performance/CompactAfterMap.html)

This rule is used to identify usage of `compact` calls that follow `map`.
Such cases can be improved using `compact_map`.

For example, this is considered inefficient:

```crystal
%w[Alice Bob].map(&.match(/^A./)).compact
```

And can be written as this:

```crystal
%w[Alice Bob].compact_map(&.match(/^A./))
```

### [`Performance/FlattenAfterMap`](/ameba/Ameba/Rule/Performance/FlattenAfterMap.html)

There is a close counterpart of a previous example: `flatten` after `map` and `flat_map`.
So there is another rule to which is used to identify this usecase.

For example, this is considered inefficient:

```crystal
%w[Alice Bob].map(&.chars).flatten
```

And can be written as this:

```crystal
%w[Alice Bob].flat_map(&.chars)
```

### [`Performance/MapInsteadOfBlock`](/ameba/Ameba/Rule/Performance/MapInsteadOfBlock.html)

Another performance rule which is used to identify usage of `join/sum/product` calls
that follow `map`.

For example, this is considered inefficient:

```crystal
(1..3).map(&.to_s).join('.')
(1..3).map(&.*(2)).sum
```

And can be written as this:

```crystal
(1..3).join('.', &.to_s)
(1..3).sum(&.*(2))
```

### New Style Rules

### [`Style/IsAFilter`](/ameba/Ameba/Rule/Style/IsAFilter.html)

This rule is used to identify usage of `is_a?/nil?` calls within filters.
It helps to avoid the boilerplate in filters and improve the readability.

For example, this is considered invalid:

```crystal
matches.any?(&.is_a?(Regex::MatchData))
```

And it should be written as this:


```crystal
matches.any?(Regex::MatchData)
```

And of course there is a configuration property that allow to change
the list of filter name to inspect:

```yml
Style/IsAFilter:
  FilterNames:
    - select
    - reject
    - any?
    - all?
    - none?
    - one?
```

### [`Style/VerboseBlock`](/ameba/Ameba/Rule/Style/VerboseBlock.html)

As you might know some blocks in Crystal can have a shorter and much nicer form.
This rule is used to identify usage of single expression blocks with
argument as a receiver, that can be collapsed into such a short form.

For example, this is considered invalid:

```crystal
(1..3).any? { |i| i.odd? }
```

And it should be written as this:

```crystal
(1..3).any?(&.odd?)
```

There is a bag of configuration properties, which are not yet documented,
but you can give it a shot:

```yml
Style/VerboseBlock:
  ExcludeMultipleLineBlocks: true
  ExcludeCallsWithBlocks: false
  ExcludePrefixOperators: true
  ExcludeOperators: false
  ExcludeSetters: false
  MaxLineLength: ~
  MaxLength: 50 # use ~ to disable
```
