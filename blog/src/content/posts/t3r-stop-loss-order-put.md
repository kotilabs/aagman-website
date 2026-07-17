---
title: "The stop-loss order: where to put it, taught through a losing trade"
description: "Learn where to place a stop-loss order on Indian stocks. A worked losing trade on Reliance shows why placement matters more than having the stop."
slug: "t3r-stop-loss-order-put"
pubDate: 2026-07-15
author: "Ajit Kumar"
authorSlug: "ajit-kumar"
authorTitle: "Co-founder, Āagman"
category: "Order Types"
tags: ["order types", "stop loss", "atr", "reliance", "risk management"]
featured: false
---

# Where to Place a Stop-Loss Order: Taught Through a Losing Trade

A stop-loss order is a conditional instruction that tells your broker: if the price reaches my trigger, attempt to close my position. It protects your capital only when the level is placed where the market actually respects it. Otherwise it becomes an automated way to lose money.

Imagine you are long 250 shares of Reliance at ₹2,900 after a breakout above a resistance level. You place a stop-loss order just below the most recent swing low, at ₹2,820 for example. The next day the price wicks down to ₹2,818, your stop triggers, and you are out. Then the stock reverses and closes the week at ₹2,950. Your idea was right. The direction was right. The loss came from where you put the stop, not from having one.

## The problem, felt

Let us walk this trade forward carefully, because the lesson lives in the details. (This trade is constructed to show the pattern; it is not a verified historical event.)

You bought 250 shares of Reliance at ₹2,900. The thesis was clean: the stock had broken above ₹2,880, volume was decent, and you expected a move toward ₹3,000 over the next two weeks. Your position was ₹7,25,000. You told yourself you were disciplined because you entered a stop-loss order. You put it at ₹2,820, just below the most recent swing low, because that was the obvious place.

Let us say the 14-day average true range on Reliance at entry was around ₹65. Your stop distance was ₹80 per share. That sounds reasonable until you look at volatility. Your stop was roughly 1.23 times the daily ATR. Normal intraday noise on Reliance can easily be one ATR. A flush down to ₹2,820 was not a reversal. It was just the stock breathing.

The level was also wrong in a deeper sense. The ₹2,820 swing low was a minor pullback, not a validated support zone. The real demand zone, the place where buyers had actually stepped in before, sat lower, at ₹2,780 for example. By placing your stop at the minor low, you put it exactly where a short-term shakeout would hunt it.

Then there was execution. You used a Stop-Loss Limit (SL-L) order, the standard stop type on most Indian broker panels including Zerodha Kite, Upstox Pro, and Angel One. You set the trigger at ₹2,820 and the limit at ₹2,815. When the price touched ₹2,818, the order became active. But the market was moving fast, and the next available buyers were at ₹2,810. Your limit of ₹2,815 meant you did not get filled until price came back, or you got filled worse than you planned. Let us say your actual exit was ₹2,810.

Now the bill. Your loss per share was ₹90. On 250 shares that is ₹22,500. Add brokerage, STT, exchange charges, SEBI turnover fees, stamp duty, and GST, and assume the total cost of the round trip was another ₹800. Your net loss was ₹23,300, about 3.2% of your ₹7,25,000 position. The worst part is not the money. It is that you lost it on a trade that eventually worked without you.

## What is a stop-loss order and how does it work on Indian brokers?

Now that you have felt the problem, we can look at the tool itself.

A stop-loss order is a conditional instruction. It says: if the price reaches my trigger, attempt to close my position. On Indian broker panels, this is usually entered as a Stop-Loss Limit (SL-L) order. You set two prices: the trigger and the limit. The trigger activates the order. The limit is the worst price you will accept.

Some brokers also offer a Stop-Loss Market (SL-M) variant, where the order triggers and becomes a market order at the next available price. SL-M is generally restricted in the cash segment and availability in F&O varies by broker. Check your broker's current order types rather than assuming.

| Order type | What happens at trigger | Price control | Best for |
|---|---|---|---|
| Stop-Loss Limit (SL-L) | Becomes a limit order at your limit price | You control the worst fill | Normal conditions, liquid stocks |
| Stop-Loss Market (SL-M) | Becomes a market order at the next available price | Guaranteed exit, but not at a price | Fast moves, when you must be out |

A stop-loss is not a guarantee. It is an automated decision that your trade thesis is no longer valid. Once that decision is made, the order still has to find a counterparty in the market.

The NSE market structure matters. Cash-segment stocks trade in exchange-set tick sizes. F&O contracts trade in fixed lot sizes that the NSE revises from time to time. Check the latest Reliance lot size and tick size against the NSE list. The lot size determines the rupee impact of every point the stop moves. A stop one rupee too tight can mean a meaningful difference in total loss.

Circuit filters and gaps can stop your stop from working. If a stock hits its lower price band, trading may halt. If Reliance closes at ₹2,820 and opens the next morning at ₹2,750, your SL-L with a limit at ₹2,815 will sit unfilled until a buyer appears at or above your limit.

Costs also change the math. Brokerage, STT, exchange charges, SEBI turnover fees, stamp duty, and GST are real on every exit. A stop that is right by only a few rupees can be wrong after costs. Your stop has to be wrong enough to justify getting out.

Stop distance also has to talk to position sizing. A wider stop must mean a smaller position. Otherwise you are simply trading a bigger loss with a prettier label.

## How does stop placement change a losing trade?

Let us put the same trade back through four different stop placements, so you can see the trade-offs. The entry is the same in every case: long 250 shares of Reliance at ₹2,900, holding for a swing. Let us say the 14-day ATR at entry is ₹65.

| Stop method | Trigger | Distance | ATR multiple | Stop hit on the wick? | If stopped: gross loss | If held to ₹2,950: gross gain |
|---|---|---|---|---|---|---|
| Variant A: swing low | ₹2,820 | ₹80 | 1.23× | Yes | ₹22,500 | – |
| Variant B: structure support | ₹2,780 | ₹120 | 1.85× | No | – | ₹12,500 |
| Variant C: 1.5× ATR | ₹2,800 | ₹100 | 1.54× | No | – | ₹12,500 |
| Variant D: 2× ATR | ₹2,770 | ₹130 | 2.0× | No | – | ₹12,500 |

These numbers are illustrative. They show the pattern, not a verified backtest. Variant A has the smallest loss per stop, but it gets hit by noise. Variants B, C, and D give the trade room to move. With any of them, the wick to ₹2,818 does not hit the stop, and the position rides to ₹2,950 for a gross gain of ₹50 per share, or ₹12,500 before costs.

The support-based stop at ₹2,780 is below a real validated support zone. The ATR-based stops adapt to how much the stock actually moves. Neither is perfect. A wider stop means when you are genuinely wrong, you lose more. A tighter stop means you get stopped out more often. There is no universal right answer. There is only the right answer for this instrument, this timeframe, and this position size.

## What can go wrong with a stop-loss order?

The retail stop-loss panel has a hard ceiling. It is a discipline tool, not a complete execution solution.

Gap risk is the biggest one. An SL-L order cannot fill at a price better than your limit. If the market opens through it, you are exposed until price comes back. Circuit filters can lock you in entirely.

Trailing stops on retail panels are usually coarse. They trail by a fixed percentage or a fixed rupee amount, not by structure or volatility. A 2% trailing stop on a volatile stock will get hit on normal noise. A 5% trailing stop on a calm stock will give back too much profit.

Options add another layer. An option premium can gap because of its own bid-ask spread, even when the underlying has not moved much. Many traders place the stop on the underlying price rather than the premium, because an OTM option's wide spread can stop you out on noise.

Liquidity matters too. In mid- and small-cap names, the last traded price is not the price you will exit at. The bid-ask spread and impact cost can push your fill well below the trigger. That is why the most liquid Nifty stocks are the best place to learn stop placement. Reliance, HDFC Bank, Infosys, and TCS have tight enough markets that your stop generally fills near the trigger.

## Run this on Aagman

The fastest way to find the right stop level for your instrument is to backtest the placement, then move up to desk-tier execution when the basic stop panel starts costing you.

**1. Backtest the stop placement.** Paste this into Aagman:

```text
Backtest a long swing strategy on RELIANCE from Jan 2023 to Dec 2024. Entry: price closes above the 20-day high. Compare four stop variants: A) stop below the latest swing low, B) stop below the nearest major support, C) stop at 1.5x daily ATR, D) stop at 2x daily ATR. Report win rate, average loss, max drawdown, and number of whipsaws. Include STT and brokerage.
```

The report shows which placement gets stopped out by noise and which lets the trade breathe.

**2. Paper trade the stop rule.** Paper trading catches what a backtest cannot: your broker's latency, the real spread at the stop trigger, and whether you can hold the rule without moving it.

**3. Move up to desk-tier execution when size grows.** For larger size or gap protection, Aagman can run true trailing stops, market-if-touched, and VWAP/TWAP exits on your existing broker account. Start with:

```text
Paper trade a 1.5x ATR trailing stop on RELIANCE. Exit the long position if the price closes below the trailing level. Compare it against a fixed swing-low stop over the last 30 sessions.
```

Once the fill logic matches your plan, deploy live with the same order type.

Trading and investing in securities markets involves risk. Past performance does not guarantee future results.

## FAQ

**What is the difference between a stop-loss limit and a stop-loss market order?**
A stop-loss limit order becomes a limit order at your specified price once the trigger is hit. A stop-loss market order becomes a market order and fills at the next available price. SL-L gives you price control but may not fill in a fast move. SL-M gives you certainty of exit but not price.

**How do I set a stop-loss on Zerodha, Upstox, or Angel One?**
Open the order form, select SL or SL-M, enter the trigger and limit prices, set the quantity, and submit. Cover orders have a built-in stop. Check your broker's current labels, as they vary slightly.

**Should I use a fixed percentage stop or an ATR-based stop?**
A fixed percentage stop is simple but ignores how much the stock actually moves. An ATR-based stop adjusts for volatility. For swing trades, ATR is usually better. For very short-term intraday trades, some traders use a fixed buffer above immediate structure.

**What happens if the stock gaps through my stop?**
If the market opens below your SL-L limit, your order will not fill until price comes back. If you use SL-M, it fills at the available market price, which may be worse than your trigger. A stop-loss does not guarantee your exit price.

**Can a stop-loss guarantee I won't lose more than planned?**
No. Gaps, circuit filters, and slippage can all produce losses larger than the planned stop distance. That is why position sizing matters. Size every trade so that even a worst-case fill leaves your account intact.

**Where should I place my stop for a swing trade versus an intraday trade?**
For swing trades, use daily ATR, typically 1.5× to 2×, or place the stop below a validated support zone. For intraday trades, use a 5-minute or 15-minute ATR, or a fixed buffer above the immediate structure. The timeframe determines what counts as noise.

**How do I size a position once I know my stop distance?**
Divide your planned account risk by the stop distance. If you risk 1% of a ₹10 lakh account, that is ₹10,000. If your stop is ₹130 away, you can buy about 77 shares in cash. In F&O, a wider stop may mean fewer lots than you hoped.

## Related reads

- [Market vs limit orders: the entry decision](/blog/t3r-vs-limit-orders-entry/) — how the order type you choose changes your entry fill.
- [What changes when you go from paper trading to live capital](/blog/t4-changes-go-paper-live/) — why stop rules feel different once real money is at risk.
- [Why most options buyers lose money](/blog/why-options-buyers-lose-money/) — how poor exits and slippage compound the buyer's edge problem.
- [Covered call strategy for Indian stocks](/blog/covered-call-strategy-indian-stocks/) — a defined-risk live strategy to practice stops with a slower pace.