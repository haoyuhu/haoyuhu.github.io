---
title: Loading data from multiple sources with RxJava
date: 2016-01-19
toc: true
categories: 
- 来自新世界
tags:
- RxJava
---
Simply copy from [Loading data from multiple sources with RxJava](http://blog.danlew.net/2015/06/22/loading-data-from-multiple-sources-with-rxjava/)

Suppose I have some Data
* that I query from the network. I could simply hit the network each time I need the data, but caching the data on disk and in memory would be much more efficient.
* More specifically, I want a setup that:
Occasionally performs queries from the network for fresh data.
Retrieves data as quickly as possible otherwise (by caching network results).

I'd like to present an implementation of this setup using[RxJava](https://github.com/ReactiveX/RxJava).

# Basic Pattern
Given an  `Observable<Data>` for each source (network, disk and memory), we can construct a simple solution using two operators, `concat()` and `first()`.

[concat()](http://reactivex.io/documentation/operators/concat.html) takes multiple Observables and concatenates their sequences. [first()](http://reactivex.io/documentation/operators/first.html) emits only the first item from a sequence. Therefore, if you use `concat().first()`, it retrieves the first item emitted by multiple sources.

Let's see it in action:
```
// Our sources (left as an exercise for the reader)
Observable<Data> memory = ...;  
Observable<Data> disk = ...;  
Observable<Data> network = ...;

// Retrieve the first source with data
Observable<Data> source = Observable  
  .concat(memory, disk, network)
  .first();
```

**The key to this pattern is that `concat()` only subscribes to each child Observable when it needs to.** There's no unnecessary querying of slower sources if data is cached, `sincefirst()` will stop the sequence early. In other words, if memory returns a result, then we won't bother going to disk or network. Conversely, if neither memory nor disk have data, it'll make a new network request.

Note that the order of the source `Observables` in `concat()` matters, since it's checking them one-by-one.

<!--more-->

# Stale Data
Unfortunately, now our data-saving code is working a little *too*well! It's always returning the same data, no matter how out-of-date it is. Remember, we'd like to go back to the server occasionally for fresh data.

The solution is in `first()`, which can also perform filtering. Just set it up to reject data that isn't worthy:
```
Observable<Data> source = Observable  
  .concat(memory, diskWithCache, networkWithSave)
  .first(data -> data.isUpToDate());
```
Now we'll only emit the first item that qualifies as up-to-date. Thus, if one of our sources has stale `Data`, we'll continue on to the next one until we find fresh `Data`.

# first() vs. takeFirst()
As an alternative to using `first()` for this pattern, you could also use [`takeFirst()`(http://reactivex.io/RxJava/javadoc/rx/Observable.html#takeFirst(rx.functions.Func1)).

The difference between the two calls is that `first()` will throw a NoSuchElementException if none of the sources emits valid data, whereas `takeFirst()` will simply complete without exception.

Which you use depends on whether you need to explicitly handle a lack of data or not.