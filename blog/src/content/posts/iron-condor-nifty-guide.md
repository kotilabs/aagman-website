---
title: "Iron Condor on NIFTY: A Practical Guide for Indian Option Sellers"
description: "A step-by-step guide to building and managing an Iron Condor on NIFTY weekly options. For Indian traders who want income without picking direction."
slug: "iron-condor-nifty-guide"
pubDate: 2026-06-23
author: "Ajit Kumar"
authorSlug: "ajit-kumar"
authorTitle: "Co-founder, Āagman"
category: "Options Strategy"
tags: ["options", "iron condor", "nifty", "income strategies", "risk management"]
featured: true
---

An Iron Condor is one of the cleanest ways to collect premium when you believe the market will stay range-bound. Instead of guessing whether NIFTY will go up or down, you profit from it *not* moving much. For Indian traders dealing with weekly expiry noise, this can be a powerful income strategy — if you know how to size and adjust it.

This guide walks through how to build and manage an Iron Condor on NIFTY weekly options, specifically for the Indian market.

## What is an Iron Condor?

An Iron Condor is a non-directional, defined-risk options strategy. You sell an out-of-the-money (OTM) call spread and an OTM put spread on the same underlying, with the same expiry.

Your profit zone lies between the two sold strikes. You keep the net premium if NIFTY closes inside that range at expiry.

| Leg | Action | Strike selection |
|-----|--------|------------------|
| Put spread | Sell OTM put + buy further OTM put | Below spot |
| Call spread | Sell OTM call + buy further OTM call | Above spot |

Because you are selling both sides, you collect premium twice. Because you buy wings further out, your risk is capped.

## Why NIFTY weekly options work well

NIFTY weekly options expiry happens every Thursday. Three features make them attractive for Iron Condors:

1. **High liquidity** in near-the-money strikes, especially in the current weekly expiry.
2. **Rapid theta decay** in the final three days, which accelerates premium erosion.
3. **Range-bound behaviour** around big events, once the initial move is digested.

The challenge is the same: a sudden gap or strong trend can push NIFTY outside your profit zone. That is why adjustment rules matter more than entry rules.

## A sample setup

Assume NIFTY spot is trading at 23,500. A typical one-week Iron Condor might look like this:

| Leg | Strike | Premium (approx) |
|-----|--------|------------------|
| Sell put | 23,300 PE | +₹45 |
| Buy put | 23,200 PE | −₹22 |
| Sell call | 23,700 CE | +₹48 |
| Buy call | 23,800 CE | −₹24 |

**Net credit received:** ₹47 per unit (≈ ₹3,525 per lot, since NIFTY lot size is 75).

**Maximum profit:** ₹3,525 per lot if NIFTY expires between 23,300 and 23,700.

**Maximum loss:** ₹4,725 per lot if NIFTY expires beyond 23,200 or 23,800.

**Breakevens:** 23,253 and 23,747.

This gives you a roughly ±200 point cushion on a 23,500 index. That is about 0.85% on either side for a weekly expiry.

## When to enter

The best entries usually come after a sharp move has already happened and volatility is elevated. Look for:

- India VIX above 15–16.
- A clear support and resistance zone on the 15-minute or hourly chart.
- At least 3–4 days left to expiry so theta decay has time to work.

Avoid entering immediately before a major event like the Union Budget, RBI policy, or US Fed announcement unless you are intentionally trading the volatility crush.

## How to adjust when NIFTY moves

No Iron Condor survives a strong trending move without adjustment. Here are three common responses:

### 1. Roll the threatened side

If NIFTY drifts toward your sold call strike, close the call spread and open a new one further away. This gives you more room but usually costs extra premium.

### 2. Convert to a butterfly

If NIFTY breaks one side decisively, close the profitable put spread and convert the threatened side into a butterfly. This reduces risk and can sometimes lock in a small profit.

### 3. Add a counter-position

If NIFTY moves down toward your put spread, you can sell a naked put below your wing or add a bullish vertical spread. Only do this if your risk rules allow increasing exposure.

## Risk rules we follow at Āagman

Before any Iron Condor trade, we check four things:

1. **Position size:** Never risk more than 1–2% of capital on a single non-directional setup.
2. **Max loss:** Know the exact loss if NIFTY gaps through both wings.
3. **Adjustment trigger:** Decide in advance at what spot level you will act.
4. **Exit plan:** Close at 25–50% of max profit, or roll/defend if the test level hits.

These rules matter more than the exact strikes you pick.

## Common mistakes Indian traders make

- **Over-sizing** because the strategy looks "safe." One bad week can wipe out months of gains.
- **Holding till expiry** instead of booking partial profits mid-week.
- **Ignoring event risk** around expiry days that coincide with major announcements.
- **Trading illiquid strikes** where bid-ask spreads eat into the credit.

## Bottom line

The Iron Condor is not a magic income machine. It is a structured bet that NIFTY will stay inside a range for a specific period. Used with strict sizing and adjustment rules, it can be a reliable way to generate theta-based income in the Indian market.

If you want to test this without real capital, you can backtest it inside Āagman: brief your AI trading team, define the entry and adjustment rules, and paper-trade it across past NIFTY weekly expiries before going live.

---

*Disclaimer: This is educational content and not investment advice. Options carry risk, including the risk of losing the entire premium paid or collected. Please read the SEBI-prescribed risk disclosure before trading derivatives.*
