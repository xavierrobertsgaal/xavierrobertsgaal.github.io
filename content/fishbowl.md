---
title: Fishbowl
bare: true
---

<div id="fishbowl" data-phase="setup">
<p class="fb-home"><a href="index.html">&larr; xavierrg.com</a></p>
<p id="fb-storage-note" class="fb-meta" hidden>Saving is off in this browser — reloading will lose the game.</p>
<section class="fb-screen" data-phase="setup">
  <h1>Fishbowl <svg class="fb-fish" viewBox="0 0 32 20" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="10" rx="10" ry="6.5"/><path d="M21 10l9-6.5v13z"/><circle cx="6.5" cy="8" r="1.4" fill="#141126"/></svg></h1>
  <p class="fb-tagline">Describe it. One word. Act it out.</p>
  <form id="fb-add-form" autocomplete="off">
    <input id="fb-name-input" type="text" placeholder="Who's playing?" maxlength="40" enterkeyhint="done" autocapitalize="words">
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
  <button id="fb-start" class="fb-btn fb-btn-primary" disabled>Start</button>
  <p id="fb-setup-hint" class="fb-meta"></p>
</section>
<section class="fb-screen" data-phase="entry" hidden>
  <p id="fb-entry-progress" class="fb-meta"></p>
  <div id="fb-pass">
    <p class="fb-line">Pass the phone to <strong id="fb-pass-name"></strong>.</p>
    <p class="fb-aside" id="fb-pass-team"></p>
    <button id="fb-pass-ready" class="fb-btn fb-btn-primary">Ready</button>
  </div>
  <div id="fb-entry-form" hidden>
    <p class="fb-line" id="fb-entry-title"></p>
    <div id="fb-clue-inputs"></div>
    <button id="fb-entry-done" class="fb-btn fb-btn-primary" disabled>Done</button>
  </div>
</section>
<section class="fb-screen" data-phase="play" hidden>
  <p class="fb-turn-line"><strong id="fb-turn-giver"></strong><span id="fb-round-mode"></span></p>
  <div id="fb-scorebar" class="fb-scorebar"></div>
  <div class="fb-timer" id="fb-timer">
    <div class="fb-timer-bar"><div id="fb-timer-fill"></div></div>
    <div id="fb-timer-num">60</div>
  </div>
  <div id="fb-cluecard" class="fb-cluecard"><span id="fb-clue-text"></span></div>
  <p class="fb-meta fb-remaining"><span id="fb-left-count"></span> left in the bowl</p>
  <div class="fb-actions">
    <button id="fb-incorrect" class="fb-btn fb-btn-ghost">Incorrect</button>
    <button id="fb-skip" class="fb-btn fb-btn-chip">Skip</button>
    <button id="fb-correct" class="fb-btn fb-btn-primary">Correct</button>
  </div>
</section>
<section class="fb-screen" data-phase="turnEnd" hidden>
  <p class="fb-title">Time&rsquo;s up.</p>
  <p class="fb-aside" id="fb-turn-recap"></p>
  <div class="fb-scoreboard" id="fb-scores-turnend"></div>
  <p class="fb-line" id="fb-next-giver"></p>
  <button id="fb-start-turn" class="fb-btn fb-btn-primary">Start</button>
</section>
<section class="fb-screen" data-phase="roundEnd" hidden>
  <p class="fb-title" id="fb-roundend-label"></p>
  <div class="fb-scoreboard" id="fb-scores-roundend"></div>
  <p class="fb-aside" id="fb-nextround-name"></p>
  <p class="fb-line" id="fb-round-giver"></p>
  <button id="fb-start-round" class="fb-btn fb-btn-primary">Start</button>
</section>
<section class="fb-screen" data-phase="gameover" hidden>
  <p class="fb-title" id="fb-winner"></p>
  <div class="fb-scoreboard" id="fb-scores-final"></div>
  <button id="fb-newgame" class="fb-btn fb-btn-primary">Play again</button>
</section>
</div>
