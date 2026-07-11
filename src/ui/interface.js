import { TOWER_TYPES, getSellValue, getTowerStats } from '../game/towers.js';
import { RESEARCH_NODES } from '../game/research.js';
import { getStageDefinition } from '../game/stages.js';

const towerEntries = Object.entries(TOWER_TYPES);

export function createInterface(root, actions, i18n) {
  root.innerHTML = `
    <header class="hud" id="hud">
      <div class="brand-chip"><span class="brand-mark">N</span><span>NEON//CORE</span></div>
      <div class="hud-metrics">
        <div class="metric"><span id="level-label"></span><strong id="level-value"></strong></div>
        <div class="metric wave"><span id="wave-label"></span><strong id="wave-value"></strong></div>
        <div class="metric energy"><span id="energy-label"></span><strong id="energy-value"></strong></div>
        <div class="metric"><span id="chips-label"></span><strong id="chips-value"></strong></div>
        <div class="metric"><span id="score-label"></span><strong id="score-value"></strong></div>
      </div>
      <div class="core-meter"><div class="core-copy"><span id="core-label"></span><strong id="health-value"></strong></div><div class="bar"><i id="health-bar"></i></div></div>
      <button class="icon-button" id="mute-button"></button>
    </header>

    <section class="tower-panel hidden" id="tower-panel">
      <div class="panel-kicker" id="selected-label"></div><h2 id="selected-name"></h2><div class="level-pips" id="level-pips"></div><p id="selected-role"></p>
      <div class="stat-grid" id="selected-stats"></div><button class="action-button primary" id="upgrade-button"></button><button class="action-button subtle" id="sell-button"></button>
    </section>

    <section class="deployment-panel hidden" id="deployment-panel">
      <div><div class="panel-kicker" id="deployment-title"></div><strong id="deployment-level"></strong><p id="deployment-body"></p><small id="deployment-seed"></small></div>
      <button class="action-button primary" id="start-level-button"></button>
    </section>

    <section class="wave-control hidden" id="wave-control">
      <div><span id="wave-preview-label"></span><strong id="wave-next"></strong><small id="wave-preview"></small></div>
      <div><b id="wave-countdown"></b><button class="action-button primary" id="start-now-button"></button></div>
    </section>

    <nav class="build-dock" id="build-dock">
      <div class="dock-label"><span id="build-label"></span><small>1—5</small></div>
      ${towerEntries.map(([type, tower], index) => `<button class="tower-card" data-tower="${type}" style="--tower-color:${tower.color}"><span class="key">${index < 9 ? index + 1 : '◆'}</span><span class="tower-icon">${tower.glyph}</span><span class="tower-copy"><strong data-tower-name="${type}"></strong><small data-tower-cost="${type}"></small></span><span class="lock-mark">◆</span></button>`).join('')}
      <button class="cancel-build hidden" id="cancel-build"></button>
    </nav>

    <div class="screen-overlay active" id="title-screen">
      <div class="language-switch"><button data-language="zh-CN">中文</button><button data-language="en">EN</button></div>
      <div class="hero-card"><div class="eyebrow" id="menu-eyebrow"></div><div class="hero-logo"><span>NEON</span><span>TOWER</span><span>DEFENCE</span></div><p id="menu-tagline"></p>
        <button class="start-button" id="continue-button"><span id="continue-label"></span><small id="continue-meta"></small></button>
        <div class="menu-row"><button class="action-button subtle" id="new-button"></button><button class="action-button subtle" id="level-select-button"></button><button class="action-button subtle" id="research-menu-button"></button></div>
        <div class="control-strip"><span><kbd>WASD</kbd> MOVE</span><span><kbd>MOUSE</kbd> AIM</span><span><kbd>SHIFT</kbd> DASH</span><span><kbd>1—5</kbd> BUILD</span></div>
      </div><div class="corner-tag top-left" id="online-label"></div><div class="corner-tag bottom-right">CAMPAIGN // 01.20</div>
    </div>

    <div class="screen-overlay" id="pause-screen"><div class="language-switch"><button data-language="zh-CN">中文</button><button data-language="en">EN</button></div><div class="modal-card"><div class="eyebrow" id="pause-kicker"></div><h2 id="pause-title"></h2><button class="action-button primary" id="resume-button"></button><button class="action-button subtle" id="retry-pause-button"></button><button class="action-button subtle" id="menu-pause-button"></button></div></div>

    <div class="screen-overlay" id="tutorial-screen"><div class="modal-card tutorial-card"><div class="tutorial-icon" id="tutorial-icon">◆</div><div class="eyebrow" id="tutorial-kicker"></div><h2 id="tutorial-title"></h2><p id="tutorial-body"></p><div class="counter-callout" id="tutorial-counter"></div><button class="action-button primary" id="tutorial-ack"></button></div></div>

    <div class="screen-overlay" id="clear-screen"><div class="modal-card clear-card"><div class="eyebrow" id="clear-kicker"></div><h2 id="clear-title"></h2><div class="settlement-grid" id="settlement-grid"></div><button class="action-button primary" id="next-level-button"></button><button class="action-button subtle" id="research-clear-button"></button></div></div>

    <div class="screen-overlay" id="research-screen"><div class="lab-card"><header><div><div class="eyebrow" id="research-kicker"></div><h2 id="research-title"></h2></div><strong id="research-chips"></strong></header><div class="research-grid" id="research-grid"></div><button class="action-button subtle" id="research-close"></button></div></div>

    <div class="screen-overlay" id="level-select-screen"><div class="level-select-card"><div class="eyebrow" id="level-select-kicker"></div><h2 id="level-select-title"></h2><div class="level-select-grid" id="level-select-grid"></div><button class="action-button subtle" id="level-select-close"></button></div></div>

    <div class="cinematic-ui" id="cinematic-ui"><div class="cinematic-caption" id="cinematic-caption"></div><button class="action-button subtle" id="cinematic-skip"></button></div>
    <div class="screen-overlay" id="result-screen"><div class="modal-card result-card"><div class="eyebrow" id="result-kicker"></div><h2 id="result-title"></h2><p id="result-summary"></p><div class="overclock-banner" id="victory-overclock"></div><button class="action-button primary" id="retry-result-button"></button><button class="action-button challenge" id="challenge-result-button"></button><button class="action-button subtle" id="menu-result-button"></button></div></div>
    <div class="toast" id="toast"></div><div class="crosshair" id="crosshair"></div>
  `;

  const $ = (selector) => root.querySelector(selector);
  const refs = Object.fromEntries(['hud','tower-panel','deployment-panel','wave-control','build-dock','title-screen','pause-screen','tutorial-screen','clear-screen','research-screen','level-select-screen','result-screen','research-grid','level-select-grid','cinematic-ui','toast','crosshair'].map((id) => [id, $(`#${id}`)]));
  const text = (id, value) => { const element = $(`#${id}`); if (element) element.textContent = value; };

  root.querySelectorAll('[data-tower]').forEach((button) => button.addEventListener('click', () => actions.selectTower(button.dataset.tower)));
  root.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => actions.setLanguage(button.dataset.language)));
  $('#continue-button').addEventListener('click', actions.continueCampaign); $('#new-button').addEventListener('click', actions.newCampaign);
  $('#research-menu-button').addEventListener('click', actions.openResearch); $('#research-clear-button').addEventListener('click', actions.openResearch); $('#research-close').addEventListener('click', actions.closeResearch);
  $('#level-select-button').addEventListener('click', actions.openLevelSelect); $('#level-select-close').addEventListener('click', actions.closeLevelSelect);
  $('#start-level-button').addEventListener('click', actions.startLevel); $('#next-level-button').addEventListener('click', actions.nextLevel);
  $('#start-now-button').addEventListener('click', actions.startNextWave);
  $('#resume-button').addEventListener('click', actions.resume); $('#retry-pause-button').addEventListener('click', actions.retry);
  $('#menu-pause-button').addEventListener('click', actions.mainMenu); $('#menu-result-button').addEventListener('click', actions.mainMenu); $('#tutorial-ack').addEventListener('click', actions.acknowledgeTutorial); $('#cinematic-skip').addEventListener('click', actions.skipCinematic); $('#retry-result-button').addEventListener('click', actions.resultPrimary); $('#challenge-result-button').addEventListener('click', actions.startChallenge);
  $('#upgrade-button').addEventListener('click', actions.upgrade); $('#sell-button').addEventListener('click', actions.sell); $('#cancel-build').addEventListener('click', actions.cancelBuild); $('#mute-button').addEventListener('click', actions.toggleMute);

  let researchSignature = '';
  let levelSelectSignature = '';
  function renderResearch(state) {
    const signature = `${i18n.language}:${state.campaign.coreChips}:${state.campaign.research.join(',')}:${state.campaign.unlockedTowers.join(',')}`;
    if (signature === researchSignature) return;
    researchSignature = signature;
    refs['research-grid'].innerHTML = Object.keys(TOWER_TYPES).map((type) => {
      const unlocked = state.campaign.unlockedTowers.includes(type);
      const nodes = RESEARCH_NODES.filter((node) => node.tower === type);
      return `<section class="research-column ${unlocked ? '' : 'locked'}" style="--tower-color:${TOWER_TYPES[type].color}"><h3>${TOWER_TYPES[type].glyph} ${i18n.t(`tower.${type}.name`)}</h3>${nodes.map((node) => {
        const owned = state.campaign.research.includes(node.id); const prerequisiteMet = !node.prerequisite || state.campaign.research.includes(node.prerequisite);
        const label = i18n.t(`research.${node.effect}`); const status = owned ? i18n.t('research.owned') : !unlocked ? i18n.t('research.locked') : !prerequisiteMet ? i18n.t('research.requires') : `${i18n.t('research.buy')} // ${node.cost}`;
        return `<button class="research-node ${owned ? 'owned' : ''}" data-research="${node.id}" ${owned || !unlocked || !prerequisiteMet ? 'disabled' : ''}><span>${node.rank}</span><strong>${label}</strong><small>${status}</small></button>`;
      }).join('')}</section>`;
    }).join('');
    refs['research-grid'].querySelectorAll('[data-research]').forEach((button) => button.addEventListener('click', () => actions.purchaseResearch(button.dataset.research)));
  }

  function renderLevelSelect(state) {
    const signature = `${i18n.language}:${state.campaign.highestCleared}:${state.campaign.currentLevel}`;
    if (signature === levelSelectSignature) return;
    levelSelectSignature = signature;
    refs['level-select-grid'].innerHTML = Array.from({ length: 20 }, (_, index) => {
      const level = index + 1;
      const stage = getStageDefinition(level);
      const unlocked = level <= Math.min(20, state.campaign.highestCleared + 1);
      const current = level === state.campaign.currentLevel;
      const milestone = stage.boss ? 'boss' : stage.elite ? 'elite' : '';
      return `<button class="level-node ${milestone} ${current ? 'current' : ''}" data-level="${level}" ${unlocked ? '' : 'disabled'}><strong>${String(level).padStart(2, '0')}</strong><small>${unlocked ? `${current ? i18n.t('levelSelect.current') : `C${stage.chapter}`} // ${stage.waveCount}W${stage.boss ? ' // BOSS' : ''}` : i18n.t('levelSelect.locked')}</small></button>`;
    }).join('');
    refs['level-select-grid'].querySelectorAll('[data-level]:not([disabled])').forEach((button) => button.addEventListener('click', () => actions.selectLevel(Number(button.dataset.level))));
  }

  function update(state, pointer) {
    const t = i18n.t;
    text('menu-eyebrow', t('menu.eyebrow')); text('menu-tagline', t('menu.tagline')); text('continue-label', t('menu.continue')); text('continue-meta', t('menu.continueMeta', { level: state.campaign.currentLevel, cleared: state.campaign.highestCleared })); text('new-button', t('menu.new')); text('level-select-button', t('menu.levelSelect')); text('research-menu-button', t('menu.research')); text('online-label', t('menu.online')); $('#level-select-button').disabled = state.campaign.highestCleared === 0;
    text('level-label', state.campaign.challengeMode ? t('hud.challenge', { cycle: state.campaign.challengeCycle }) : t('hud.level', { current: state.campaign.currentLevel, total: 20 })); text('level-value', `${state.campaign.currentLevel} / 20`); text('wave-label', t('hud.wave', { current: state.wave.index, total: state.wave.total })); text('wave-value', `${state.wave.index} / ${state.wave.total}`); text('energy-label', t('hud.energy')); text('energy-value', Math.floor(state.energy)); text('chips-label', t('hud.chips')); text('chips-value', state.campaign.coreChips); text('score-label', t('hud.score')); text('score-value', Math.floor(state.score).toString().padStart(6, '0')); text('core-label', t('hud.core'));
    const healthPercent = Math.max(0, Math.round((state.base.health / state.base.maxHealth) * 100)); text('health-value', `${healthPercent}%`); $('#health-bar').style.width = `${healthPercent}%`; $('#health-bar').classList.toggle('danger', healthPercent <= 30); text('mute-button', state.muted ? t('hud.soundOff') : t('hud.soundOn'));
    text('build-label', t('build.title')); text('cancel-build', t('build.cancel')); text('selected-label', t('tower.selected'));

    refs['title-screen'].classList.toggle('active', state.mode === 'title'); refs['pause-screen'].classList.toggle('active', state.mode === 'paused'); refs['tutorial-screen'].classList.toggle('active', state.mode === 'tutorial'); refs['clear-screen'].classList.toggle('active', state.mode === 'level-clear'); refs['research-screen'].classList.toggle('active', state.mode === 'research'); refs['level-select-screen'].classList.toggle('active', state.mode === 'level-select');
    const hasResult = state.mode === 'defeat' || state.mode === 'victory'; refs['result-screen'].classList.toggle('active', hasResult); refs['cinematic-ui'].classList.toggle('active', state.mode === 'cinematic'); refs.hud.classList.toggle('hidden', ['title','research','level-select','cinematic'].includes(state.mode));

    refs['deployment-panel'].classList.toggle('hidden', state.mode !== 'deployment'); text('deployment-title', t('deployment.title')); text('deployment-level', `${t('hud.chapter', { chapter: state.map.chapter })} // ${t('hud.level', { current: state.campaign.currentLevel, total: 20 })}`); text('deployment-body', `${t('deployment.body')} ${t('deployment.totalWaves', { total: state.wave.total })}`); text('deployment-seed', t('deployment.seed', { seed: state.map.seed })); text('start-level-button', t('deployment.start'));
    refs['wave-control'].classList.toggle('hidden', state.mode !== 'wave-countdown'); text('wave-preview-label', t('wave.preview')); text('wave-next', t('hud.wave', { current: state.wave.index + 1, total: state.wave.total })); text('wave-preview', state.wave.preview.map((type) => t(`enemy.${type}`)).join('  ◆  ')); text('wave-countdown', t('wave.countdown', { seconds: Math.max(0, Math.ceil(state.wave.countdown)) })); text('start-now-button', t('wave.startNow'));
    text('pause-kicker', t('pause.kicker')); text('pause-title', t('pause.title')); text('resume-button', t('pause.resume')); text('retry-pause-button', t('pause.restart')); text('menu-pause-button', t('pause.menu'));

    if (state.tutorial) { text('tutorial-kicker', t('tutorial.kicker')); text('tutorial-title', t(`tutorial.${state.tutorial.id}.title`)); text('tutorial-body', t(`tutorial.${state.tutorial.id}.body`)); text('tutorial-counter', t('tutorial.counter', { tower: t(`tower.${state.tutorial.counter}.name`) })); text('tutorial-ack', t('tutorial.ack')); $('#tutorial-icon').style.color = TOWER_TYPES[state.tutorial.counter].color; }
    if (state.levelResult) { text('clear-kicker', t('clear.kicker')); text('clear-title', t('clear.title', { level: state.levelResult.clearedLevel })); $('#settlement-grid').innerHTML = `<span>${t('clear.recycled')}<strong>+${state.levelResult.recycled}</strong></span><span>${t('clear.reward')}<strong>+${state.levelResult.baseReward + state.levelResult.performanceBonus}</strong></span><span>${t('clear.funds')}<strong>${state.levelResult.totalFunds}</strong></span>`; text('next-level-button', t('clear.next')); text('research-clear-button', t('clear.research')); }
    text('research-kicker', t('research.kicker')); text('research-title', t('research.title')); text('research-chips', t('research.chips', { chips: state.campaign.coreChips })); text('research-close', t('research.close')); renderResearch(state);
    text('level-select-kicker', t('levelSelect.kicker')); text('level-select-title', t('levelSelect.title')); text('level-select-close', t('levelSelect.close')); renderLevelSelect(state);

    if (state.mode === 'cinematic') { text('cinematic-caption', t(`cinematic.phase.${state.cinematic.phase}`)); text('cinematic-skip', t('cinematic.skip')); }
    if (hasResult) {
      const defeat = state.mode === 'defeat';
      const mostUsedEntry = Object.entries(state.campaign.stats.towerBuilds ?? {}).sort((a, b) => b[1] - a[1])[0];
      const mostUsed = mostUsedEntry ? `${t(`tower.${mostUsedEntry[0]}.name`)} × ${mostUsedEntry[1]}` : '—';
      text('result-kicker', t(defeat ? 'defeat.kicker' : 'victory.kicker'));
      text('result-title', t(defeat ? 'defeat.title' : 'victory.title'));
      text('result-summary', defeat
        ? `${state.kills} // ${state.score.toString().padStart(6, '0')} // ${state.campaign.currentLevel}/20`
        : `${t('victory.levels')}: 20 // ${t('victory.noLeaks')}: ${state.campaign.stats.noLeakClears} // ${t('victory.research')}: ${state.campaign.research.length}/39 // ${t('victory.mostUsed')}: ${mostUsed}`);
      text('victory-overclock', defeat ? '' : t('victory.overclock'));
      text('retry-result-button', t(defeat ? 'defeat.retry' : 'cinematic.replay'));
      text('challenge-result-button', t('victory.challenge')); $('#challenge-result-button').classList.toggle('hidden', defeat || !state.campaign.challengeUnlocked);
      text('menu-result-button', t(defeat ? 'defeat.menu' : 'victory.menu'));
      refs['result-screen'].classList.toggle('defeat', defeat);
    }

    const selected = state.towers.find((tower) => tower.id === state.selectedTowerId); refs['tower-panel'].classList.toggle('hidden', !selected);
    if (selected) { const definition = TOWER_TYPES[selected.type]; const stats = getTowerStats(selected); const next = definition.levels[selected.level + 1]; refs['tower-panel'].style.setProperty('--tower-color', definition.color); text('selected-name', t(`tower.${selected.type}.name`)); text('selected-role', t(`tower.${selected.type}.role`)); $('#level-pips').innerHTML = [0,1,2].map((index) => `<i class="${index <= selected.level ? 'active' : ''}"></i>`).join(''); $('#selected-stats').innerHTML = `<span>${t('tower.damage')}<strong>${stats.damage}</strong></span><span>${t('tower.range')}<strong>${stats.range}</strong></span><span>${t('tower.rate')}<strong>${(1 / stats.cooldown).toFixed(1)}</strong></span>`; $('#upgrade-button').disabled = !next || state.energy < next.cost; $('#upgrade-button').innerHTML = next ? `${t('tower.upgrade')} <small>${next.cost}</small>` : t('tower.max'); $('#sell-button').innerHTML = `${t('tower.sell')} <small>+${getSellValue(selected)}</small>`; }

    refs['build-dock'].classList.toggle('hidden', ['title','paused','tutorial','level-clear','research','level-select','defeat','victory','cinematic'].includes(state.mode)); refs['build-dock'].classList.toggle('building', Boolean(state.selectedTowerType)); $('#cancel-build').classList.toggle('hidden', !state.selectedTowerType);
    root.querySelectorAll('[data-tower]').forEach((button) => { const type = button.dataset.tower; const locked = !state.campaign.unlockedTowers.includes(type); button.classList.toggle('locked', locked); button.classList.toggle('selected', state.selectedTowerType === type); button.classList.toggle('unaffordable', state.energy < TOWER_TYPES[type].levels[0].cost); button.querySelector(`[data-tower-name="${type}"]`).textContent = t(`tower.${type}.name`); button.querySelector(`[data-tower-cost="${type}"]`).textContent = locked ? t('build.locked') : t('build.cost', { cost: TOWER_TYPES[type].levels[0].cost }); });

    refs.toast.textContent = state.notice; refs.toast.classList.toggle('visible', state.noticeTimer > 0 && !['title','research','victory','defeat'].includes(state.mode)); refs.crosshair.style.left = `${pointer.x / 12.8}%`; refs.crosshair.style.top = `${pointer.y / 7.2}%`; refs.crosshair.classList.toggle('building', Boolean(state.selectedTowerType)); refs.crosshair.classList.toggle('hidden', ['title','paused','tutorial','level-clear','research','victory','defeat','cinematic'].includes(state.mode));
    root.querySelectorAll('[data-language]').forEach((button) => button.classList.toggle('active', button.dataset.language === i18n.language));
  }

  return { update };
}
