---
title: Internal Ameba modules
date: 2019-08-02 00:54:30
tags:
  - parser
  - rule
  - formatter
  - modules
category:
  - Documentation
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/internal-modules.md
---

In this article you will find a high level overview of the Ameba's
modules, which will help to understand how it works internally.
We will cover everything needed starting from source code
loading and finishing by showing results of static analysis.

{% img /gallery/posts/internal-modules/ameba-modules.png %}

<!-- more -->

Ameba and similar command-line applications for static analysis are
required to be highly configurable.
The end-user, usually, is able to change the configuration, disable or enable that or
another checker/rule. Also, he is capable to change the format of the output results.
Most of the static analysis tools allow inline disabling and much more...

As you can see, there are a lot of different requirements for such kind of tools
and the appropriate design is a key for a good tool architecture and convenient usage.

Let's take a look at the high-level picture of Ameba's module architecture.

### Source Loading

Of course, the first step of static code analysis is a loading of that source code.
It does not matter whether it is a file, a steam or just a regular string, Ameba
is capable to read that and create a new [`Source`](https://crystal-ameba.github.io/ameba/Ameba/Source.html)
abstraction. Such internal representation of source code is very convenient
to operate on it. For example, it is possible to attach an
[`Issue`](https://crystal-ameba.github.io/ameba/Ameba/Issue.html) to this source.

`Source` also can be created programatically:

```crystal
require "ameba"

source = Ameba::Source.new %(
  class Ameba::Internals
    getter info : Info

    def explain
      puts info
    end
  end
)

source.issues # => []
```

### AST Parsing

Unprocessed source code is a very difficult format for static analysis.
Fortunately, Crystal language can do a lot of different ways of source
code pre-processing, including [AST parsing](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

List of AST nodes is a quite convenient representation of a source code to decompose.
It is widely used by Ameba internally to do a static analysis.

As you might have noticed, a `Source` responds to
[`#ast`](https://crystal-ameba.github.io/ameba/Ameba/Source.html#ast-instance-method) method,
which returns a list of AST nodes for that source:

```crystal
source.ast # =>
  # class Ameba::Internals
  #   getter(info : Info)
  #   def explain
  #     puts(info)
  #   end
  # end

source.ast.class # => Crystal::ClassDef
```

In this example, `ast` method returns an instance of `Crystal::ClassDef` because the top level node
in the source code is a class, which is parsed by Crystal's AST parser as `ClassDef`.

Next, nodes are iterated by rules.

### Rules

Rule is a basic abstraction that iterates over that or other representation of source code and
report issues if such are detected. All rules inherit from [`Rule::Base`](https://crystal-ameba.github.io/ameba/Ameba/Rule/Base.html)
and always are structs.

Most rules *visit* AST nodes. There is a couple of different *visitors* which pass needed nodes
to the handler. Let's say there is a rule that disallows calling `puts` in a code.
A simple version of it could look like this:

```crystal
module Ameba::Rule
  # A rule that disallows calls to `puts` method.
  struct NoPuts ‹ Rule::Base
    def test(source)
      AST::NodeVisitor.new self, source
    end

    def test(source, node : Crystal::Call)
      return unless node.name == "puts"
      source.add_issue(self, node, "puts method is called")
    end
  end
end
```

There are two different `test` method. The first one, which accepts a source is a main
entry point to the rule. It returns the [`AST::NodeVisitor`](https://crystal-ameba.github.io/ameba/Ameba/AST/NodeVisitor.html)
which will visit AST nodes and pass only needed ones to the second `test` method (handler).

In a handler we just explore the node properties and add issues to the source code
if the node matches the expectations.

So, in such a way a `Source` is passed to all the rules and can hold some issues on it:

```crystal
source.issues # =>
  # [
  #   Ameba::Issue(
  #     @rule=Ameba::Rule::Lint::NoPuts(
  #       @enabled=true,
  #       @severity=Warning,
  #       @excluded=nil
  #     ),
  #     @message="puts method is called",
  #     @location=...,
  #     @end_location=...,
  #     @status=nil
  #   )
  # ]

```

### Format results
