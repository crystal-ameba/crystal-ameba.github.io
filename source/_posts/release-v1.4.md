---
title: Ameba v1.4 Release - New Features, Enhancements, and Bug Fixes
date: 2023-19-02 11:54:30
tags:
  - releases
category:
  - Release announcement
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/release-v1.4.md
---

We're pleased to announce the release of Ameba v1.4!

This release includes several new rules, enhancements, and bug fixes that will improve the performance and usability of Ameba. Let's take a closer look at some of the changes included in this release.

<!-- more -->

### 🔧 New Lint Rules

#### [`Lint/LiteralAssignmentsInExpressions`](/ameba/Ameba/Rule/Lint/LiteralAssignmentsInExpressions.html)

This rule checks for literal assignments in expressions in Crystal code.
It will flag any cases where a literal value (such as a boolean, string, or number) is assigned to a variable within an expression, helping to ensure that code is as clean and maintainable as possible.

<div class="compare">
{% example bad %}
Bad
```crystal
if foo = 42
  do_something
end
```
{% endexample %}

{% example good %}
Good

```crystal
if foo == 42
  do_something
end
```
{% endexample %}
</div>


#### [`Lint/UnusedBlockArgument`](/ameba/Ameba/Rule/Lint/UnusedBlockArgument.html)

This rule checks for unused block arguments in Crystal code. It will flag any block arguments that are not used within the block, helping to ensure that code is as clean and maintainable as possible.

<div class="compare">
{% example bad %}
Bad
```crystal
def foo(a, b, &block)
  a + b
end
```
{% endexample %}

{% example good %}
Good

```crystal
def foo(a, b, &_block)
  a + b
end
```
{% endexample %}
</div>

Worth noting that if the block is passed to the method and is used via `yield` statement the shortcut is required now:

<div class="compare">
{% example bad %}
Bad
```crystal
def bar(&block)
  yield 42
end
```
{% endexample %}

{% example good %}
Good

```crystal
def bar(&)
  yield 42
end
```
{% endexample %}
</div>


#### [`Lint/MissingBlockArgument`](/ameba/Ameba/Rule/Lint/MissingBlockArgument.html)

A block shortcut is now required by another rule `Lint/MissingBlockArgument`.
We strongly believe this improves the readability of your method definition:

<div class="compare">
{% example bad %}
Bad
```crystal
def foo
  yield 42
end
```
{% endexample %}

{% example good %}
Good

```crystal
def foo(&)
  yield 42
end
```
{% endexample %}
</div>

#### [`Lint/Formatting`](/ameba/Ameba/Rule/Lint/Formatting.html)

Now Ameba uses the Crystal's built-in formatter to warn about style inconsistencies.
You can also autocorrect the formatting issues calling Ameba `--fix` flag, which will use let the Crystal formatter do the job.

### 🐩 New Style Rules

#### [`Style/ParenthesesAroundCondition`](/ameba/Ameba/Rule/Style/ParenthesesAroundCondition.html)

A rule that checks for the presence of superfluous parentheses around the condition of `if`, `unless`, `case`, `while` and `until`.

#### [`Style/QueryBoolMethods`](/ameba/Ameba/Rule/Style/QueryBoolMethods.html)

### 🔨 More autocorrections

Lint/UnusedArgument
Lint/UnusedBlockArgument
Style/UnlessElse

### 🐳 New docker images

### 🌈 New coloring
