---
title: "Ameba 1.3.0 has been released"
description: "This release adds 3 new rules, enables `Lint/EmptyExpression` by default, and includes several bug fixes and internal improvements."
pubDate: 2022-11-03T13:22:52
category: "Release announcement"
tags:
  - releases
---

This release adds 3 new lint rules, enables `Lint/EmptyExpression` by default, and brings several bug fixes and quality-of-life improvements.
Check out the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v1.3.0)
to see a full scope of changes.

## New rules

### [`Lint/LiteralsComparison`](/api/1.3.0/Ameba/Rule/Lint/LiteralsComparison.html)

A rule that detects comparisons between literal values — comparisons that
always produce the same result and are likely unintended.

```crystal
"foo" == "foo"   # => always true
"foo" != "foo"   # => always false
"foo" === "foo"  # => always the same
"foo" == 42      # => always false
```

### [`Lint/NotNil`](/api/1.3.0/Ameba/Rule/Lint/NotNil.html)

A rule that flags usages of `not_nil!` calls. The `not_nil!` method raises
when the value is `nil`, so it's safer to use pattern matching or a
conditional instead.

```crystal
# Bad
alice = names.find { |name| name == "Alice" }.not_nil!

# Good
if alice = names.find { |name| name == "Alice" }
  # ...
end
```

Note: calls with an explicit argument (e.g. `not_nil!("foo")`) are not affected.

### [`Lint/NotNilAfterNoBang`](/api/1.3.0/Ameba/Rule/Lint/NotNilAfterNoBang.html)

A rule that detects `index` or `find` calls chained with `not_nil!`, and
**autocorrects** them to use the bang variant (`index!` / `find!`).

<div class="compare">

<div class="example bad">

Bad

```crystal
(1..3).index(1).not_nil!
(1..3).find { |i| i > 2 }.not_nil!
```

</div>

<div class="example good">

Good

```crystal
(1..3).index!(1)
(1..3).find! { |i| i > 2 }
```

</div>

</div>

The autocorrection is safe since `index!` and `find!` already raise on no match,
making the subsequent `not_nil!` redundant.

## Notable changes

### `Lint/EmptyExpression` enabled by default

The [`Lint/EmptyExpression`](/api/1.3.0/Ameba/Rule/Lint/EmptyExpression.html)
rule was previously disabled due to a false positive in Crystal's parser
([crystal#9857](https://github.com/crystal-lang/crystal/issues/9857)).
That issue has since been fixed, so the rule is now enabled by default.

```crystal
# Bad
foo = ()

if ()
  bar
end
```

### Bug fixes & improvements

- **`Source::Corrector#remove_leading` and `#remove_trailing`** — fixed a
  compile error that occurred when using these methods
  ([#289](https://github.com/crystal-ameba/ameba/pull/289)).
- **`Rule::Base+.parsed_doc`** — now populated at compile time, fixing a
  runtime issue where rule docs could be missing
  ([#282](https://github.com/crystal-ameba/ameba/pull/282)).
- **Performance** — replaced `Digest::SHA1.hexdigest` with `String#hash`
  for internal hashing
  ([#286](https://github.com/crystal-ameba/ameba/pull/286)).
- **Internal refactoring** — reduced usage of `Object#not_nil!` throughout
  Ameba's own codebase, aligning with the new `Lint/NotNil` rule
  ([#281](https://github.com/crystal-ameba/ameba/pull/281)).
- **Cosmetic** — removed trailing dots from rule descriptions for consistency
  ([#290](https://github.com/crystal-ameba/ameba/pull/290)).
