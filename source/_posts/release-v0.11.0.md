---
title: Ameba v0.11.0 - New rules, lint in parallel, GitHub actions and more.
date: 2019-11-28 00:54:30
tags:
  - releases
category:
  - Release announcement
toc: true
navbar_links:
  Edit on GitHub:
    icon: fas fa-edit
    url: https://github.com/crystal-ameba/crystal-ameba.github.io/edit/site/source/_posts/release-v0.11.0.md
---

Ameba [v0.11.0](https://github.com/crystal-ameba/ameba/releases/tag/v0.11.0) has been released.
Here we will go through the main **features and improvements** which are included to this
release. Also, will do **benchmarking** comparing parallel linting using
Crystal's experimental parallelism and will explain how to use Ameba together
with **GitHub actions**. 

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
as an experimental feature starting from `0.31.0`. The main intention here is
speed, which is achieved by doing several things in parallel. Ameba is a small set
of rules and enforcements and in most cases, it takes a couple of seconds to lint
an average shard. However, we still find it useful to parallize the linting,
especially on a large amount of sources.

We found that the easiest way to run linting in parallel is to spawn each
source into it's own channel. And since issues are added to the sources, we don't
have to care about thread safely, because a full set of rules will be running
sequentially on each source in it's own thread. So the only thing which is
needed is to wait the hole inspection on all sources at the end and gather results.

At a high level, it looks similar to this:

```crystal
channels = sources.map { Channel(Nil).new }

sources.each_with_index do |source, idx|
  channel = channels[idx]
  spawn do
    inspect(source) # run full set of rules
    channel.send(nil)
  end
end

channels.each { |c| c.receive }
```

In reality, it is a bit more complex, because we need to send exceptions to
the main thread. So it was simplified just to explain the concept.
Let's do some benchmarking now.

At first, we need to build Ameba using the `preview_mt` flag and install it manually:

```sh
$ crystal build src/cli.cr -Dpreview_mt -o bin/ameba
$ sudo make install
```
 
And then we can try running it on Crystal repo (1449 files for the moment)
using different amount of crystal workers:

```sh
$ time CRYSTAL_WORKERS=1 ameba --silent # 27.78s user 0.34s system 99% cpu 28.116 total
$ time CRYSTAL_WORKERS=2 ameba --silent # 29.54s user 0.22s system 147% cpu 20.184 total
$ time CRYSTAL_WORKERS=4 ameba --silent # 30.90s user 0.28s system 226% cpu 13.742 total
$ time CRYSTAL_WORKERS=8 ameba --silent # 44.67s user 0.44s system 413% cpu 10.900 total
```

If you look at the `total` part, you will find that the max time is `28.116`
seconds and the min one is `10.900` seconds. So we were able to run it
almost **3 times faster** on 8 workers.

However, the results are
not linear to the amount of workers. And that is expected, because our sources
(or more accurate, lines of code) are not divided evenly and some workers have
to inspect bigger sources and other workers will have to wait until they finish.

Of course, someone can say that we can pre-calculate the LoCs and divide the work
more evenly. And it would be true. But that would complicate our implementation
a lot. So here we decided to make it as simple as possible and keep the room
opened for the future improvements.

At the end, we must say that this feature is fully functional and reliable on 
Ameba's side. It was well tested using different formatters, so the end user
is free to try it to inspect his crystal code in parallel. We are looking for
the best results, keep us posted!

### GitHub Action

Ameba GitHub action [has been released](https://github.com/crystal-ameba/github-action)
and the first version [has been published](https://github.com/marketplace/actions/crystal-ameba-linter)
to the GitHub marketplace.

The easiest way to use it is to follow installation intructions:

```yml
# Copy and paste the following snippet into your .yml file.

- name: Crystal Ameba Linter
  uses: crystal-ameba/github-action@v0.1.1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

And here is an example of the workflow with Ameba and Crystal specs:

```yml
# Create .github/workflows/crystal.yml in your repository

name: Crystal CI

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    container:
      image: crystallang/crystal

    steps:
    - uses: actions/checkout@v1
    - name: Crystal Ameba Linter
      id: crystal-ameba
      uses: crystal-ameba/github-action@v0.1.1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - name: Install dependencies
      run: shards install
    - name: Run tests
      run: crystal spec
```

Once this is added to GitHub action workflow, Ameba will start reporting
annotations in pull requests:

![](https://raw.githubusercontent.com/crystal-ameba/github-action/master/assets/sample.png)

Keep in mind, that is very first release for this GitHub action and it misses a
couple of required configuration options. However, it still uses
`.ameba.yml` config in the repository root and properly configures rules before
running the inspection. Hope you would enjoy it!

### More

This release also includes a couple of bug fixes and small improvements.
Checkout the [release notes](https://github.com/crystal-ameba/ameba/releases/tag/v0.11.0)
for more details.
