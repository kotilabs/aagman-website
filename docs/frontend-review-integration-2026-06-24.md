# Aagman v2 Frontend Review

**Branch reviewed:** `integration-2026-06-24`  
**Preview URL:** https://frontend-eta-mocha-42.vercel.app  
**Review date:** 2026-06-24  
**Focus:** Light mode / UI eye testing

---

## Desktop Issues

### 1. Modal: "Get ready to trade live"
![Screenshot 1](https://litter.catbox.moe/w7lnb3.png)
- Chunky blue shadow on the left edge of the white modal looks rough and out of place, like a leftover dark-mode shadow.

### 2. Events page: expiry labels
![Screenshot 2](https://litter.catbox.moe/6qzg9y.png)
- The labels next to expiry are a light green/mint shade that blends into the background, making the text inside them hard to read.

### 3. "Intelligently." heading
![Screenshot 3](https://litter.catbox.moe/u03rhl.png)
- The heading/container is clipped at the top of the viewport and the page cannot be scrolled up any further to bring it fully into view.

### 4. Payoff Builder button
![Screenshot 4](https://litter.catbox.moe/rhhnze.png)
- The button uses a bright mint green, but this same green is not applied consistently across other primary CTAs.

### 5. New Backtest button (unselected state)
![Screenshot 5](https://litter.catbox.moe/w4lr90.png)
- The unselected state is low contrast and fades into the background, so it doesn't look clearly actionable.

### 6. Broker account form
![Screenshot 6](https://litter.catbox.moe/hgcrci.png)
- Input fields are nearly black with dark gray text/placeholder, which is jarring in light mode and makes typed text barely visible.
- The "Next" button is a much paler green than the bright Payoff Builder green, making it look faded or disabled.

### 7. Settings: relay agent / broker banner
![Screenshot 7](https://litter.catbox.moe/lq9n60.png)
- The entire callout card is dark/black on an otherwise light-mode page, looking like a leftover dark-mode component.
- The "Add Broker Account" button is a different steel-blue shade that doesn't match the app's main accent.

### 8. Aagman Pulse header (dark variant)
![Screenshot 8](https://litter.catbox.moe/urmgqs.png)
- Header is rendered in dark mode (black background, white title, mint green time/logo) while the rest of the app is light.
- The Aagman logo is jammed against the left edge and looks vertically misaligned, with no safe-zone breathing room.

### 9. Aagman Pulse header (light variant)
![Screenshot 9](https://litter.catbox.moe/bqis9n.png)
- The same header is rendered in a completely different light-mode theme, creating inconsistency with the dark variant.
- The bottom separator/boundary line is too subtle and almost invisible against the light background.
- Logo alignment appears better here than in the dark variant.

---

## Mobile Issues

### 1. Options section looks cluttered
- The options screen feels visually overloaded.
- Consider moving expiry-date selectors into a dropdown to reduce on-screen clutter and make the layout cleaner.

### 2. OI heatmap, straddle, and IV history charts are cramped
- The OI heatmap, straddle chart, and IV history chart appear squeezed together.
- X and Y axes overlap or sit on top of each other, making the data hard to read.
- These charts need more breathing room or a revised layout for mobile viewports.

### 3. Pulse tag strip cannot scroll horizontally
- The viewport appears horizontally locked on mobile.
- Beyond the four fixed tags (Latest, Companies, Markets, Economy) in the Pulse section, users cannot swipe/scroll to reach additional tags.

### 4. Backtest result card is not mobile-optimized
- The backtest result card extends beyond the mobile viewport.
- Because horizontal scrolling is locked, users cannot swipe to see the full card/content.

### 5. Payoff builder and vol surface charts are cramped
- The payoff builder in the options section suffers from the same cramped-chart problem.
- X and Y axes collapse and squeeze together, making the payoff shape hard to read.
- The vol surface chart has the same issue — axes overlap and the visualization feels squeezed.

---

## Summary

Multiple screens and components in the `integration-2026-06-24` build still carry dark-mode styling or inconsistent accent colors inside an otherwise light-mode interface. Key patterns:

1. **Dark-mode leftovers:** modal shadows, broker banner, Aagman Pulse dark header, broker form input fields.
2. **Inconsistent accent colors:** bright mint green on Payoff Builder vs pale mint on "Next" vs steel blue on "Add Broker Account".
3. **Low-contrast elements:** expiry badges, unselected "New Backtest" button, header divider lines.
4. **Layout/alignment issues:** clipped "Intelligently." heading, Aagman logo alignment in dark header.
5. **Mobile layout issues:** options section is overloaded; payoff builder, vol surface, OI heatmap, straddle, and IV history charts all have overlapping/squeezed axes; horizontal scrolling is locked, making the Pulse tag strip and backtest result card partially unreachable.


