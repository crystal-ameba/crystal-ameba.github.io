---
title: "Ameba 1.5.0 has been released"
description: "This release brings 3 new rules, Crystal 1.9 compatibility, several breaking changes and various improvements."
pubDate: 2023-07-28T19:49:59
category: "Release announcement"
tags:
  - releases
---

This release brings 3 new rules, Crystal 1.9 compatibility, several breaking changes and various improvements.
Check out the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v1.5.0)
to see a full scope of changes.

## Crystal compatibility

This release introduces **Crystal 1.9** compatibility and **drops support for Crystal < 1.9**.
Use the latest Ameba bugfix release [1.4.3](https://github.com/crystal-ameba/ameba/releases/tag/v1.4.3)
if you need compatibility with Crystal `1.8.x` or below.

## New rules

### [`Lint/Documentation`](/ameba/1.5.0/Ameba/Rule/Lint/Documentation.html)

A rule that enforces documentation for public types: classes, modules, enums, methods, and macros.
Since reopened classes are less common than modules, classes are checked by default while modules are not — you can adjust this via the `IgnoreClasses` and `IgnoreModules` configuration options.

```crystal
class Foo
  def bar # error: Missing documentation
  end
end
```

This rule is **disabled by default** and will produce an issue for every public type without a doc comment:

```yaml
Lint/Documentation:
  Enabled: true # enable to opt-in
  IgnoreClasses: false
  IgnoreModules: true
  IgnoreEnums: false
  IgnoreDefs: true
  IgnoreMacros: false
  IgnoreMacroHooks: true
```

### [`Performance/ExcessiveAllocations`](/ameba/1.5.0/Ameba/Rule/Performance/ExcessiveAllocations.html)

A rule that flags excessive collection allocations that can be avoided by using `each_<member>` methods instead of allocating intermediary collections with `.each`.

<div class="compare">

<div class="example bad">

Bad

```crystal
"Alice".chars.each { |c| puts c }
"Alice\nBob".lines.each { |l| puts l }
```

</div>

<div class="example good">

Good

```crystal
"Alice".each_char { |c| puts c }
"Alice\nBob".each_line { |l| puts l }
```

</div>

</div>

The set of checked collection methods is configurable:

```yaml
Performance/ExcessiveAllocations:
  Enabled: true
  CallNames:
    codepoints: each_codepoint
    graphemes: each_grapheme
    chars: each_char
    lines: each_line
```

This rule also supports **autocorrection**.

### [`Performance/MinMaxAfterMap`](/ameba/1.5.0/Ameba/Rule/Performance/MinMaxAfterMap.html)

A rule that flags `min`/`max`/`minmax` calls following `map`, and suggests using dedicated `*_of` methods instead.

<div class="compare">

<div class="example bad">

Bad

```crystal
%w[Alice Bob].map(&.size).min
%w[Alice Bob].map(&.size).max
%w[Alice Bob].map(&.size).minmax
```

</div>

<div class="example good">

Good

```crystal
%w[Alice Bob].min_of(&.size)
%w[Alice Bob].max_of(&.size)
%w[Alice Bob].minmax_of(&.size)
```

</div>

</div>

This rule also supports **autocorrection**.

## Breaking changes

- **`Lint/NotNilAfterNoBang`** now also reports calls to `#rindex` in addition to `#index` ([#323](https://github.com/crystal-ameba/ameba/pull/323)).
- **Invalid config file paths** now raise an error instead of being silently ignored ([#393](https://github.com/crystal-ameba/ameba/pull/393)).
- **Empty severity values** in YAML configuration now raise an error instead of being silently accepted ([#373](https://github.com/crystal-ameba/ameba/pull/373)).
- **`Style/VerboseBlock`** rule was fixed to work correctly with binary operations like `a + b` inside blocks ([#384](https://github.com/crystal-ameba/ameba/pull/384)).

## Other improvements

- **Portable postinstall**: The postinstall script now uses `shards build` directly instead of `make build`, improving portability across platforms including **Windows** ([#391](https://github.com/crystal-ameba/ameba/pull/391)).
- **Dockerfile** updated to support `pcre2` engine, and a smoke check (`ameba -v`) was added to verify the binary works at build time ([#369](https://github.com/crystal-ameba/ameba/pull/369)).
- **`AST::NodeVisitor::Category`** was introduced to simplify the rule codebase ([#378](https://github.com/crystal-ameba/ameba/pull/378)).
- Several internal tweaks and refactors ([#379](https://github.com/crystal-ameba/ameba/pull/379)).
