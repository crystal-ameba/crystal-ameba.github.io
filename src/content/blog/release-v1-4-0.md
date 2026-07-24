---
title: "Ameba 1.4.0 has been released"
description: "This release brings 6 new rules, performance and metrics severity tweaks, colored output, Docker images on GHCR, and more."
pubDate: 2023-01-28T07:33:53
category: "Release announcement"
tags:
  - releases
---

This release brings 6 new rules, colored severity output, Docker images available on [GHCR](https://github.com/crystal-ameba/ameba/pkgs/container/ameba), and several internal refinements.
Check out the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v1.4.0)
to see a full scope of changes.

## New rules

### [`Lint/LiteralAssignmentsInExpressions`](/ameba/1.4.0/Ameba/Rule/Lint/LiteralAssignmentsInExpressions.html)

A rule that detects literal assignments used in expressions — a common source of bugs when `==` was intended instead of `=`.

<div class="compare">

<div class="example bad">

Bad

```crystal
if x = 42
  puts "matched!"
end
```

</div>

<div class="example good">

Good

```crystal
if x == 42
  puts "matched!"
end
```

</div>

</div>

### [`Lint/UnusedBlockArgument`](/ameba/1.4.0/Ameba/Rule/Lint/UnusedBlockArgument.html)

A dedicated rule for reporting unused block arguments. Previously this was partially covered by `Lint/UnusedArgument`, but now it gets its own rule with clearer messages and autocorrection support.

```crystal
def foo(&block)
  # `block` is never called
end
```

Use `&_block` or the anonymous `&` to silence it.

### [`Lint/MissingBlockArgument`](/ameba/1.4.0/Ameba/Rule/Lint/MissingBlockArgument.html)

Reports yielding methods that lack an explicit block argument — making it harder for callers to pass a named block.

```crystal
def foo
  yield 42
end
```

Adding `&` (or `&block`) makes the block explicit and introspectable.

### [`Lint/Formatting`](/ameba/1.4.0/Ameba/Rule/Lint/Formatting.html)

Integrates `crystal tool format` checks directly as an Ameba rule. You can now replace your separate `crystal tool format --check` CI step with an Ameba rule, keeping all linting unified.

### [`Style/ParenthesesAroundCondition`](/ameba/1.4.0/Ameba/Rule/Style/ParenthesesAroundCondition.html)

Renamed from the former `Style/RedundantParentheses` with a more flexible behavior. This rule enforces consistent use of parentheses around conditions in `if`/`unless`/`case`/`while`/`until`. It replaces the old `ExcludeAssignments` option with `AllowSafeAssignment` — when set, assignments in conditions are expected to be wrapped in parentheses.

<div class="compare">

<div class="example bad">

Bad

```crystal
if (x > 0)
  puts x
end
```

</div>

<div class="example good">

Good

```crystal
if x > 0
  puts x
end
```

</div>

</div>

### [`Style/QueryBoolMethods`](/ameba/1.4.0/Ameba/Rule/Style/QueryBoolMethods.html)

Reports boolean properties defined with `property` or `getter` instead of their `?`-suffixed variants.

<div class="compare">

<div class="example bad">

Bad

```crystal
class Person
  property deceased = false
end
```

</div>

<div class="example good">

Good

```crystal
class Person
  property? deceased = false
end
```

</div>

</div>

## Breaking changes

### Boolean properties are now query-style methods

Boolean rule properties now generate query-style methods (`enabled?` instead of `enabled`). This affects the public API for rule configuration — if you reference rule properties like `rule.enabled` or `rule.excluded` in custom code or extensions, you'll need to update them to `rule.enabled?` and `rule.excluded?` respectively. This is a more idiomatic Crystal pattern and makes the API consistent.

### Default severity for `Performance` and `Metrics` groups changed to `warning`

Rules in the `Performance` and `Metrics` groups now default to `warning` severity instead of `convention`. This makes them stand out more in the output, reflecting their higher importance for code quality.

### Tweaked issue location reporting

Issue locations now point to the full affected node range (e.g. `&block`) instead of just the first character (`&`). This makes the highlighted source locations more accurate and useful for autocorrection.

### Removed buggy autocorrect from `Performance/AnyInsteadOfEmpty`

The autocorrect for `Performance/AnyInsteadOfEmpty` was producing invalid code in several edge cases. It has been removed to avoid generating incorrect suggestions — the rule still reports issues, but corrections must now be applied manually.

## Autocorrection improvements

- **`Style/UnlessElse`** — now has autocorrect support, automatically rewriting `unless/else` blocks to `if/else`.
- **`Lint/UnusedArgument`** and **`Lint/UnusedBlockArgument`** — extended with corrections that prefix unused arguments with `_` or replace named block arguments with anonymous `&`.

## Other notable changes

- **Colored severity output** — each severity level now has a dedicated color in the terminal output, making issues easier to scan at a glance.
- **Docker images on GHCR** — Ameba is now published as a Docker image to the GitHub Container Registry, instead of Docker Hub.
- **Anonymous block arguments** — `Lint/UnusedArgument` no longer reports anonymous block arguments (`&`), delegating that to the new `Lint/UnusedBlockArgument` rule.
- **Infrastructure updates** — CI definitions were refreshed, Dependabot was added for automated dependency updates, and OpenSSL was removed from the Docker image to reduce its size.

Check out the [full changelog](https://github.com/crystal-ameba/ameba/compare/v1.3.1...v1.4.0) for a complete list of changes.
