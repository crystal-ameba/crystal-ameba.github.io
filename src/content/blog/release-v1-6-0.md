---
title: "Ameba 1.6.0 has been released"
description: "This release adds 9 new rules — bringing the total to 77 — along with a new `--describe` CLI switch, rule group reorganization, and several bug fixes."
pubDate: 2023-12-25T21:48:08
category: "Release announcement"
tags:
  - releases
---

This release adds 9 new rules, a new `--describe` CLI switch, reorganized rule groups, and several bug fixes.
Check out the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v1.6.0)
to see a full scope of changes.

## New rules

This release brings the total number of rules to **77**.

### [`Documentation/DocumentationAdmonition`](/api/1.6.0/Ameba/Rule/Documentation/DocumentationAdmonition.html)

A rule that reports documentation admonitions like `TODO`, `FIXME`, and `BUG` in comments.
Optionally checks whether a date associated with the admonition has already passed.

```crystal
# TODO(2024-04-24) Fix this hack when the database migration is complete
def get_user(id)
  # ...
end
```

The `Admonitions` and `Timezone` configuration properties let you customize which keywords to look for and how to parse dates.

### [`Lint/Typos`](/api/1.6.0/Ameba/Rule/Lint/Typos.html)

A rule that reports typos found in source files using the excellent [`typos`](https://github.com/crate-ci/typos) CLI tool. When only one correction is suggested, it can autocorrect the typo automatically.

```yaml .ameba.yml
Lint/Typos:
  Enabled: true
  BinPath: /usr/local/bin/typos
  FailOnError: false
```

### [`Lint/SpecFilename`](/api/1.6.0/Ameba/Rule/Lint/SpecFilename.html)

Enforces that spec filenames have the `_spec` suffix as recommended by the [Crystal testing guide](https://crystal-lang.org/reference/1.10/guides/testing.html#running-specs). Supports autocorrection by renaming the file.

```sh
$ ameba spec/my.cr
- spec/my.cr:1:1 [Correctable]
  Lint/SpecFilename: Spec filename should have `_spec` suffix: my_spec.cr, not my.cr
```

### [`Naming/Filename`](/api/1.6.0/Ameba/Rule/Naming/Filename.html)

A rule that enforces file names to be in underscored case (snake_case).

```sh
$ ameba src/MyClass.cr
- src/MyClass.cr:1:1
  Naming/Filename: Filename should be underscore-cased: my_class.cr, not MyClass.cr
```

### [`Naming/AccessorMethodName`](/api/1.6.0/Ameba/Rule/Naming/AccessorMethodName.html)

Makes sure that accessor methods are named properly — favouring `user` / `user=` over `get_user` / `set_user`.

<div class="compare">

<div class="example bad">

Bad

```crystal
def get_user
  @user
end

def set_user(value)
  @user = value
end
```

</div>

<div class="example good">

Good

```crystal
def user
  @user
end

def user=(value)
  @user = value
end
```

</div>

</div>

### [`Naming/AsciiIdentifiers`](/api/1.6.0/Ameba/Rule/Naming/AsciiIdentifiers.html)

Disallows non-ASCII characters in identifiers such as class names, method names, variables, and symbol literals.

<div class="compare">

<div class="example bad">

Bad

```crystal
class BigAwesome🐺
end
```

</div>

<div class="example good">

Good

```crystal
class BigAwesomeWolf
end
```

</div>

</div>

### [`Naming/RescuedExceptionsVariableName`](/api/1.6.0/Ameba/Rule/Naming/RescuedExceptionsVariableName.html)

Makes sure that rescued exception variables use expected names (by default `e`, `ex`, or `exception`).

<div class="compare">

<div class="example bad">

Bad

```crystal
rescue wtf
  Log.error(exception: wtf) { "Error" }
end
```

</div>

<div class="example good">

Good

```crystal
rescue ex
  Log.error(exception: ex) { "Error" }
end
```

</div>

</div>

### [`Naming/BlockParameterName`](/api/1.6.0/Ameba/Rule/Naming/BlockParameterName.html)

Reports non-descriptive block parameter names. By default, names shorter than 3 characters are flagged, with exceptions for common short names like `_`, `e`, `i`, `j`, `k`, `v`, `x`, `y`, and others.

<div class="compare">

<div class="example bad">

Bad

```crystal
tokens.each do |t|
  t.last_accessed_at = Time.utc
end
```

</div>

<div class="example good">

Good

```crystal
tokens.each do |token|
  token.last_accessed_at = Time.utc
end
```

</div>

</div>

### [`Naming/BinaryOperatorParameterName`](/api/1.6.0/Ameba/Rule/Naming/BinaryOperatorParameterName.html)

Enforces that certain binary operator methods have their sole parameter named `other`.

<div class="compare">

<div class="example bad">

Bad

```crystal
def +(amount)
  # ...
end
```

</div>

<div class="example good">

Good

```crystal
def +(other)
  # ...
end
```

</div>

</div>

## Breaking changes

### Rule group reorganization

Naming-related rules ([#413](https://github.com/crystal-ameba/ameba/pull/413)) and documentation-related rules ([#412](https://github.com/crystal-ameba/ameba/pull/412)) were moved into their own rule groups, `Naming` and `Documentation` respectively. If you reference these rules in `# ameba:disable` pragmas or your `.ameba.yml` configuration, you may need to update their names:

- `Style/PredicateName` → `Naming/PredicateName`
- `Style/TypeNames` → `Naming/TypeNames`
- `Style/MethodNames` → `Naming/MethodNames`
- `Style/VariableNames` → `Naming/VariableNames`
- `Style/ConstantNames` → `Naming/ConstantNames`
- `Style/QueryBoolMethods` → `Naming/QueryBoolMethods`
- `Lint/Documentation` → `Documentation/Documentation`

### Invalid file paths now raise errors

Passing non-existent file paths to Ameba now raises an error ([#394](https://github.com/crystal-ameba/ameba/pull/394)) instead of silently skipping them.

## Notable improvements

### Refactored `--rules` CLI switch output

This change makes the rule list formatted and nicely colored for better visual grepability.

![](/gallery/posts/release-v1-6-0/rules-output.png)

### New `--describe <rule-name>` CLI switch

 New switch was added ([#390](https://github.com/crystal-ameba/ameba/pull/390)), allowing you to quickly inspect a rule's description and configuration:

![](/gallery/posts/release-v1-6-0/describe-rule-output.png)

### Enhanced `Lint/NotNilAfterNoBang`

The `Lint/NotNilAfterNoBang` rule now also reports calls to `#match` ([#423](https://github.com/crystal-ameba/ameba/pull/423)).

### Improved `Naming/AsciiIdentifiers`

The rule now additionally reports non-ASCII characters in symbol literals ([#424](https://github.com/crystal-ameba/ameba/pull/424)).

## Bug fixes

- Fixed `Lint/LiteralsComparison` false positive with dynamic literals ([#417](https://github.com/crystal-ameba/ameba/pull/417)).
- Fixed `ShadowingOuterLocalVar` false positive with expanded arguments ([#426](https://github.com/crystal-ameba/ameba/pull/426)).
- Fixed Crystal next compatibility by removing deprecated API calls ([#407](https://github.com/crystal-ameba/ameba/pull/407)).
- Reverted an incorrect improvement to `Performance/ExcessiveAllocations` ([#428](https://github.com/crystal-ameba/ameba/pull/428)).
