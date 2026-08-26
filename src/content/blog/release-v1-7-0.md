---
title: "Ameba 1.7.0 has been released"
description: "Ameba 1.7 adds 37 new rules, supports Crystal 1.19+, and introduces several important changes to rules, configuration, and the CLI."
pubDate: 2026-08-26T12:00:00
category: "Release announcement"
tags:
  - releases
---

This release is a milestone — **37 new rules**, major internal rewrites, and a wave of quality-of-life features. Check out the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v1.7.0) to see the full scope of changes.

## Crystal compatibility

Ameba 1.7 requires **Crystal 1.19.0 or newer** to build.

## Windows compatibility

With Crystal nearing tier 1 Windows support, Ameba 1.7.0 makes sure it runs equally well on Windows as on other platforms. This effort was tracked in [#668](https://github.com/crystal-ameba/ameba/issues/668).

## Distribution binaries

Binaries for Linux, macOS, and Windows are being built in CI upon release ([#789](https://github.com/crystal-ameba/ameba/issues/789)).

## Breaking changes ⚠️

This release contains a fair number of breaking changes. Here's what to watch out for:

### Removed auto-compilation (`bin/ameba`)

Ameba no longer builds a `bin/ameba` binary automatically on `shards install/update` — the `postinstall` script has been dropped. The recommended way to run Ameba going forward is via the [GitHub Action](https://github.com/crystal-ameba/github-action), which uses a precompiled binary (~1s per run) instead of building from source (~1+ min). Alternatively, add an `ameba` target to your `shard.yml` and run `shards build ameba`.

The `bin/ameba.cr` executable is no longer copied into your project's `bin/` directory either — use `lib/ameba/bin/ameba.cr` directly or copy it over for local modification if needed.

### CLI: `--fail-level` replaced by `--min-severity`

The `--fail-level` switch has been replaced with `--min-severity`. The new flag filters which issues get reported based on their severity, instead of just affecting the exit code. This aligns Ameba more closely with tools like Credo (`--min-priority`).

### Project root detection

Invoking Ameba from outside the project directory now correctly discovers the project root and respects the `Excluded` paths from the closest `.ameba.yml`. The default exclusion of the `lib` folder was moved from globs (as `!lib`) to `Excluded` (as `lib`) — which may affect custom `.ameba.yml` configurations.

### Unknown config attributes are now silently ignored

Previously, Ameba would raise on unknown attributes in `.ameba.yml`. Now they are silently ignored, making it easier to share config across Ameba versions.

### Renamed rules

- `Documentation/DocumentationAdmonition` → `Documentation/Admonition`
- `Lint/DuplicatedRequire` → `Lint/DuplicateRequire`

Update your `.ameba.yml` config and `# ameba:disable` directives if you reference these rules by name.

### [`Documentation/Admonition`](/api/1.7.0/Ameba/Rule/Documentation/Admonition.html) is now disabled by default

This rule checks for NOTE/TODO/WARNING markers in documentation comments. It's now disabled by default because it's a subjective style preference and may be too noisy for many projects.

### [`Lint/Typos`](/api/1.7.0/Ameba/Rule/Lint/Typos.html) is now disabled by default

Due to performance limitations and file-scoping issues, `Lint/Typos` is no longer active out of the box. Enable it explicitly in `.ameba.yml` if you still want to use it.

### Versioned documentation

Documentation URLs now include the version. If you link to Ameba documentation, the URL structure has changed: `crystal-ameba.github.io/ameba` -> `crystal-ameba.org/api/<version>`. Rule presenter output also now includes the versioned documentation URL.

### Other breaking changes

- [`Lint/UselessAssign`](/api/1.7.0/Ameba/Rule/Lint/UselessAssign.html) — `ExcludeTypeDeclarations` option was removed without replacement
- [`Lint/SpecFilename`](/api/1.7.0/Ameba/Rule/Lint/SpecFilename.html) — `IgnoredDirs` and `IgnoredFilenames` options were replaced with `IgnoredPaths`
- [`Performance/AnyInsteadOfEmpty`](/api/1.7.0/Ameba/Rule/Performance/AnyInsteadOfEmpty.html) — this rule has been deprecated
- Ameba now raises on invalid file paths instead of silently skipping them

All of the breaking changes are documented in the [migration guide](https://github.com/crystal-ameba/ameba/wiki/Migration-guide).

## 37 new rules

This release adds the largest batch of new rules ever.

### Lint

- [`Lint/AssignmentInCallArgument`](/api/1.7.0/Ameba/Rule/Lint/AssignmentInCallArgument.html) — detects assignments used as call arguments (e.g. `foo(x = 1)`)
- [`Lint/DeprecatedRule`](/api/1.7.0/Ameba/Rule/Lint/DeprecatedRule.html) — reports deprecated rules
- [`Lint/DuplicateBranch`](/api/1.7.0/Ameba/Rule/Lint/DuplicateBranch.html) — flags `when` branches containing the same code
- [`Lint/DuplicateEnumValue`](/api/1.7.0/Ameba/Rule/Lint/DuplicateEnumValue.html) — warns on enum members with duplicate values
- [`Lint/DuplicateMethodSignature`](/api/1.7.0/Ameba/Rule/Lint/DuplicateMethodSignature.html) — flags methods with identical signatures
- [`Lint/DuplicateWhenCondition`](/api/1.7.0/Ameba/Rule/Lint/DuplicateWhenCondition.html) — detects duplicate conditions in `when` branches
- [`Lint/ElseNil`](/api/1.7.0/Ameba/Rule/Lint/ElseNil.html) — reports `else nil` in constructs where returning `nil` is already implicit
- [`Lint/EnumMemberNameConflict`](/api/1.7.0/Ameba/Rule/Lint/EnumMemberNameConflict.html) — warns when an enum member name clashes with a method
- [`Lint/NonExistentRule`](/api/1.7.0/Ameba/Rule/Lint/NonExistentRule.html) — flags references to rules that don't exist
- [`Lint/RequireParentheses`](/api/1.7.0/Ameba/Rule/Lint/RequireParentheses.html) — enforces parentheses around method calls
- [`Lint/SelfInitializeDefinition`](/api/1.7.0/Ameba/Rule/Lint/SelfInitializeDefinition.html) — flags `self.initialize` definitions
- [`Lint/SignalTrap`](/api/1.7.0/Ameba/Rule/Lint/SignalTrap.html) — warns on `Signal.trap` usage
- [`Lint/SpecEqWithBoolOrNilLiteral`](/api/1.7.0/Ameba/Rule/Lint/SpecEqWithBoolOrNilLiteral.html) — flags `should eq(true / false / nil)` in specs
- [`Lint/TopLevelOperatorDefinition`](/api/1.7.0/Ameba/Rule/Lint/TopLevelOperatorDefinition.html) — warns on operator definitions at the top level
- [`Lint/TrailingRescueException`](/api/1.7.0/Ameba/Rule/Lint/TrailingRescueException.html) — flags trailing `rescue` clauses that include exception types
- [`Lint/UnusedExpression`](/api/1.7.0/Ameba/Rule/Lint/UnusedExpression.html) — flags unused expressions
- [`Lint/UnusedRescueVariable`](/api/1.7.0/Ameba/Rule/Lint/UnusedRescueVariable.html) — flags unused rescue variables
- [`Lint/UselessVisibilityModifier`](/api/1.7.0/Ameba/Rule/Lint/UselessVisibilityModifier.html) — warns on redundant `protected` visibility modifier
- [`Lint/VoidOutsideLib`](/api/1.7.0/Ameba/Rule/Lint/VoidOutsideLib.html) — flags `Void` type usage outside `lib` declarations
- [`Lint/WhitespaceAroundMacroExpression`](/api/1.7.0/Ameba/Rule/Lint/WhitespaceAroundMacroExpression.html) — enforces whitespace around `{{ }}` macro expressions

### Style

- [`Style/CallParentheses`](/api/1.7.0/Ameba/Rule/Style/CallParentheses.html) — flags unnecessary parentheses on method calls
- [`Style/Elsif`](/api/1.7.0/Ameba/Rule/Style/Elsif.html) — encourages the use of `case/when` syntax over `if/elsif`
- [`Style/HeredocEscape`](/api/1.7.0/Ameba/Rule/Style/HeredocEscape.html) — flags unnecessary escapes in heredocs
- [`Style/HeredocIndent`](/api/1.7.0/Ameba/Rule/Style/HeredocIndent.html) — enforces consistent heredoc indentation
- [`Style/MultilineCurlyBlock`](/api/1.7.0/Ameba/Rule/Style/MultilineCurlyBlock.html) — recommends `do ... end` over `{ ... }` for multiline blocks
- [`Style/MultilineStringLiteral`](/api/1.7.0/Ameba/Rule/Style/MultilineStringLiteral.html) — flags multiline string literals that could use heredocs
- [`Style/PercentLiteralDelimiters`](/api/1.7.0/Ameba/Rule/Style/PercentLiteralDelimiters.html) — enforces consistent delimiters in percent literals
- [`Style/RedundantNilInControlExpression`](/api/1.7.0/Ameba/Rule/Style/RedundantNilInControlExpression.html) — flags redundant `nil` in control expressions
- [`Style/RedundantSelf`](/api/1.7.0/Ameba/Rule/Style/RedundantSelf.html) — flags unnecessary `self` receiver
- [`Style/VerboseNilType`](/api/1.7.0/Ameba/Rule/Style/VerboseNilType.html) — suggests `T?` instead of `T | Nil`
- [`Style/ArrayLiteralSyntax`](/api/1.7.0/Ameba/Rule/Style/ArrayLiteralSyntax.html) — enforces `Array(Type).new` over `[] of Type` for array instantiations
- [`Style/HashLiteralSyntax`](/api/1.7.0/Ameba/Rule/Style/HashLiteralSyntax.html) — enforces `Hash(K, V).new` over `{} of K => V` for hash instantiations

### Typing

- [`Typing/MacroCallArgumentTypeRestriction`](/api/1.7.0/Ameba/Rule/Typing/MacroCallArgumentTypeRestriction.html) — enforces type restrictions on macro call arguments
- [`Typing/MethodParameterTypeRestriction`](/api/1.7.0/Ameba/Rule/Typing/MethodParameterTypeRestriction.html) — enforces type restrictions on method parameters
- [`Typing/MethodReturnTypeRestriction`](/api/1.7.0/Ameba/Rule/Typing/MethodReturnTypeRestriction.html) — enforces return type restrictions on methods
- [`Typing/ProcLiteralReturnTypeRestriction`](/api/1.7.0/Ameba/Rule/Typing/ProcLiteralReturnTypeRestriction.html) — enforces return type restrictions on proc literals

### Performance

- [`Performance/TimesMap`](/api/1.7.0/Ameba/Rule/Performance/TimesMap.html) — suggests using `Array.new(n) { ... }` over `n.times.map { ... }`

## Rule deprecation mechanism

Ameba now supports marking rules as deprecated. Deprecated rules are still available but will emit a warning when used. [`Performance/AnyInsteadOfEmpty`](/api/1.7.0/Ameba/Rule/Performance/AnyInsteadOfEmpty.html) was the first rule to be deprecated in this release.

## Rule versioning

Rules can now declare a `since_version` — the Ameba version in which they were introduced. Use `--up-to-version <version>` to exclude rules added after a given version, or `--rule-versions` to display version info alongside each rule. You can also set `Version` in `.ameba.yml` to automatically limit rules to those available at that version.

## JSON Schema for `.ameba.yml`

Ameba now ships with a [JSON Schema](https://github.com/crystal-ameba/ameba/pull/497) for its configuration file, along with a generator that keeps it up-to-date as rules change. This enables autocompletion and inline documentation when editing `.ameba.yml` in compatible editors.

## GitHub Actions formatter

A new `github-actions` formatter produces annotations compatible with GitHub Actions, making it easy to see issues inline in PR checks.

## Liveness analysis rewrite

Three rules ([`Lint/UselessAssign`](/api/1.7.0/Ameba/Rule/Lint/UselessAssign.html), [`Lint/ShadowedArgument`](/api/1.7.0/Ameba/Rule/Lint/ShadowedArgument.html), [`Lint/SharedVarInFiber`](/api/1.7.0/Ameba/Rule/Lint/SharedVarInFiber.html)) were rewritten using backward dataflow liveness analysis. This replaces the old branch-consumption heuristic with a sound algorithm that:

- **Improves accuracy** — eliminates false positives from imprecise branch handling
- **Improves performance** — `Lint/UselessAssign` on the Crystal compiler source went from ~4.5s to under 1s
- **Handles loops correctly** — fixed-point iteration replaces the conservative `referenced_in_loop?` flag
- **Handles flow control** — `break`/`next`/`return` propagate to the correct target live set

These changes also allowed the removal of the `AST::Branch` and `AST::Branchable` modules, simplifying the codebase significantly.

## ECR file linting

Ameba can now lint `.ecr` files (Embedded Crystal) by default — no configuration needed. This makes it easy to catch issues in templates right from the command line.

## Autocorrect additions

Several more rules now support autocorrect: `Lint/RedundantStringCoercion` (new), and existing rules gained broader autocorrect coverage through the work in [#796](https://github.com/crystal-ameba/ameba/pull/796).

## New rule options

- [`Documentation/Documentation`](/api/1.7.0/Ameba/Rule/Documentation/Documentation.html) — added `RequireExample` option
- [`Lint/SpecFilename`](/api/1.7.0/Ameba/Rule/Lint/SpecFilename.html) — added `IgnoredPaths` option (replacing `IgnoredDirs` and `IgnoredFilenames`)
- [`Naming/BinaryOperatorParameterName`](/api/1.7.0/Ameba/Rule/Naming/BinaryOperatorParameterName.html) — added `AllowedNames` option
- [`Style/ParenthesesAroundCondition`](/api/1.7.0/Ameba/Rule/Style/ParenthesesAroundCondition.html) — added `ExcludeMultiline` option

## Other highlights

- [`Style/RedundantBegin`](/api/1.7.0/Ameba/Rule/Style/RedundantBegin.html), [`Style/RedundantNext`](/api/1.7.0/Ameba/Rule/Style/RedundantNext.html), and [`Style/RedundantReturn`](/api/1.7.0/Ameba/Rule/Style/RedundantReturn.html) were extended to report inside blocks and `if`/`unless` branches
- Issue locations were improved across 14 rules for more precise error highlighting
- `--ignore-config` CLI flag added to skip reading `.ameba.yml` entirely
- Version output now includes the Git SHA for non-release builds
- Rule documentation URLs are now included in rule presenter output
- Docker images are now built with `--release`
- Windows CI support was added (see [Windows compatibility](#windows-compatibility))

**Full Changelog**: https://github.com/crystal-ameba/ameba/compare/v1.6.4...v1.7.0
