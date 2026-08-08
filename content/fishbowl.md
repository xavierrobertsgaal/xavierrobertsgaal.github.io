---
title: Fishbowl
---

<div id="fishbowl" data-phase="setup">
<p id="fb-storage-note" class="fb-hint" hidden>Saving is off in this browser — reloading will lose the game.</p>
<section class="fb-screen" data-phase="setup">
  <h1>Fishbowl</h1>
  <p class="fb-sub">One phone, two-plus teams, three rounds — describe it, one word, act it out. Add everyone playing, then pass the phone around to fill the bowl.</p>
  <form id="fb-add-form" autocomplete="off">
    <input id="fb-name-input" type="text" placeholder="Player name" maxlength="40" enterkeyhint="done" autocapitalize="words">
    <button type="submit" class="fb-btn fb-btn-chip">Add</button>
  </form>
  <ul id="fb-roster" class="fb-roster"></ul>
  <div class="fb-config">
    <label>Teams
      <select id="fb-teams">
        <option value="2" selected>2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
    </label>
    <label>Clues each
      <select id="fb-clues">
        <option value="2">2</option>
        <option value="3" selected>3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    </label>
  </div>
  <button id="fb-start" class="fb-btn fb-btn-primary" disabled>Draw teams &amp; start</button>
  <p id="fb-setup-hint" class="fb-hint"></p>
</section>
<section class="fb-screen" data-phase="entry" hidden>
  <p class="fb-label" id="fb-entry-progress"></p>
  <div id="fb-pass">
    <p class="fb-label">Pass the phone to</p>
    <p class="fb-bigname" id="fb-pass-name"></p>
    <p class="fb-sub" id="fb-pass-team"></p>
    <button id="fb-pass-ready" class="fb-btn fb-btn-primary">Got it — show my clue slips</button>
  </div>
  <div id="fb-entry-form" hidden>
    <p class="fb-label">Your clues</p>
    <p class="fb-sub">Words or phrases the others will guess. Keep them secret — the phone moves on when you're done.</p>
    <div id="fb-clue-inputs"></div>
    <button id="fb-entry-done" class="fb-btn fb-btn-primary" disabled>Into the bowl — pass it on</button>
  </div>
</section>
<section class="fb-screen" data-phase="play" hidden>
  <p class="fb-label" id="fb-round-label"></p>
  <p class="fb-turn-who"><span id="fb-turn-team"></span> · <span id="fb-turn-giver"></span></p>
  <div id="fb-scorebar" class="fb-scorebar"></div>
  <div class="fb-timer" id="fb-timer">
    <div class="fb-timer-bar"><div id="fb-timer-fill"></div></div>
    <div id="fb-timer-num">60</div>
  </div>
  <div id="fb-cluecard" class="fb-cluecard"><span id="fb-clue-text"></span></div>
  <p class="fb-hint fb-remaining"><span id="fb-left-count"></span> left in the bowl</p>
  <div class="fb-actions">
    <button id="fb-incorrect" class="fb-btn fb-btn-ghost">Incorrect<small>&minus;1</small></button>
    <button id="fb-skip" class="fb-btn fb-btn-chip">Skip<small>1 per turn</small></button>
    <button id="fb-correct" class="fb-btn fb-btn-primary">Correct<small>+1</small></button>
  </div>
</section>
<section class="fb-screen" data-phase="turnEnd" hidden>
  <p class="fb-label">Time!</p>
  <p class="fb-recap" id="fb-turn-recap"></p>
  <div class="fb-scoreboard" id="fb-scores-turnend"></div>
  <p class="fb-label">Up next</p>
  <p class="fb-bigname" id="fb-next-giver"></p>
  <button id="fb-start-turn" class="fb-btn fb-btn-primary">Start 60 seconds</button>
</section>
<section class="fb-screen" data-phase="roundEnd" hidden>
  <p class="fb-label" id="fb-roundend-label"></p>
  <div class="fb-scoreboard" id="fb-scores-roundend"></div>
  <div class="fb-roundcard">
    <p class="fb-label" id="fb-nextround-name"></p>
    <p class="fb-sub" id="fb-nextround-rules"></p>
  </div>
  <p class="fb-label">Up first</p>
  <p class="fb-bigname" id="fb-round-giver"></p>
  <button id="fb-start-round" class="fb-btn fb-btn-primary">Start 60 seconds</button>
</section>
<section class="fb-screen" data-phase="gameover" hidden>
  <p class="fb-label">Final score</p>
  <p class="fb-bigname" id="fb-winner"></p>
  <div class="fb-scoreboard" id="fb-scores-final"></div>
  <button id="fb-newgame" class="fb-btn fb-btn-primary">New game, same crowd</button>
</section>
</div>
