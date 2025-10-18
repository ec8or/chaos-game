# Chaos Game - TODO & Future Ideas

## Current MVP Status ✅
- [x] Basic gameplay (3 rounds, 60 seconds each)
- [x] Team assignment (Red vs Blue)
- [x] Word claiming with flexible token-based matching
- [x] Ready system (2+ players required to start)
- [x] Real-time WebSocket communication
- [x] Rate limiting and anti-cheat measures
- [x] Game summary modal with top 5 players
- [x] 37 topic lists with diverse categories
- [x] Single room MVP
- [x] Coolify deployment ready

## Feature Ideas 🚀

### Room Management
- [ ] **Multiple Rooms**
  - Room overflow when main room is full
  - Private/public room creation
  - Room codes for friends to join
  - Custom room settings (round duration, word count, etc.)
  - Room browser/lobby

### Audio & Polish
- [ ] **Sound Effects**
  - Word claimed sound (different for your team vs opponent)
  - Countdown timer ticking
  - Round start/end sounds
  - Victory/defeat music
  - Ambient background music toggle
- [ ] **Visual Feedback & Game Juice**
  - Indicate correct picks not in the target 10 (e.g., "Good guess! But not in this round")
  - Animations/transitions for word claims (flying speech bubbles from player)
  - Particle effects on successful claim
  - Screen shake on word claimed
  - Word "pop" animation in chat
  - Team score counter animations (number increment effects)
  - Player name highlight pulse when they score
- [ ] **Throwables & Emotes**
  - Throwable items (tomatoes, emojis, confetti)
  - Quick emote reactions (👍 👎 😂 🔥 etc.)
  - Celebration animations on win
  - Taunt animations
  - "Nice!" callouts when teammate scores

### Topic System
- [ ] **Topic Submissions**
  - User-submitted word lists
  - Admin review/approval system
  - Community voting on submitted topics
  - Topic difficulty ratings
- [ ] **Topic Genres/Categories**
  - Group topics by genre (e.g., "Object Shows", "Sports", "Pop Culture")
  - Allow room creators to filter by genre
  - Genre-specific game modes
  - "Random within genre" option

### User Features
- [ ] **User Login & Authentication**
  - Account creation
  - Persistent player profiles
  - Remember username across sessions
  - OAuth login (Discord, Google, etc.)
- [ ] **Player Stats**
  - Total games played
  - Win/loss record
  - Average score per game
  - Words claimed leaderboard
  - Fastest claim times
  - Favorite topics
  - Team performance stats (Red vs Blue)
- [ ] **Cosmetics & Customization**
  - Player hats/avatars
  - Unlockable cosmetics through achievements
  - Custom name colors
  - Profile badges
  - Team color preferences

### Gameplay Enhancements
- [ ] **Alternative Phrases & Fuzzy Matching**
  - Accept alternative names for words (e.g., "Aubergine" = "Eggplant")
  - Fuzzy matching for typos and misspellings
  - Common abbreviations (e.g., "KFC" = "Kentucky Fried Chicken")
  - Plural/singular variations
  - Case-insensitive matching improvements
- [ ] **Game Modes**
  - Ranked mode with ELO ratings
  - Tournament brackets
  - Speed round (30 seconds)
  - Marathon mode (5+ rounds)
  - Solo practice mode
- [ ] **Power-ups/Modifiers**
  - Double points round
  - Steal opponent's word
  - Freeze opponent for 3 seconds
  - Hint system (reveal first letter)

## Technical Improvements 🔧

### Architecture
- [ ] **Scaling Considerations**
  - Redis for shared state across multiple server instances
  - Load balancing
  - Session persistence
  - WebSocket connection pooling
- [ ] **Database Integration**
  - Move from in-memory to persistent storage
  - User accounts table
  - Game history table
  - Stats aggregation
  - Topic submissions table

### Code Quality
- [ ] **Testing**
  - Unit tests for scoring logic
  - Integration tests for game flow
  - E2E tests for full gameplay
  - Load testing for concurrent players
- [ ] **Monitoring**
  - Error tracking (Sentry)
  - Performance monitoring
  - Player analytics
  - Server health metrics

### Known Issues & Improvements
- [ ] Better disconnection handling during gameplay
- [ ] Reconnection for players who lose connection
- [ ] Mobile responsive design improvements
- [ ] Accessibility features (keyboard navigation, screen readers)
- [ ] Better error messages for users
- [ ] Rate limit per-player message history cleanup (memory leak potential)
- [ ] Word matching could support fuzzy matching for typos
- [ ] Chat history persistence (currently lost on refresh)

## Deployment Notes 📦

### Current Setup
- **Server**: Bun runtime, WebSocket API, single room in-memory
- **Client**: React + Vite, Tailwind CSS, nginx serving static files
- **Protocol**: Shared TypeScript types package
- **Infrastructure**: Coolify with separate server/client deployments

### Deployment Improvements
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Automated tests on PR
- [ ] Staging environment
- [ ] Blue-green deployments
- [ ] Database backups
- [ ] CDN for static assets
- [ ] WebSocket connection health checks

## Content Ideas 💡

### More Topic Lists
- [ ] Video game characters
- [ ] Country capitals (worldwide)
- [ ] Programming languages
- [ ] Emojis (use emoji descriptions)
- [ ] Memes and internet culture
- [ ] Historical figures
- [ ] Dinosaurs
- [ ] Elements of the periodic table
- [ ] Constellations
- [ ] Nobel Prize winners

### Seasonal Events
- [ ] Holiday-themed topics (Christmas movies, Halloween costumes, etc.)
- [ ] Special events (Olympics, World Cup tie-ins)
- [ ] Limited-time cosmetics

## Community Features 🌐
- [ ] Discord integration
- [ ] Twitch extension
- [ ] Spectator mode
- [ ] Replay system
- [ ] Share game results on social media
- [ ] Friend system
- [ ] Private messaging
- [ ] Block/report system

## Monetization (Optional) 💰
- [ ] Cosmetic shop (hats, colors, badges)
- [ ] Premium subscription (ad-free, exclusive topics)
- [ ] Battle pass system
- [ ] Donations/tips
- [ ] Tournament entry fees (prize pool)

---

**Priority**: Focus on Room Management and User Login first, then Stats and Customization.

**Note**: This is an MVP. Features should be added incrementally based on player feedback and server capacity.
