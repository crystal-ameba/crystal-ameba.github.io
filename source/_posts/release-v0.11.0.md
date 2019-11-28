---
title: Ameba v0.11.0 - Lint in parallel, GitHub action, new rules and more.
date: 2019-11-28 00:54:30
tags:
  - release notes
category:
  - Release
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/release-v0.11.0.md
---

Ameba [v0.11.0](https://github.com/crystal-ameba/ameba/releases/tag/v0.11.0) has been released.
Here we will go through the main **features and improvements** which are included to this
release. Also, you will do **benchmarking** comparing parallel linting using
Crystal's experimental parallelism. 

<!-- more -->

### New Rules

Crystal has several handy methods to iterate over collection together with
index/object:

- [Enumerable#each_with_index](https://crystal-lang.org/api/0.31.1/Enumerable.html#each_with_index(offset=0,&block)-instance-method)
- [Enumerable#each_with_object](https://crystal-lang.org/api/0.31.1/Enumerable.html#each_with_object(obj,&block)-instance-method)
- [Iterable#each_with_index](https://crystal-lang.org/api/0.31.1/Iterable.html#each_with_index(offset=0)-instance-method)
- [Iterable#each_with_object](https://crystal-lang.org/api/0.31.1/Iterable.html#each_with_object(obj)-instance-method)

They are usually used in places where an extra block argument (index or object) is
needed:

```crystal
collection.each.with_index do |e, index|
  puts e, index
end
```

However, sometimes after a couple of refactoring rounds, people realize they
don't need that additional argument anymore and forget to remove that extra call to
`with_index` (or `with_object`). Examples:

```crystal
collection.each.with_index do |e|
  puts e
end

collection.each_with_index do |e, _|
 puts e
end

collection.each_with_object(0) do |e|
  puts e
end
```

Now, all cases above are reported by Ameba. The suggested way to change it will be
the following:

```crystal
collection.each do |e|
  puts e
end
```

If your source code is not ready for these enforcements, they can be disabled in `.ameba.yml` via:

```yml
Lint/RedundantWithIndex:
  Enabled: false
  
Lint/RedundantWithObject:
  Enabled: false
```

### Parallel linting

Crystal started to [support parallism](https://crystal-lang.org/2019/09/06/parallelism-in-crystal.html)
 as an experimental feature starting from 0.31.0. The main intention here is
 speed, which is achieved by doing several things in parallel. Ameba is a small set
 of rules and enforcements and in most cases, it take a couple of seconds to lint
 an average shard. However, we still find it useful to parallize the linting,
 especially on a large amount of sources.
 
