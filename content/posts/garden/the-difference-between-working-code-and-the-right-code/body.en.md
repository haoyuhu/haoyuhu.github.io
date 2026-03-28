For a while, I let AI write a lot of code for me. Much of it worked. It compiled, the tests passed, and nothing was obviously broken.

And still, some of those files made me want to rewrite them on sight.

Not because they had bugs. Because I could already see what they would feel like three months later.

## Works is not enough

There is a kind of code that is technically correct but structurally wrong. It solves today’s problem while quietly making tomorrow worse.

A few common smells:
- abstractions that arrive too early
- branching that handles current cases but makes new cases painful
- names that describe implementation instead of domain intent
- helpers that remove duplication now and add coupling later

Tests help answer: **does this behave correctly?**

They are much worse at answering: **will this code become a burden to live with?**

That second judgment matters just as much. And in my experience, AI did not teach me that.

Maintenance did.

After enough time inside ugly systems, you build a physical sense for code that will become expensive. You read a function and something in you tenses up before you can fully explain why. The shape is wrong. The cost is coming.

That feeling is hard to formalize. It is part taste, part scar tissue, part memory.

AI is useful here. It can produce a fast draft, explore options, and remove mechanical work. But the judgment of <u>future pain</u> still comes from lived contact with bad code.

The job is not only to make code pass today.

It is to avoid making someone miserable later. Very often, that someone is you.
