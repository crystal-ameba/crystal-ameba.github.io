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

It varies on what to do next, but source code is a very difficult format for
static analysis. Fortunately, Crystal language allows a rich amount of source
code pre-processing, including [AST parsing](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

List of AST nodes is a quite convenient format of a source code to iterate through and analyze.

As you might have noticed, a `Source` responds to
[`#ast`](https://crystal-ameba.github.io/ameba/Ameba/Source.html#ast-instance-method) method,
which returns a source code parsed into a list of AST nodes:

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

In our example, it returns an instance of `Crystal::ClassDef` because the top level node
in the source code is a class, which is parsed by Crystal's AST parser as `ClassDef`.


### Rules

### Format results
