---
title: Writing an extension for Ameba linter
date: 2019-07-22 15:56:53
tags:
 - extension
category:
 - Tutorial
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/how-to-write-extension.md
---

It was [announced recently](https://github.com/crystal-ameba/ameba/pull/112) that Ameba
is going to be extendable.
That means any developer can create his own extension and use together
with Ameba's engine.

Here we will following through the steps on how to create such an extension and use it.

It is going to be `crystal-docs` extension, where a new rule will be implemented
which will **enforce classes to have documentation**.

### 1. New extension skeleton

Creating a new Ameba extension is as simple as creating a new Crystal library:

```sh
$ crystal init lib crystal-docs && cd crystal-docs
```

and adding Ameba as a dependency to `shard.yml`:

```yml shard.yml
name: ameba-docs
version: 0.1.0

authors:
  - Vitalii Elenhaupt <velenhaupt@gmail.com>

crystal: 0.29.0

license: MIT

development_dependencies:
  ameba:
    github: crystal-ameba/ameba
    version: ~> 0.10.0
```

It needs to be a development dependency because we don't want to force
the end application to be dependent on a specific version of Ameba.

### 2. Creating a rule

Ameba enforces rules to be extended from `Rule::Base` entity and to be a struct.
Let's create one:

```crystal src/ameba-docs.cr
module Ameba::Rule
  VERSION = "0.1.0"

  struct Docs ‹ Base
    properties do
      description "Enforces public classes to be documented"
    end

    MSG = "Class must be documented"

    def test(source)
      AST::NodeVisitor.new self, source
    end

    def test(source, node : Crystal::ClassDef)
      return unless node.visibility.public?

      doc = node.doc
      issue_for(node, MSG) if doc.nil? || doc.empty?
    end
  end
end
```

A couple of things are defined here:

1. `properties` defines a dsl for configurable rule properties. We only have a rule description.
2. `MSG` defines a constant for the error message to be reported.
3. `def test(source)` is an entry point of the rule. Here the method accepts a source file and
passes it to the node visitor, which allows us filter the `ClassDef` nodes in the method below.
4. `def test(source, node : Crystal::ClassDef)` is a method which does an actual job. The implementation is pretty self explained: it filters out node, which have public visibility and do not have (or have empty) docs.

The extension is pretty much done. Let's try to use it.

### 3. Plug-in the extension

Somewhere in a separate project we want to plug-in the ameba engine and the extension we made.

To do that, we need to add a development dependencies for both of this projects:

```yml shard.yml
development_dependencies:
  ameba:
    github: crystal-ameba/ameba
  ameba-docs:
    github: crystal-ameba/ameba-docs-rule-example
```

Then we install those deps:

```sh
$ shards install

Fetching https://github.com/veelenga/ameba.git
Fetching https://github.com/crystal-ameba/ameba-docs-rule-example.git
Installing ameba (0.10.0 at master)
Installing ameba-docs (0.1.0 at master)
```

It will create `bin/ameba.cr` file which is needed to built the ameba together with modules.

First, we need to enable the module:

```crystal bin/ameba.cr
require "ameba/cli"  # requires Ameba's cli
require "ameba-docs" # requires ameba docs extension
```

And now we are ready to build and run it:

```sh
$ crystal build bin/ameba.cr -o bin/ameba
$ bin/ameba
```

The results are displayed below. `crystal-docs` extension in action:


{% img /gallery/posts/how-to-write-extension/crystal-docs-ext.png %}


## Wrap up

We made a small Ameba extension and used that in a third-party project.
Of course, this was just an example of the rule and not a production ready
solution. However, it is a perfect example of the power of Ameba's modules.


The sources [are availabe on Github](https://github.com/crystal-ameba/ameba-docs-rule-example).
