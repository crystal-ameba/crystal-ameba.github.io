---
title: Ameba v0.13.0 has been released 
date: 2020-06-22 12:54:30
tags:
  - releases
category:
  - Release announcement
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/release-v0.13.0.md
---

A very small release that supports [Crystal 0.35.0](https://github.com/crystal-lang/crystal/releases/tag/0.35.0)
and eliminates the deprecation messages which are related to yaml serialization.

Checkout the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v0.13.0)
to see a full scope of changes.

<!-- more -->

### Move to `YAML::Serializable`

Each rule in Ameba can be serialized to YAML and deserialized back to the Crystal struct.
This is needed in order to give users an ability to configure the Ameba binary
using the configuration file `.ameba.yml`.

And in order to deserialize, Ameba used [`YAML.mapping`](https://crystal-lang.org/api/0.35.1/YAML.html#mapping(**_properties_)-macro)
macro. And starting from Crystal `0.35.0` this macro is deprecated since there
is a better alternative which is the [`YAML::Serializable`](https://crystal-lang.org/api/0.35.1/YAML/Serializable.html)
module.

Starting from this release, Ameba uses `YAML::Serializable`. The older version
of Ameba still works with Crystal `0.35.0` however, users might see the
deprecation warning while compiling the binary.

### New Rules


#### [`Lint/BadDirective`](/ameba/Ameba/Rule/Lint/BadDirective.html)

This is a new rule that reports the incorrect comment directive for Ameba.

For example, the user can mistakenly add a directive to disable a rule that even doesn't exist:

```crystal
# ameba:disable BadRuleName
def foo
  :bar
end
```

Now, such a comment directive above will be propertly reported.

### [`Style/IsANil`](/ameba/Ameba/Rule/Style/IsANil.html)

Crystal has two ways for checking the `nil` equality: `.is_a?(Nil)` and `.nil?`.

Since the second is much more consice and doing basically the same, now Ameba
disallows calls to `.is_a?(Nil)` in favor of `.nil?`.

This is considered bad:

```crystal
var.is_a? Nil
```

And needs to be written as:

```crystal
var.nil?
```

### Support

A new Patreon page has been created recently to support Ameba.
If you enjoy the project please consider becoming a patreon which will give
more attention to the project from the development perspective and make it better.

[![](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/join/2488933/checkout)
