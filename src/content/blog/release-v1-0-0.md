---
title: "Ameba 1.0.0 has been released"
description: "This release includes a long-waiting autocorrection feature, new rules and several improvements. Check out the release notes to see a full scope of changes."
pubDate: 2021-10-04T12:54:30
category: "Release announcement"
tags:
  - releases
---

This release includes a long-waiting autocorrection feature, new rules and several improvements.
Check out the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v1.0.0)
to see a full scope of changes.

### Crystal compatibility

This release introduces [Crystal 1.4](https://crystal-lang.org/2022/04/06/1.4.0-released.html) compatibility and **breaks compatibility with previous Crystal versions**.
Use the latest Ameba bugfix release [0.14.4](https://github.com/crystal-ameba/ameba/releases/tag/v0.14.4)
if you need compatibility with Crystal `1.3.x` or below.

### Autocorrection

Thanks to the community, there is a huge step forward implementing autocorrection for Ameba.
The feature was originally developed in [#248](https://github.com/crystal-ameba/ameba/pull/248) and afterwards improved in several cycles.

Now if Ameba reports an issue which can be corrected, it adds a `[Correctable]` notice:

```sh
$ ameba --only Style/RedundantBegin src/file_utils.cr

src/file_utils.cr:428:5 [Correctable]
[C] Style/RedundantBegin: Redundant `begin` block detected
> begin
  ^---^
```

meaning, if you append a new `--fix` command-line flag to the command it will automatically
correct the issue adding another notice `[Corrected]`:

```sh
ameba --only Style/RedundantBegin src/file_utils.cr --fix

src/file_utils.cr:428:5 [Corrected]
[C] Style/RedundantBegin: Redundant `begin` block detected
> begin
  ^---^
```

using a git diff we can quickly check that Ameba removed a reported redundant begin block
and used the exception handler as part of a method:

```diff
diff --git a/src/file_utils.cr b/src/file_utils.cr
index e82e3c1e1..d416ed05b 100644
--- a/src/file_utils.cr
+++ b/src/file_utils.cr
@@ -425,10 +425,8 @@ module FileUtils
   # FileUtils.rm_rf("non_existent_file")
   # ```
   def rm_rf(path : Path | String) : Nil
-    begin
-      rm_r(path)
-    rescue File::Error
-    end
+    rm_r(path)
+  rescue File::Error
   end
```

Note: not all rules support autocorrection yet, but if you see a `[Correctable]`
flag on a reported issue, do not hesitate to autocorrect it in order to save some time
during refactoring.

### New rules

#### [`Lint/AmbiguousAssignment`](/ameba/1.0.0/Ameba/Rule/Lint/AmbiguousAssignment.html)

A tiny rule that checks for mistyped shorthand assignments.

<div class="compare">

<div class="example bad">

Bad

```crystal
x =- y
x =+ y
x =! y
```

</div>

<div class="example good">

Good

```crystal
x -= y # or x = -y
x += y # or x = +y
x != y # or x = !y
```

</div>

</div>

#### [`Lint/DebugCalls`](/ameba/1.0.0/Ameba/Rule/Lint/DebugCalls.html)

A rule that disallows calls to debug-related methods.
This is because we don't want debug calls accidentally being committed into our codebase.

```crystal
a = 2
pp! a # error: Possibly forgotten debug-related `pp!` call detected
a = a + 1
```

Check out the [API doc](/ameba/1.0.0/Ameba/Rule/Lint/DebugCalls.html) to see a full list of supported debug-related calls.

#### [`Style/GuardClause`](/ameba/1.0.0/Ameba/Rule/Style/GuardClause.html)

A rule that enforces a guard clause instead of wrapping the code inside
a conditional expression.

<div class="compare">

<div class="example bad">

Bad

```crystal
def test
  if something
    work
  end
end
```

</div>

<div class="example good">

Good

```crystal
def test
  return unless something

  work
end
```

</div>

</div>

### New spec matchers

Ameba has a high code coverage which was obviously achieved by a big amount of tests.
However, most of the rule specs were too imperative and it led to code duplication
and some readability issues.

In this release, new spec matchers for rule tests [were introduced](https://github.com/crystal-ameba/ameba/pull/245).
This new declarative approach allows to easily track all the reported issues in specs.

```crystal
it "reports multiple shared variables in spawn" do
  expect_issue subject, %(
    foo, bar, baz = 0, 0, 0

    while foo < 10
      baz += 1

      spawn do
        puts foo
           # ^^^ error: Shared variable `foo` is used in fiber
        puts foo + bar + baz
           # ^^^ error: Shared variable `foo` is used in fiber
                       # ^^^ error: Shared variable `baz` is used in fiber
      end

      foo += 1
    end
  )
end
```

Some explanation:

* `^^^` - tracks location of the reported node
* `error` - severity of the issue
* `Shared variable 'foo' is used in fiber` - the reported error message

These new matchers are used internally and of course can be used by Ameba extensions.
Check out the [doc](/ameba/1.0.0/Ameba/Spec/ExpectIssue.html) for more details.
