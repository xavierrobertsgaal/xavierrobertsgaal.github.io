// Fishbowl — pass-the-phone party game. Loaded only on /fishbowl (see build.py).
// All state lives in one object persisted to localStorage on every mutation, so
// a reload mid-game (even mid-timer) picks up exactly where it left off.
(() => {
  "use strict";
  const root = document.getElementById("fishbowl");
  if (!root) return;

  const KEY = "fishbowl.v1";
  const ROUNDS = [
    null,
    { mode: "describe it", line: "Round 1: describe it — say anything but the word itself." },
    { mode: "one word", line: "Round 2: one word only — same words as before." },
    { mode: "act it out", line: "Round 3: act it out — no words at all." },
  ];
  const TEAM_NAMES = ["Team Indigo", "Team Plum", "Team Ink", "Team Slate"];

  // ---- state ----------------------------------------------------------------
  function defaultState() {
    return {
      version: 1,
      phase: "setup", // setup | entry | play | turnEnd | roundEnd | gameover
      config: { numTeams: 2, cluesPerPlayer: 3, turnSeconds: 60, skipsPerTurn: 1 },
      players: [], // {id, name, teamId}
      teams: [], // {id, name, score}
      entry: { currentPlayerIndex: 0 },
      clues: [], // {id, text, authorId} — the full bowl, reused every round
      round: 1,
      turn: {
        activeTeamIdx: 0,
        giverIndexByTeam: {}, // teamId -> rotating pointer into that team's members
        queue: [], // clue ids still in the bowl this round (current clue excluded)
        currentClueId: null,
        turnEndsAt: null, // wall-clock ms — the one source of truth for the timer
        skipsUsed: 0,
        turnScore: 0,
        lastRecap: null, // {teamId, points, roundOver}
      },
    };
  }

  let storageOk = true;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      storageOk = false;
      document.getElementById("fb-storage-note").hidden = false;
    }
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      // Discard saves from a different schema or anything mangled.
      if (!s || s.version !== 1 || typeof s.phase !== "string" || !s.turn) return defaultState();
      return s;
    } catch (e) {
      storageOk = false;
      return defaultState();
    }
  }

  let state = load();
  let tickId = null; // display interval — never persisted, always derived from turnEndsAt
  let lockUntil = 0; // double-tap guard for the play buttons
  let entryRevealed = false; // in-memory only: a reload always lands on the pass screen

  // ---- helpers ---------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const uid = () => Math.random().toString(36).slice(2, 10);
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const activeTeam = () => state.teams[state.turn.activeTeamIdx];
  const clueById = (id) => state.clues.find((c) => c.id === id);
  function nextUp() {
    const team = activeTeam();
    const members = state.players.filter((p) => p.teamId === team.id);
    const giver = members[state.turn.giverIndexByTeam[team.id] % members.length];
    return { team, giver };
  }
  const esc = (s) =>
    s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  // ---- game actions ----------------------------------------------------------
  function addPlayer(name) {
    name = name.trim().replace(/\s+/g, " ");
    if (!name) return;
    state.players.push({ id: uid(), name, teamId: null });
    save();
    renderSetup();
  }

  function startGame() {
    const teams = Math.min(state.config.numTeams, state.players.length);
    state.config.numTeams = teams;
    // Shuffle, then deal round-robin so team sizes stay balanced.
    state.players = shuffle(state.players);
    state.players.forEach((p, i) => (p.teamId = i % teams));
    state.teams = Array.from({ length: teams }, (_, i) => ({ id: i, name: TEAM_NAMES[i], score: 0 }));
    state.entry.currentPlayerIndex = 0;
    state.phase = "entry";
    entryRevealed = false;
    save();
    render();
  }

  function submitClues() {
    const texts = [...document.querySelectorAll("#fb-clue-inputs input")].map((i) =>
      i.value.trim().replace(/\s+/g, " ")
    );
    if (texts.some((t) => !t)) return;
    const author = state.players[state.entry.currentPlayerIndex];
    for (const t of texts) state.clues.push({ id: uid(), text: t, authorId: author.id });
    state.entry.currentPlayerIndex++;
    entryRevealed = false;
    if (state.entry.currentPlayerIndex >= state.players.length) {
      beginRound(1, true); // bowl is full — round 1 intro
    } else {
      save();
    }
    render();
  }

  function beginRound(num, firstGame) {
    state.round = num;
    state.turn.queue = shuffle(state.clues.map((c) => c.id)); // whole bowl back in
    if (firstGame) {
      state.turn.activeTeamIdx = 0;
      state.turn.giverIndexByTeam = {};
      state.teams.forEach((t) => (state.turn.giverIndexByTeam[t.id] = 0));
      state.turn.lastRecap = null;
    }
    state.turn.currentClueId = null;
    state.turn.turnEndsAt = null;
    state.phase = "roundEnd"; // doubles as the round-intro / handoff screen
    save();
  }

  function startTurn() {
    state.turn.skipsUsed = 0;
    state.turn.turnScore = 0;
    state.turn.currentClueId = state.turn.queue.shift();
    state.turn.turnEndsAt = Date.now() + state.config.turnSeconds * 1000;
    state.phase = "play";
    save();
    render();
    startTick();
  }

  function markCorrect() {
    activeTeam().score++;
    state.turn.turnScore++;
    advanceClue(false); // guessed clues leave the bowl until next round
  }
  function markIncorrect() {
    activeTeam().score--;
    state.turn.turnScore--;
    advanceClue(true); // back into the bowl
  }
  function skipClue() {
    if (state.turn.skipsUsed >= state.config.skipsPerTurn) return;
    if (state.turn.queue.length === 0) return; // nothing to swap to
    state.turn.skipsUsed++;
    advanceClue(true);
  }
  function advanceClue(requeue) {
    if (requeue) state.turn.queue.push(state.turn.currentClueId);
    if (state.turn.queue.length === 0) {
      endTurn(true); // bowl is empty — the round is over
      return;
    }
    state.turn.currentClueId = state.turn.queue.shift();
    save();
    render();
  }

  function endTurn(roundOver) {
    stopTick();
    // Time ran out with a clue still on screen: it wasn't guessed, so it goes
    // back into the bowl. (When the bowl empties, current was already consumed.)
    if (!roundOver && state.turn.currentClueId) state.turn.queue.push(state.turn.currentClueId);
    const team = activeTeam();
    state.turn.lastRecap = { teamId: team.id, points: state.turn.turnScore, roundOver };
    state.turn.giverIndexByTeam[team.id]++; // next time this team is up, next member gives
    state.turn.activeTeamIdx = (state.turn.activeTeamIdx + 1) % state.teams.length;
    state.turn.currentClueId = null;
    state.turn.turnEndsAt = null;
    if (roundOver) {
      if (state.round >= 3) state.phase = "gameover";
      else beginRound(state.round + 1, false);
    } else {
      state.phase = "turnEnd";
    }
    save();
    render();
  }

  function newGame() {
    // Keep the roster for a rematch; everything else resets.
    const roster = state.players.map((p) => ({ id: p.id, name: p.name, teamId: null }));
    state = defaultState();
    state.players = roster;
    save();
    render();
  }

  // ---- timer -----------------------------------------------------------------
  // The interval is display-only: remaining time is always recomputed from the
  // wall clock, so throttled/backgrounded tabs and reloads can't skew it.
  function startTick() {
    stopTick();
    tickId = setInterval(onTick, 250);
    onTick();
  }
  function stopTick() {
    if (tickId) clearInterval(tickId);
    tickId = null;
  }
  function onTick() {
    if (state.phase !== "play" || !state.turn.turnEndsAt) {
      stopTick();
      return;
    }
    const remaining = Math.max(0, state.turn.turnEndsAt - Date.now());
    renderTimer(remaining);
    if (remaining <= 0) endTurn(false);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.phase === "play") onTick();
  });

  // ---- rendering ---------------------------------------------------------------
  function render() {
    root.dataset.phase = state.phase;
    for (const s of document.querySelectorAll("#fishbowl .fb-screen")) {
      s.hidden = s.dataset.phase !== state.phase;
    }
    const fns = {
      setup: renderSetup,
      entry: renderEntry,
      play: renderPlay,
      turnEnd: renderTurnEnd,
      roundEnd: renderRoundEnd,
      gameover: renderGameover,
    };
    fns[state.phase]();
  }

  function renderSetup() {
    $("fb-roster").innerHTML = state.players
      .map(
        (p) =>
          `<li>${esc(p.name)}<button type="button" data-remove="${p.id}" aria-label="Remove ${esc(
            p.name
          )}">&times;</button></li>`
      )
      .join("");
    $("fb-teams").value = String(state.config.numTeams);
    $("fb-clues").value = String(state.config.cluesPerPlayer);
    const n = state.players.length;
    const need = Math.max(2, state.config.numTeams);
    const ok = n >= need;
    $("fb-start").disabled = !ok;
    $("fb-setup-hint").textContent = ok ? "" : `Need ${need - n} more player${need - n === 1 ? "" : "s"}.`;
  }

  function renderEntry() {
    const player = state.players[state.entry.currentPlayerIndex];
    const team = state.teams[player.teamId];
    $("fb-entry-progress").textContent = `${state.entry.currentPlayerIndex + 1} of ${state.players.length}`;
    $("fb-pass").hidden = entryRevealed;
    $("fb-entry-form").hidden = !entryRevealed;
    if (!entryRevealed) {
      $("fb-pass-name").textContent = player.name;
      $("fb-pass-team").innerHTML = `You're on <strong class="fb-team-${team.id}">${esc(team.name)}</strong>.`;
    } else {
      $("fb-entry-title").textContent = `Your ${state.config.cluesPerPlayer} slips — keep them secret.`;
      const box = $("fb-clue-inputs");
      box.innerHTML = Array.from(
        { length: state.config.cluesPerPlayer },
        (_, i) => `<input type="text" maxlength="60" placeholder="Clue ${i + 1}" autocomplete="off">`
      ).join("");
      box.querySelector("input").focus();
      updateEntryDone();
    }
  }
  function updateEntryDone() {
    const inputs = [...document.querySelectorAll("#fb-clue-inputs input")];
    $("fb-entry-done").disabled = inputs.some((i) => !i.value.trim());
  }

  function renderPlay() {
    const { team, giver } = nextUp();
    $("fb-turn-giver").textContent = giver.name;
    $("fb-turn-giver").className = `fb-team-${team.id}`;
    $("fb-round-mode").textContent = ` — ${ROUNDS[state.round].mode}`;
    $("fb-scorebar").innerHTML = state.teams
      .map(
        (t) =>
          `<span class="fb-score-chip fb-team-${t.id}${t.id === team.id ? " active" : ""}">${esc(
            t.name
          )} ${t.score}</span>`
      )
      .join("");
    const clue = clueById(state.turn.currentClueId);
    $("fb-clue-text").textContent = clue ? clue.text : "";
    const card = $("fb-cluecard");
    card.classList.remove("fb-pop"); // retrigger the entrance animation
    void card.offsetWidth;
    card.classList.add("fb-pop");
    $("fb-left-count").textContent = String(state.turn.queue.length);
    $("fb-skip").disabled = state.turn.skipsUsed >= state.config.skipsPerTurn || state.turn.queue.length === 0;
    if (state.turn.turnEndsAt) renderTimer(Math.max(0, state.turn.turnEndsAt - Date.now()));
  }

  function renderTimer(remaining) {
    const total = state.config.turnSeconds * 1000;
    $("fb-timer-num").textContent = String(Math.ceil(remaining / 1000));
    $("fb-timer-fill").style.transform = `scaleX(${remaining / total})`;
    $("fb-timer").classList.toggle("fb-low", remaining <= 10_000);
  }

  function scoreboardHTML() {
    const leader = Math.max(...state.teams.map((t) => t.score));
    return state.teams
      .map(
        (t) =>
          `<div class="row${t.score === leader ? " lead" : ""}"><span class="fb-team-${t.id}">${esc(
            t.name
          )}</span><span>${t.score}</span></div>`
      )
      .join("");
  }

  function recapText(recap) {
    const team = state.teams[recap.teamId];
    const pts = recap.points;
    return `${team.name} ${pts >= 0 ? "picked up" : "lost"} ${Math.abs(pts)} point${
      Math.abs(pts) === 1 ? "" : "s"
    }.`;
  }

  function nextUpHTML(prefix) {
    const { team, giver } = nextUp();
    return `${prefix} <strong>${esc(giver.name)}</strong>, for <span class="fb-team-${team.id}">${esc(
      team.name
    )}</span>.`;
  }

  function renderTurnEnd() {
    $("fb-turn-recap").textContent = state.turn.lastRecap ? recapText(state.turn.lastRecap) : "";
    $("fb-scores-turnend").innerHTML = scoreboardHTML();
    $("fb-next-giver").innerHTML = nextUpHTML("Next up:");
  }

  function renderRoundEnd() {
    const intro = !state.turn.lastRecap; // fresh game: the bowl was just filled
    $("fb-roundend-label").textContent = intro ? "The bowl is full." : `That’s round ${state.round - 1}.`;
    $("fb-scores-roundend").innerHTML = intro ? "" : scoreboardHTML();
    $("fb-nextround-name").textContent = ROUNDS[state.round].line;
    $("fb-round-giver").innerHTML = nextUpHTML("First up:");
  }

  function renderGameover() {
    const best = Math.max(...state.teams.map((t) => t.score));
    const winners = state.teams.filter((t) => t.score === best);
    $("fb-winner").innerHTML =
      winners.length === 1
        ? `<span class="fb-team-${winners[0].id}">${esc(winners[0].name)}</span> wins.`
        : "It’s a tie.";
    $("fb-scores-final").innerHTML = scoreboardHTML();
  }

  // ---- events ------------------------------------------------------------------
  function guarded(fn) {
    return () => {
      const now = Date.now();
      if (now < lockUntil) return; // blunt accidental double-taps
      lockUntil = now + 250;
      fn();
    };
  }

  $("fb-add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    addPlayer($("fb-name-input").value);
    $("fb-name-input").value = "";
    $("fb-name-input").focus();
  });
  $("fb-roster").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove]");
    if (!btn) return;
    state.players = state.players.filter((p) => p.id !== btn.dataset.remove);
    save();
    renderSetup();
  });
  $("fb-teams").addEventListener("change", (e) => {
    state.config.numTeams = parseInt(e.target.value, 10) || 2;
    save();
    renderSetup();
  });
  $("fb-clues").addEventListener("change", (e) => {
    state.config.cluesPerPlayer = parseInt(e.target.value, 10) || 3;
    save();
    renderSetup();
  });
  $("fb-start").addEventListener("click", startGame);
  $("fb-pass-ready").addEventListener("click", () => {
    entryRevealed = true;
    renderEntry();
  });
  $("fb-clue-inputs").addEventListener("input", updateEntryDone);
  $("fb-entry-done").addEventListener("click", submitClues);
  $("fb-correct").addEventListener("click", guarded(markCorrect));
  $("fb-incorrect").addEventListener("click", guarded(markIncorrect));
  $("fb-skip").addEventListener("click", guarded(skipClue));
  $("fb-start-turn").addEventListener("click", startTurn);
  $("fb-start-round").addEventListener("click", startTurn);
  $("fb-newgame").addEventListener("click", newGame);

  // ---- boot ----------------------------------------------------------------------
  if (!storageOk) $("fb-storage-note").hidden = false;
  if (state.phase === "play") {
    // Reload mid-turn: resume the clock if time is left, otherwise the turn is over.
    if (!state.turn.turnEndsAt || state.turn.turnEndsAt - Date.now() <= 0) {
      endTurn(false); // renders
    } else {
      render();
      startTick();
    }
  } else {
    render();
  }
})();
