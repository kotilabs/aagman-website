---
title: "What Changes When You Go from Paper Trading to Live Capital"
description: "Paper trading looks profitable until real costs and slippage kick in. Here's what changes when you move from paper to live capital in India."
slug: "t4-changes-go-paper-live"
pubDate: 2026-07-17
author: "Ajit Kumar"
authorSlug: "ajit-kumar"
authorTitle: "Co-founder, Āagman"
category: "Trading Psychology"
tags: ["trading psychology", "paper trading", "live trading", "slippage", "costs"]
featured: false
---

# What Changes When You Go from Paper Trading to Live Capital

Moving from paper trading to live capital changes the whole trading environment. It means replacing simulated fills with real order-book execution, zero costs with statutory charges, and notional buying power with funded margin. On paper, your fills are simulated, your costs are often zero, and your buying power is just a number. In a live account, every order is matched by the NSE or BSE order book, statutory costs are deducted from your ledger, and your margin must be funded with real cash. That difference is where the problem lives.

## What it actually looks like

Picture this. You have been running a Nifty 50 breakout strategy on a 15-minute chart for three months on paper. You enter long when price breaks the previous 15-minute high, you trail a stop, and you exit at a fixed reward-to-risk ratio. Let us say the paper account shows an 18% return, a 6% drawdown, and a 55% win rate. You feel ready. You fund the account with the same capital and run the same rules.

Within a few weeks the live account is down. The strategy did not break. The same rules are just no longer the same system.

In the paper account, your buy order fills at the last traded price or the exact trigger. In the live account, your market order on a Nifty futures breakout slips by one or two ticks. On a Bank Nifty option, let us say that same slip is 5% to 10% of the premium. Your limit order avoids the slip but misses the move entirely because the price does not come back to your level. Either way, the entry you assumed is not the entry you get.

Then the costs arrive. Paper accounts usually ignore brokerage, STT, exchange transaction charges, SEBI turnover fees, GST, and stamp duty. Let us say the combined cost drag on a Nifty futures round trip is about 0.05% of notional value, and higher on options because the premium-based STT is proportionally larger. On a strategy with a thin edge, that drag is the difference between a green month and a red month.

Maybe you also hit a peak-margin snapshot. You entered a leveraged position with just enough margin for the opening print, but an intraday move against you pushed the requirement higher at one of the exchange snapshots. SEBI mandates upfront and peak-margin collection; a shortfall attracts a penalty that is not visible in any paper simulator. On paper, you had plenty of buying power. Live, you are short.

Now the emotional cascade starts. You see a cost-driven loss and move your stop wider to avoid getting stopped out by noise. You skip a valid entry because the last two trades slipped against you. You double size after a loss to make it back. Within a month, the rule book is gone.

| Factor | Paper account | Live account |
|---|---|---|
| Fills | Simulated at last traded or trigger price | Matched against NSE/BSE order book; market orders slip, limit orders may miss |
| Brokerage | Usually zero or ignored | Charged per executed order by the broker |
| STT + GST | Usually ignored | Deducted from ledger; options STT is larger relative to premium |
| Exchange / SEBI charges | Usually ignored | Exchange transaction charges and SEBI turnover fees apply |
| Stamp duty | Usually ignored | State-wise stamp duty on buy-side or turnover |
| Margin requirement | Displayed as notional buying power | Requires funded SPAN + Exposure margin |
| Peak-margin snapshots | Not enforced | SEBI-mandated intraday snapshots; shortfalls attract penalty |
| Operational risk | Not present | Order rejection, platform outage, GSM/ASM, T+1, physical settlement |

| Scenario | Total return | Max drawdown | Win rate |
|---|---|---|---|
| Paper fills, zero costs | let us say 18% | 6% | 55% |
| Add 1-tick slippage | let us say 13% | 7% | 51% |
| Add slippage plus full costs | let us say 7% | 8% | 48% |

The numbers are illustrative, but the shape is what matters. Costs and slippage reduce the return, and they can also change the win rate and the drawdown profile, because the same stop level now gets hit by the real price and the same target now needs to overcome a higher cost basis.

If you want a gentler first live experience, a defined-income strategy like a [cash-secured put](/blog/cash-secured-put-getting-paid-to-buy-stocks/) or a [covered call](/blog/covered-call-strategy-indian-stocks/) forces you to think about lot size, strike selection, and assignment before you touch the order button.

## Why does my live account underperform my paper account?

The mechanism is a feedback loop. Paper produces a cleaner equity curve than the real market, which inflates your confidence, which makes you trade larger size, which makes every slippage and cost event feel bigger, which tempts you to break the rules.

You saw the paper account return 18% in three months. You assume the live account will do the same, or better. You fund the same amount, maybe you add a little more because the backtest looks clean. Then the first live week is flat. The second week is slightly red because of two slippage events. You are still following the rules, but you are not making money. You start to think the size is too small. You double it. Now the costs are double too, and the slippage on one bad trade is enough to erase four good trades.

This is not a discipline problem. It is a structural problem. The paper environment was never the same game as the live environment.

## What can go wrong

### Simulated fills are optimistic

Paper fills at the last traded price or the trigger price. Live fills require a counterparty. A limit order on the NSE is queued by price-time priority; if the move is fast, your order is left behind. A market order gets filled, but at the next available bid or ask, which can be worse than the price you saw on the screen.

### Costs are hidden in paper

Let us say a discount broker charges a flat ₹20 per executed order. That is only the headline. STT, exchange transaction charges, SEBI turnover fees, GST on brokerage, and stamp duty all reduce net P&L. On a high-frequency or scalping strategy, a cost that looks like pocket change per trade becomes the strategy itself.

### Margin is real cash

On paper, a Nifty futures position is just a line item. Live, you need SPAN plus Exposure margin in your account, and the broker must report peak margin during the day. If you run an intraday strategy that spikes your margin requirement at noon, you must have the cash to cover it. Mark-to-market losses also hit your ledger the same day; paper balances never shrink in real time.

### Operational risks only exist in live accounts

Broker platform outages, order rejection due to price bands, GSM or ASM restrictions on a stock, T+1 settlement timing, and mandatory physical settlement of in-the-money stock options all happen only in live accounts. Let us say you sell a short-dated ITC call that ends in the money. On paper, the P&L is a simple premium calculation. Live, you may be required to deliver the shares, and the margin required in the last week can jump far beyond what the paper account showed.

### Emotional ownership changes

Real capital activates loss aversion. A 2% drawdown on paper is a number. A 2% drawdown on live capital is a number you will explain to yourself later. That ownership changes your reaction to the same price action.

## What should I change before moving from paper to live trading?

Stop trying to be more disciplined. Change the process before you go live.

### Re-run the backtest with realistic slippage and full costs

Add one or two ticks of slippage on entry and exit. Add your broker's charges, STT, exchange charges, SEBI fees, GST, and stamp duty. If the edge disappears or the drawdown becomes unacceptable, the strategy is not ready for live capital. This is the single most important step.

### Size down, not up

Start with the minimum lot size or one unit, even if your paper capital comfortably allowed five. Let us say your paper account used five lots of Nifty futures. Your live account should start with one. You are not trying to match paper profits. You are trying to confirm that the live system behaves like the backtest.

### Build a drawdown buffer

Live capital must cover the historical max drawdown plus an extra buffer for your own mistakes. Let us say the backtest max drawdown is ₹50,000. You should be prepared to lose ₹75,000 before you pause and review. If that buffer does not exist, a normal losing streak will force you to stop at the worst possible time.

### Pre-check margin before every order

Confirm that SPAN, Exposure, and intraday peak margin can all be met with the cash you actually have. Avoid relying on the broker's "available margin" headline; it can change with volatility. If you are short options, remember that physical settlement margin can spike in expiry week.

### Run a paper shadow alongside the live account

For the first 30 to 60 days, run the exact same rules on paper while trading live. This lets you separate environment noise from behavior noise. If the live account is underperforming the paper shadow by more than the cost and slippage you modeled, the problem is you, not the market.

### Journal every deviation

Every time you move a stop, change size, skip an entry, or hold a losing trade beyond the rule, write it down. The deviation is more valuable data than the trade outcome.

If you trade multi-leg spreads such as an [iron condor on Nifty](/blog/t1-trade-iron-condor-nifty/), these checks are even more important. The margin benefit only exists if the legs are placed together, and slippage on one leg can destroy the risk profile you built on paper.

## What fixed looks like

You stop comparing live P&L to paper P&L. Instead, you compare live P&L to the cost-adjusted backtest range. If the live account is inside that band, the system is working. If it is outside, you investigate.

Your position size follows a risk rule rather than the paper account's profits. You know the combined cost and slippage estimate for every trade before you enter it. You skip trades when margin is insufficient. You keep a drawdown buffer that lets a normal losing streak play out without forcing you to abandon the strategy.

Your journal shows fewer overrides each month. The emotional reaction remains. Now you review it as data before you act on it.

## Backtest and paper trade on Aagman

Before you fund the account, run the same strategy on Aagman with real costs and slippage.

**1. Backtest it with realistic costs and slippage.** Paste this into Aagman:

```text
Backtest an intraday Nifty 50 futures breakout strategy on 15-minute candles from Jan 2024 to Dec 2024. Enter long when price breaks above the previous 15-minute high. Exit at a 1:3 risk/reward or at a 1% stop loss. Add 1 tick slippage per trade and the full cost stack: brokerage, STT, exchange charges, SEBI turnover fee, GST, and stamp duty.
```

Compare the cost-adjusted report to the paper-style report. If the net P&L still justifies the drawdown, move to paper trading.

**2. Paper trade it before risking capital.** Run the same rules on Aagman with live market data for at least 30 sessions. If the fills and the cost drag match what you modeled, you have a live-ready process.

Trading and investing in securities markets involves risk. Past performance does not guarantee future results.

## FAQ

### Is paper trading useless?

No. It is useful for learning the platform and testing logic. But it is not evidence of live profitability, because it ignores slippage, costs, and execution risk.

### How long should I paper trade before going live?

Long enough to see different market regimes. Then rerun the strategy with real costs and slippage, and build a capital buffer. Only after that should you move to live size.

### Should I start with my full capital?

No. Start with the smallest possible size and a separate drawdown buffer. Scale up only after your live behavior matches your plan.

### What costs are usually missing in paper accounts?

Brokerage, STT, exchange transaction charges, SEBI turnover fees, GST on brokerage, and stamp duty. These can turn a gross profit into a net loss on thin edges.

### Why does slippage matter more in options than in futures?

Options premiums are smaller in absolute terms, and bid-ask spreads can be wider relative to the premium. A small slip on entry or exit can erase a large part of the expected profit.

### Can I use the same broker account for paper and live?

Most platforms separate paper and live accounts. Āagman lets you run the same strategy on paper and then deploy it live on the same broker account once the setup is complete.

## Related reads

- [Covered call strategy for Indian stocks](/blog/covered-call-strategy-indian-stocks/) — a low-complexity live strategy with a predictable cost structure.
- [Cash-secured put: getting paid to buy stocks](/blog/cash-secured-put-getting-paid-to-buy-stocks/) — a defined-risk way to start trading live capital.
- [How to trade an iron condor on Nifty](/blog/t1-trade-iron-condor-nifty/) — why multi-leg spreads need slippage and margin modeling before live deployment.