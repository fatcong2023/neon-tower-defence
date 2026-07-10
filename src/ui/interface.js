import { TOWER_TYPES, getSellValue, getTowerStats } from '../game/towers.js';

const towerEntries = Object.entries(TOWER_TYPES);

export function createInterface(root, actions) {
  root.innerHTML = `
    <header class="hud" aria-live="polite">
      <div class="brand-chip"><span class="brand-mark">N</span><span>NEON//CORE</span></div>
      <div class="hud-metrics">
        <div class="metric"><span>WAVE</span><strong id="wave-value">0 / 10</strong></div>
        <div class="metric energy"><span>ENERGY</span><strong id="energy-value">420</strong></div>
        <div class="metric"><span>SCORE</span><strong id="score-value">000000</strong></div>
      </div>
      <div class="core-meter">
        <div class="core-copy"><span>CORE INTEGRITY</span><strong id="health-value">100%</strong></div>
        <div class="bar"><i id="health-bar"></i></div>
      </div>
      <button class="icon-button" id="mute-button" aria-label="Toggle sound">SOUND ON</button>
    </header>

    <section class="tower-panel hidden" id="tower-panel">
      <div class="panel-kicker">SELECTED DEFENCE</div>
      <h2 id="selected-name">PULSE SPIRE</h2>
      <div class="level-pips" id="level-pips"></div>
      <p id="selected-role"></p>
      <div class="stat-grid" id="selected-stats"></div>
      <button class="action-button primary" id="upgrade-button">UPGRADE</button>
      <button class="action-button subtle" id="sell-button">SELL</button>
    </section>

    <section class="wave-control hidden" id="wave-control">
      <div><span>NEXT WAVE</span><strong id="countdown-value">4.5</strong></div>
      <button class="action-button primary" id="launch-button">LAUNCH EARLY <small>+BONUS</small></button>
    </section>

    <nav class="build-dock" id="build-dock" aria-label="Defence towers">
      <div class="dock-label"><span>BUILD</span><small>1—5</small></div>
      ${towerEntries.map(([type, tower], index) => `
        <button class="tower-card" data-tower="${type}" style="--tower-color:${tower.color}">
          <span class="key">${index + 1}</span>
          <span class="tower-icon">${tower.glyph}</span>
          <span class="tower-copy"><strong>${tower.shortName}</strong><small>${tower.levels[0].cost} E</small></span>
        </button>
      `).join('')}
      <button class="cancel-build hidden" id="cancel-build">CANCEL <small>ESC</small></button>
    </nav>

    <div class="screen-overlay active" id="title-screen">
      <div class="hero-card">
        <div class="eyebrow">TACTICAL ARCADE DEFENCE</div>
        <div class="hero-logo"><span>NEON</span><span>TOWER</span><span>DEFENCE</span></div>
        <p>Move fast. Build smart. Protect the last light.</p>
        <button class="start-button" id="start-button"><span>START RUN</span><small>10 WAVES // 1 CORE</small></button>
        <div class="control-strip">
          <span><kbd>WASD</kbd> MOVE</span><span><kbd>MOUSE</kbd> AIM + FIRE</span><span><kbd>SHIFT</kbd> DASH</span><span><kbd>1—5</kbd> BUILD</span>
        </div>
      </div>
      <div class="corner-tag top-left">SYSTEM // ONLINE</div>
      <div class="corner-tag bottom-right">BUILD 01.10</div>
    </div>

    <div class="screen-overlay" id="pause-screen">
      <div class="modal-card">
        <div class="eyebrow">SIMULATION SUSPENDED</div><h2>PAUSED</h2>
        <button class="action-button primary" id="resume-button">RESUME</button>
        <button class="action-button subtle" id="restart-pause-button">RESTART RUN</button>
      </div>
    </div>

    <div class="screen-overlay" id="result-screen">
      <div class="modal-card result-card">
        <div class="eyebrow" id="result-kicker">RUN COMPLETE</div><h2 id="result-title">CORE SECURED</h2>
        <p id="result-summary"></p>
        <button class="action-button primary" id="restart-result-button">RUN IT AGAIN</button>
      </div>
    </div>

    <div class="toast" id="toast"></div>
    <div class="crosshair" id="crosshair"></div>
  `;

  const $ = (selector) => root.querySelector(selector);
  const refs = {
    wave: $('#wave-value'), energy: $('#energy-value'), score: $('#score-value'), health: $('#health-value'), healthBar: $('#health-bar'),
    towerPanel: $('#tower-panel'), selectedName: $('#selected-name'), selectedRole: $('#selected-role'), selectedStats: $('#selected-stats'), levelPips: $('#level-pips'),
    upgrade: $('#upgrade-button'), sell: $('#sell-button'), waveControl: $('#wave-control'), countdown: $('#countdown-value'),
    title: $('#title-screen'), pause: $('#pause-screen'), result: $('#result-screen'), resultKicker: $('#result-kicker'), resultTitle: $('#result-title'), resultSummary: $('#result-summary'),
    toast: $('#toast'), crosshair: $('#crosshair'), cancel: $('#cancel-build'), mute: $('#mute-button'), dock: $('#build-dock'),
  };

  root.querySelectorAll('[data-tower]').forEach((button) => button.addEventListener('click', () => actions.selectTower(button.dataset.tower)));
  $('#start-button').addEventListener('click', actions.start);
  $('#resume-button').addEventListener('click', actions.resume);
  $('#restart-pause-button').addEventListener('click', actions.restart);
  $('#restart-result-button').addEventListener('click', actions.restart);
  $('#upgrade-button').addEventListener('click', actions.upgrade);
  $('#sell-button').addEventListener('click', actions.sell);
  $('#launch-button').addEventListener('click', actions.launchWave);
  $('#cancel-build').addEventListener('click', actions.cancelBuild);
  $('#mute-button').addEventListener('click', actions.toggleMute);

  function update(state, pointer) {
    refs.wave.textContent = `${state.wave.index} / 10`;
    refs.energy.textContent = Math.floor(state.energy).toString();
    refs.score.textContent = Math.floor(state.score).toString().padStart(6, '0');
    const healthPercent = Math.max(0, Math.round((state.base.health / state.base.maxHealth) * 100));
    refs.health.textContent = `${healthPercent}%`;
    refs.healthBar.style.width = `${healthPercent}%`;
    refs.healthBar.classList.toggle('danger', healthPercent <= 30);
    refs.mute.textContent = state.muted ? 'SOUND OFF' : 'SOUND ON';

    refs.title.classList.toggle('active', state.mode === 'title');
    refs.pause.classList.toggle('active', state.mode === 'paused');
    const hasResult = state.mode === 'victory' || state.mode === 'defeat';
    refs.result.classList.toggle('active', hasResult);
    if (hasResult) {
      const victory = state.mode === 'victory';
      refs.resultKicker.textContent = victory ? 'RUN COMPLETE' : 'SIGNAL LOST';
      refs.resultTitle.textContent = victory ? 'CORE SECURED' : 'CORE BREACHED';
      refs.resultSummary.textContent = `${state.kills} HOSTILES // ${state.score.toString().padStart(6, '0')} SCORE // WAVE ${state.wave.index}`;
      refs.result.classList.toggle('defeat', !victory);
    }

    const selected = state.towers.find((tower) => tower.id === state.selectedTowerId);
    refs.towerPanel.classList.toggle('hidden', !selected);
    if (selected) {
      const definition = TOWER_TYPES[selected.type];
      const stats = getTowerStats(selected);
      const next = definition.levels[selected.level + 1];
      refs.towerPanel.style.setProperty('--tower-color', definition.color);
      refs.selectedName.textContent = definition.name.toUpperCase();
      refs.selectedRole.textContent = definition.role;
      refs.levelPips.innerHTML = [0, 1, 2].map((levelIndex) => `<i class="${levelIndex <= selected.level ? 'active' : ''}"></i>`).join('');
      refs.selectedStats.innerHTML = `<span>DMG<strong>${stats.damage}</strong></span><span>RANGE<strong>${stats.range}</strong></span><span>RATE<strong>${(1 / stats.cooldown).toFixed(1)}</strong></span>`;
      refs.upgrade.disabled = !next || state.energy < next.cost;
      refs.upgrade.innerHTML = next ? `UPGRADE <small>${next.cost} E</small>` : 'MAX LEVEL';
      refs.sell.innerHTML = `SELL <small>+${getSellValue(selected)} E</small>`;
    }

    refs.waveControl.classList.toggle('hidden', state.mode !== 'countdown');
    refs.countdown.textContent = Math.max(0, state.wave.countdown).toFixed(1);
    refs.cancel.classList.toggle('hidden', !state.selectedTowerType);
    refs.dock.classList.toggle('building', Boolean(state.selectedTowerType));
    root.querySelectorAll('[data-tower]').forEach((button) => {
      const type = button.dataset.tower;
      button.classList.toggle('selected', state.selectedTowerType === type);
      button.classList.toggle('unaffordable', state.energy < TOWER_TYPES[type].levels[0].cost);
    });

    refs.toast.textContent = state.notice;
    refs.toast.classList.toggle('visible', state.noticeTimer > 0 && !['title', 'victory', 'defeat'].includes(state.mode));
    refs.crosshair.style.left = `${(pointer.x / 1280) * 100}%`;
    refs.crosshair.style.top = `${(pointer.y / 720) * 100}%`;
    refs.crosshair.classList.toggle('building', Boolean(state.selectedTowerType));
    refs.crosshair.classList.toggle('hidden', state.mode === 'title' || state.mode === 'paused' || hasResult);
  }

  return { update };
}
