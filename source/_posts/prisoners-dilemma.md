---
title: 浅谈Prisoner's Dilemma
date: 2016-02-01
toc: true
thumbnail: /2016/02/01/prisoners-dilemma/0.jpg
categories:
- 来自新世界
tags:
- Prisoner's Dilemma
---
转自[How to beat the Prisoner’s Dilemma in the TV game show Golden Balls](http://mindyourdecisions.com/blog/2012/04/24/how-to-beat-the-prisoners-dilemma-in-the-tv-game-show-golden-balls/)

Golden Balls is an amusing British game show. Especially interesting is the final contest which is a version of the Prisoner’s Dilemma.

If you’re never seen the show, here is how it works. Each of two contestants independently chooses to split or steal the final prize. If both choose split, then the prize is divided evenly. If one chooses split and the other steal, the person who steals gets the entire prize. If both choose steal, however, then both walk away with nothing.

Here’s the normal form representation of the game:

![game matrix](/2016/02/01/prisoners-dilemma/1.png)

How should you play this game?
One contestant had an amazingly brilliant strategy.
# **The wrong way to play the game**
Contestants are allowed to discuss strategy before picking split or steal.

Both realize that split gives a fair 50 percent share to each side, but each also sees the advantage of back-stabbing and stealing the prize.

The discussion usually involves the following strategy. Each person tries to convince the other person to split, and they promise to do the same.

I discussed an example of this in a previous post: [strategy in Golden Balls](http://mindyourdecisions.com/blog/2011/12/27/video-strategy-in-a-tv-game-show/).
In that episode, both were promising they would split the prize, but then one person decided at the last minute to steal all the money. She said she was not proud of the decision, but she herself did not want to be cheated.

So trying to split the money in a conventional way doesn’t work. Is there a better strategy?

<!--more-->

# **Why it’s bad to promise you will split**
First, I want to explain why the strategy of splitting does not work. When you promise the other person you will split the prize, you are trying to change the game.

You are telling them that instead of looking at the original payoffs, they should only consider the game under the assumption that you are going to split the prize. So you are telling them to consider the following game:

![game matrix](/2016/02/01/prisoners-dilemma/2.png)

Do you see what’s wrong with your strategy? If you promise them that you will split the prize, they are faced with a very tempting option to steal. If they split, they will only get 50 percent. But if they steal, they will get the entire 100 percent.

And therein lies the problem: if you promise you’ll SPLIT the prize, then you pretty much are telling them not to worry about the mutual steal option. This makes it a very good idea for them to STEAL the prize.
Clearly it’s a bad idea to promise that you’ll split the prize. Is there another way out?
# **How to beat the Prisoner’s Dilemma**
There’s a remarkably devious way to get cooperation: you must tell them that you will STEAL the prize!
How does this strategy play out? You should watch the following clip to see the negotiation:
**[Brilliant strategy in Golden Balls](http://www.youtube.com/watch?v=S0qjK3TWZE8#t=0m47s)**

The action proceeds as follows. One contestant, Nick, immediately announces
I want you to trust me. 100 percent I am going to pick the steal ball. I want you to choose split, and I promise you that I will split the money with you [after the show].

The other contestant is completely stunned by this strategy, and the audience finds it amusing too.
The next 2 minutes is a funny exchange between the two. Nick keeps explaining why he is going to steal, and the other is dumbfounded by this terrorist-like action. He wonders, why can’t they both split?

The host reminds them the plan is risky, as there is no legal requirement for the money to be split after the show is over.

Nick is called an idiot and the other contestant just can’t believe he expects cooperation. Nick has taken control of the game, and he has not acted nice. Why should the other person cooperate?
Nick promises over and over that he is an honest person and that he will definitely split the money after the show.

At the 5:21 mark in the video, they reveal their choices. It turns out that both of them choose to SPLIT after all! Thus both end up with a 50 percent share of the money.
Here’s why Nick’s strategy was so brilliant. Nick was credibly explaining that he was going to steal. This changed the game into the following payoffs:

![new game matrix](/2016/02/01/prisoners-dilemma/3.png)

On the one hand, the other contestant could steal and destroy the prize money. On the other, he could split and hope that Nick kept to his word. In other words, Nick has transformed the game so that the weakly dominant best response is to split!

The other contestant is happy at the outcome, but he shouts “Why did you put me through that?” as he really had to struggle over his decision, only to learn Nick would cooperate after all.
I think Nick has shown a brilliant way to beat the Prisoner’s Dilemma in a one-shot game. His statement that he would steal is a credible threat, and it changed the game so the other contestant found split to be the appealing option.

This might not work in a repeated game, as Nick would have burned his reputation by not keeping to his word.

But in a one-shot game, it was a smart way to assure that both go away with a split of the prize.
If you liked this post, check out my book [The Joy of Game Theory: An Introduction To Strategic Thinking](http://amzn.to/1uQvA20).

简而言之，对于这类参与者可协商的囚徒困境中，承诺选择steal使得个人利益最大化。此时若对方抱有分享奖金的希望，会选择split。