# 🐛 Minor Bugs & Polish Items

*Stuff that's annoying but not workflow-stopping. We'll squash these before deployment.*

---

## 🎨 Theme Issues

### Luka's Neon Penguin Theme
- **Phantom hover overlay on sidebar** - MOSTLY FIXED ✅
  - Settings button now clickable! 🎉
  - Still has mild phantom presence on hover
  - Not blocking functionality anymore
  - **Status:** Acceptable for now, polish later

### Glitter Theme (Keshy's Sparkle Universe)
- **Stubborn calendar "Month" button color** 📅💜
  - Button text is readable but wrong shade of purple
  - Should be `#521945` (deep sparkly purple) for theme harmony
  - Currently showing jarring bright purple despite CSS attempts
  - **Impact level:** Low (cosmetic only, text is readable)
  - **Workaround:** Use different theme or ignore the color clash
  - **Status:** CSS is being RUDE and refusing to cooperate 😤
  - **Note:** Sidebar gradients work perfectly, just this one button has attitude

### Test Data Generation
- **G-Spot 2.0 Advanced Generator incomplete** 🧠💜
  - Nova's brilliant correlation system only has sleep tracker implemented
  - All other trackers are TODO placeholders
  - **Impact level:** Medium (affects test data quality for Flask development)
  - **Current workaround:** Rewired back to reliable bland-data-generator
  - **Status:** Temporarily disabled, needs modular completion
  - **Enhancement goal:** Combine Nova's correlations with full tracker coverage
  - **File:** `g-spot-2.0-advanced-bland-generator.ts`
  - **Note:** Don't put everything in one file! Keep it modular! 🔧

- **BRILLIANT ARCHITECTURE IDEA** 💡🌟
  - **Concept:** Use modular post-processing approach instead of rewriting everything
  - **Flow:** `bland-data-generator.ts` → `Nova's Jitter System` → `Realistic correlated data`
  - **Benefits:**
    - Modular design (each system does one thing well)
    - No need to rewrite all tracker logic
    - Can apply correlations to ANY data source
    - Maintainable and scalable
  - **Implementation:** Create correlation post-processor that takes generated data and adds realistic patterns/correlations
  - **Status:** Future enhancement - way less work than rewriting everything!
  - **Note:** This is actually BETTER architecture than cramming everything into one generator! 🎯

---

## 📝 Template for New Issues

### [Component/Feature Name]
- **Issue description**
- **Impact level:** Low/Medium (nothing High goes here)
- **Workaround:** If any
- **Status:** New/In Progress/Acceptable/Fixed

---

## 🚀 Pre-Deployment Checklist

When we're ready to deploy, come back and squash these minor annoyances:

- [ ] Polish the neon theme phantom hover
- [ ] [Add more items as we find them]

---

*"Perfect is the enemy of good, but we still want to ship something beautiful."* ✨
