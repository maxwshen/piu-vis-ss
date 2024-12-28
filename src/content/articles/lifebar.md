---
title: Lifebar mechanics in Pump it Up
description: Improve your stage pass play with strategy & tips
date: 2024-12-20
---
# Lifebar mechanics in Pump it Up

First, why should one try to understand the lifebar in Pump?

<!-- Well, a common goal in Pump is "stage passing" new stepcharts, which means completing them without your lifebar getting to zero. Stage pass count is the dominant factor in earning titles like Intermediate Lv. 1-10, Advanced, Lv. 1-10, and Expert Lv. 1-10, which are common ways to track player progress.  -->

When you go for stage passes, you are playing a game called "don't let the lifebar reach zero". But what are the rules of this game -- what *exactly* do you need to do to win? Well, the rules of stage passing are governed by lifebar mechanics, which are surprisingly unintuitive.
<!-- If you were expected to play an unfamiliar game, you would probably want to learn the rules of the game first. Yet, a surprising number of Pump players are highly interested in the *game* of stage passing, yet don't really understand the *rules* of stage passing.  -->
<!-- The rules of stage passing are governed by lifebar mechanics, which are surprisingly unintuitive. -->

<div class="tip">
A master of lifebar mechanics can optimize a plan on how to execute any stepchart to maximize the chances of stage passing, while making the execution plan as physically easy as possible by skipping certain notes or tricky parts.
</div>

An understanding of lifebar mechanics will push your stage pass limit, without any improvement in physical skills. You can learn to craft stage passing strategies that intentionally miss certain notes. This can also unlock new approaches to playing pump besides the typical strategy of trying one's hardest on every attempt.

<div class="note">
Aiming for stage passes is only one way to enjoy Pump. Playing for accuracy and score is also hugely rewarding and a different test of one's abilities. Don't get tunnel vision!
</div>


---

The lifebar starts at 50%, or halfway filled on the screen. If you get perfect or great judgments, your life increases. Bad and miss judgments decrease your life.

## Overflow and maximum life

At 100% life, your life bar on screen is full. However, your life can increase above 100%, which is known as *overflow*. Overflow is not shown in your life bar on-screen. 

Maximum life scales with stepchart level using this formula. It's above 200% at level 19+, and hits 300% at level 26.

    maxLifePercent = 100 + 0.3*(chartLevel)^2

| Chart level | 5    | 10   | 15   | 16   | 17   | 18   | 19   | 20   |
|-------------|------|------|------|------|------|------|------|------|
| Max life    | 107% | 130% | 167% | 177% | 186% | 197% | 208% | 220% |

| 21   | 22   | 23   | 24   | 25   | 26   | 27   | 28   |
|------|------|------|------|------|------|------|------|
|232% | 245% | 258% | 272% | 287% | 302% | 318% | 335% |

<div class="tip">
Most stepcharts begin with easier sections, and have their hardest crux sections towards the end. To survive the crux, you want to enter the crux with lots of overflow by properly executing earlier sections.
</div>

## Life gain & loss: note judgments

Life gain and loss depends on a *healing factor*, which starts at 100 at the beginning of the stepchart, and can take values between 0 and 800.

| Judgment | Life update                            | Healing factor update |
|----------|----------------------------------------|-----------------------|
| Perfect  | newLife = life + 1.2*healFactor/1000   | +20                   |
| Great    | newLife = life + healFactor/1000       | +16                   |
| Good     | No change                              | No change             |
| Bad      | newLife = life - 5%                    | -350                  |
| Miss     | newLife = life - 2% - min(100%, life)/4 | -700                 |

### Misses

Miss penalty scales with life, unlike bads:

| Life         | 5%          | 10%    | 12%    | 25%    | 50%     | 75%     | 100%    | 150%    | 200%    |
|--------------|-------------|--------|--------|--------|---------|---------|---------|---------|---------|
| Bad penalty  | -5% (death) | -5%    | -5%    | -5%    | -5%     | -5%     | -5%     | -5%     | -5%     |
| Miss penalty | -3.25%      | -4.5% | -5% | -8.25% | -14.5% | -20.75% | -27% | -27% | -27% |

<div class="note">
Misses subtract up to 27% life if you have high life, while bads always subtract 5% life.
At 12% life and below, however, misses start to subtract less life than bads.
</div>

<div class="warning">
Don't give up hope! It only takes 2 misses to go from 100% life to ~50% life, and it can be demoralizing to see your life drop so quickly. Don't walk off and don't worry. You might think that because 2 misses took down 50% life, you're only 2 more misses away from death, but you're actually 7 misses away from death. The miss penalty is non-linear, and is forgiving at low life.
</div>

### On the importance of the healing factor

The healing factor is very important for life gain.
It increases on perfects/greats (+20 and +16) and decreases a huge amount on bads and misses (-350 and -700).
From 0, you'll reach the max of 800 healing factor with 40 perfects. 


| Judgment | Life update                           | Life update, when healFactor = 0 | Life update, when healFactor = 100 | Life update, when healFactor = 800 |
|----------|---------------------------------------|----------------------------------|------------------------------------|------------------------------------|
| Perfect  | newLife = life + 1.2*healFactor/100     | 0                                | +0.096%                            | +0.96%                             |
| Great    | newLife = life + healFactor/100       | 0                                | +0.08%                             | +0.8%                              |
| Good     | No change                                     | 0                                | 0                                  | 0                                  |
| Bad      | newLife = life - 5%                    | -5%                              | -5%                                | -5%                                |
| Miss     | newLife = life - 2% - min(100, life)/4 | -2% to -27%                             | -2% - 27%                                | -2% to -27%                                |

At the maximum healing factor of 800, you gain ~1% life per perfect, and 0.8% life per great.

<div class="warning">
If your healing factor is zero, a perfect or great gives you ZERO life gain!

At healing factor of 100, your life gain is extremely low, at 0.1% life for a perfect.
</div>

Let's say you're pushing on a death run. Immediately after a couple bads or misses, your healing factor is destroyed to near zero. This means your next ~5-10 perfects/greats give very little life gain. 

Recall that hitting a perfect or great does *two* things:
- Increases your life (basically zero, right after a miss)
- Increases your healing factor (always by +20 or +16, up to 800)

In order to obtain meaningful life gain again, you need to: 
1. First, hit perfects/greats primarily to build up your healing factor, because the life gain they give is near zero
2. Then, once your healing factor is high, continue to hit perfects/greats to "cash in" on your high healing factor, getting 0.96% life per perfect once at max healing factor.

Let's say you start zero healing factor. It turns out hitting 10 perfects only gives you a total of 1.08% life gain. You need to hit 21 perfects to gain 5% life, and 30 perfects to get 10% life. Beyond 30 perfects, you're close enough to max heal factor that perfects will be worth 0.96% life each again. 


| N perfects, starting at 0 healFactor | 5     | 10    | 15    | 21    | 30     | 36     |
|--------------------------------------|-------|-------|-------|-------|-------|-------|
| Total life gain  | 0.24% | 1.08% | 2.52% | 5.04% | 10.44% | 15.12% |

<div class="note">
Unfortunately, this means that pad quality is extremely important. If your pad gives you random bads or misses every ~20 or 30 notes, you effectively can't ever gain any meaningful amount of life.
</div>



---

## Takeaways & Strategy Tips

We'll conclude with some tips on how you can combine what you've learned above with [piucenter's interactive lifebar calculator](/articles/lifebarcalculator) to design your own stage-passing strategies.

- **Categorize stepchart sections into two types: 1) maximize life gain (you can full-combo it with perfects/greats), 2) survive (whichever sections are hardest for you).** Many stepcharts begin with easier sections (where you should maximize life gain), and end in a "death" run (where you hope to survive). As higher level charts expand the variety in technical challenges, "easy" and "hard" sections can become more subjective and vary by person.

- **Aim to finish life-gain sections with as much life overflow as possible.**
Until you reach max overflow, you want to full-combo everything with perfect/greats to maximize your life gain. 

<div class='tip'>
During life-gain phases, it is worth spending energy to avoid bads and misses at all costs. If you're beyond 100% life, a single miss costs 27% life, and further reduce your next 40 perfects to heal only 20% life instead of 40% life. Overall, 1 miss has up to -47% impact on your lifebar, compared to if you didn't miss!
</div>

- **You might not need to start accruing life at the beginning of the stepchart.**

It can take a lot of combo to increase your starting life at 50% to max overflow. Beyond level 10, you'll need at least 100 combo, and beyond level 20, at least 200 combo. However, while you often should start farming life as early as possible, some stepcharts give you juicy holds with 10s-100s of free perfects directly before a difficult crux section. Other stepcharts might simply have many notes, perhaps in easier warm-up runs, which if full combo'd would give much more than max life overflow. In these cases, intentional misses can make sense earlier on in the stepchart, as long as you enter your survival sections with as much life as possible.

- **In survival sections, plan out intentional misses using the piucenter lifebar calculator.**
If you enter the survival section with 100% health, then you'll die in 9 misses, so you can budget perhaps 6 or 7 intentional misses for safety. If you have high overflow, like 230% (level 21+), then you're about 14 misses away from death, so you can probably afford 11-12 intentional misses.

In doubles, one sensible strategy is use intentional misses on the outer 4 arrows, if there are a random 1 or 2 of them in the middle of a run. This can let you stay closer to the center, conserving physical energy.

<div class='tip'>
While intentional misses are the easiest to reason about, and easiest to execute during play, if you can spare the effort, it is still worthwhile to try to hit them, as a bad is much better than a miss. For example, from a budget of 100% life, you can only afford 9 misses, but you can afford 20 bads.
</div>

- **If the survival section is not too demanding, getting goods are fine.**
Immediately after a couple bads or misses, your life gain potential is wiped out, and getting 5 or 10 perfects/greats does not give you any meaningful life gain. This means they're pretty similar to getting goods, as long as you're OK with not gaining life for later. This can open the door to trying cheating or pattern manipulation maneuvers with lower accuracy, as long as you've budgeted out your remaining life enough.

- **In demanding survival sections, plan out intentional misses that let you focus on patterns that you can perfect/great.**
If you're really pushing your stage passing limit up to your physical limits, you'll start to encounter longer, more technical death runs, where gaining life during survival sections starts to become critical. In this situation, you'll want to plan your intentional misses to position yourself so you can focus on long patterns that you can full combo with perfects/greats, because it will take 20-30 perfects/greats to start to accrue meaningful life.
Gaining just 5% or 10% more life affords you one or two more bads or misses.

---

Credits and further reading:
- https://github.com/Team-Infinitesimal/Infinitesimal/blob/lts/Modules/PIU/Gameplay.Life.lua
- https://www.reddit.com/r/PumpItUp/comments/1d6o90h/introduction_to_the_pump_health_bar/
- https://www.reddit.com/r/PumpItUp/comments/zft984/lifebar_mechanics/
- https://piuscores.arroweclip.se/LifeCalculator