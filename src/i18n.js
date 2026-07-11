export const LANGUAGE_KEY = 'neon-tower-defence-language';

const zh = {
  'menu.eyebrow': '战术霓虹塔防', 'menu.tagline': '移动、部署、进化，守护最后的光。', 'menu.continue': '继续战役', 'menu.new': '新战役', 'menu.research': '霓虹研究所', 'menu.levelSelect': '关卡选择',
  'menu.continueMeta': '第 {level} 关 // 最高 {cleared}', 'menu.newConfirm': '确定要覆盖当前战役进度吗？', 'menu.language': '语言', 'menu.online': '系统 // 在线',
  'hud.level': '关卡 {current} / {total}', 'hud.wave': '波次 {current} / {total}', 'hud.energy': '资金', 'hud.score': '分数', 'hud.core': '核心完整度', 'hud.chips': '核心芯片', 'hud.chapter': '章节 {chapter}',
  'hud.soundOn': '声音 开', 'hud.soundOff': '声音 关', 'hud.deployment': '部署阶段', 'hud.assault': '敌袭进行中', 'hud.challenge': '挑战循环 {cycle}',
  'audio.music': '音乐', 'audio.sfx': '音效', 'audio.mute': '全部静音', 'audio.unmute': '恢复声音', 'audio.ready': '音频已就绪', 'audio.locked': '点击后启用音频',
  'build.title': '建造', 'build.cancel': '取消', 'build.locked': '未解锁', 'build.level': '等级 {level}', 'build.cost': '{cost} 资金',
  'tower.selected': '已选择防御塔', 'tower.upgrade': '升级', 'tower.sell': '出售', 'tower.max': '满级', 'tower.damage': '伤害', 'tower.range': '范围', 'tower.rate': '射速',
  'deployment.title': '部署防线', 'deployment.body': '移动角色并布置塔楼。准备完成后再开始第一波。', 'deployment.start': '开始第 1 波', 'deployment.seed': '地图种子 {seed}', 'deployment.totalWaves': '本关共 {total} 波',
  'wave.countdown': '{seconds} 秒后自动开始', 'wave.startNow': '立即开始', 'wave.preview': '下一波',
  'pause.kicker': '模拟已暂停', 'pause.title': '暂停', 'pause.resume': '继续', 'pause.restart': '重新开始本关', 'pause.menu': '返回主菜单',
  'clear.kicker': '区域已净化', 'clear.title': '第 {level} 关完成', 'clear.next': '进入下一关', 'clear.research': '前往研究所', 'clear.funds': '下关资金', 'clear.recycled': '塔楼回收', 'clear.reward': '关卡奖励',
  'defeat.kicker': '信号中断', 'defeat.title': '核心失守', 'defeat.retry': '重试本关', 'defeat.menu': '返回主菜单',
  'tutorial.kicker': '发现新型防御', 'tutorial.ack': '我知道了', 'tutorial.counter': '推荐克制：{tower}',
  'tutorial.armor-heavy.title': '重型装甲', 'tutorial.armor-heavy.body': '普通攻击几乎无效。使用棱镜炮击碎重甲。',
  'tutorial.armor-flux.title': '能量护盾', 'tutorial.armor-flux.body': '使用电弧塔释放能量，快速击穿护盾。',
  'tutorial.armor-crystal.title': '爆裂晶甲', 'tutorial.armor-crystal.body': '新星迫击炮的爆炸可以震碎晶体外壳。',
  'tutorial.armor-mystic.title': '魔法护甲', 'tutorial.armor-mystic.body': '寒霜信标能冻结并破坏魔法屏障。',
  'research.kicker': '永久成长', 'research.title': '霓虹研究所', 'research.chips': '可用芯片 {chips}', 'research.buy': '研究', 'research.owned': '已完成', 'research.locked': '塔未解锁', 'research.close': '返回',
  'research.damage': '强化核心', 'research.range': '扩展矩阵', 'research.cooldown': '超频协议', 'research.requires': '需要前置研究',
  'levelSelect.kicker': '战役档案', 'levelSelect.title': '选择已解锁关卡', 'levelSelect.close': '返回', 'levelSelect.locked': '未解锁', 'levelSelect.current': '当前',
  'notice.locked': '这座塔尚未解锁', 'notice.path': '不能建在敌人路径上', 'notice.range': '请移动到更近的位置', 'notice.energy': '资金不足', 'notice.built': '{tower} 已部署',
  'notice.levelClear': '关卡完成', 'notice.saved': '进度已保存', 'notice.language': '语言已切换', 'notice.armorBreak': '护甲破碎！',
  'cinematic.skip': '跳过动画', 'cinematic.replay': '重播通关动画', 'cinematic.phase.freeze': '最后的敌人已经倒下', 'cinematic.phase.cores': '五枚量子核心开始共鸣',
  'cinematic.phase.boss-break': '章节首领正在几何解体', 'cinematic.phase.core-flight': '量子核心正在接入基地', 'cinematic.phase.tower-reveal': '新防御协议已解锁', 'cinematic.phase.chapter-preview': '下一章节信号已锁定',
  'cinematic.phase.guardian': '霓虹守护者苏醒', 'cinematic.phase.salute': '所有防线向胜利致敬', 'cinematic.phase.launch': '黑暗被彻底击碎',
  'cinematic.phase.fireworks': '二十关的星光正在绽放',
  'victory.kicker': '战役完成', 'victory.title': '二十关全数守住', 'victory.challenge': '进入挑战模式', 'victory.menu': '返回主菜单', 'victory.levels': '完成关卡', 'victory.noLeaks': '零漏怪关卡', 'victory.research': '研究完成度', 'victory.mostUsed': '最常部署', 'victory.overclock': '终局超频已激活：所有防御塔获得强化',
  'only.zh.key': '中文回退',
};

const en = {
  'menu.eyebrow': 'TACTICAL NEON DEFENCE', 'menu.tagline': 'Move. Deploy. Evolve. Protect the last light.', 'menu.continue': 'CONTINUE', 'menu.new': 'NEW CAMPAIGN', 'menu.research': 'NEON LAB', 'menu.levelSelect': 'LEVEL SELECT',
  'menu.continueMeta': 'LEVEL {level} // BEST {cleared}', 'menu.newConfirm': 'Overwrite the current campaign progress?', 'menu.language': 'LANGUAGE', 'menu.online': 'SYSTEM // ONLINE',
  'hud.level': 'LEVEL {current} / {total}', 'hud.wave': 'WAVE {current} / {total}', 'hud.energy': 'FUNDS', 'hud.score': 'SCORE', 'hud.core': 'CORE INTEGRITY', 'hud.chips': 'CORE CHIPS', 'hud.chapter': 'CHAPTER {chapter}',
  'hud.soundOn': 'SOUND ON', 'hud.soundOff': 'SOUND OFF', 'hud.deployment': 'DEPLOYMENT', 'hud.assault': 'ASSAULT ACTIVE', 'hud.challenge': 'CHALLENGE LOOP {cycle}',
  'audio.music': 'MUSIC', 'audio.sfx': 'SFX', 'audio.mute': 'MUTE ALL', 'audio.unmute': 'UNMUTE ALL', 'audio.ready': 'AUDIO READY', 'audio.locked': 'AUDIO STARTS ON INTERACTION',
  'build.title': 'BUILD', 'build.cancel': 'CANCEL', 'build.locked': 'LOCKED', 'build.level': 'LEVEL {level}', 'build.cost': '{cost} FUNDS',
  'tower.selected': 'SELECTED DEFENCE', 'tower.upgrade': 'UPGRADE', 'tower.sell': 'SELL', 'tower.max': 'MAX LEVEL', 'tower.damage': 'DMG', 'tower.range': 'RANGE', 'tower.rate': 'RATE',
  'deployment.title': 'DEPLOY YOUR GRID', 'deployment.body': 'Move and arrange towers. Start Wave 1 when your defence is ready.', 'deployment.start': 'START WAVE 1', 'deployment.seed': 'MAP SEED {seed}', 'deployment.totalWaves': '{total} WAVES IN THIS LEVEL',
  'wave.countdown': 'AUTO START IN {seconds}s', 'wave.startNow': 'START NOW', 'wave.preview': 'NEXT WAVE',
  'pause.kicker': 'SIMULATION SUSPENDED', 'pause.title': 'PAUSED', 'pause.resume': 'RESUME', 'pause.restart': 'RESTART LEVEL', 'pause.menu': 'MAIN MENU',
  'clear.kicker': 'SECTOR PURIFIED', 'clear.title': 'LEVEL {level} COMPLETE', 'clear.next': 'NEXT LEVEL', 'clear.research': 'OPEN NEON LAB', 'clear.funds': 'NEXT FUNDS', 'clear.recycled': 'TOWER RECYCLE', 'clear.reward': 'LEVEL REWARD',
  'defeat.kicker': 'SIGNAL LOST', 'defeat.title': 'CORE BREACHED', 'defeat.retry': 'RETRY LEVEL', 'defeat.menu': 'MAIN MENU',
  'tutorial.kicker': 'NEW DEFENCE DETECTED', 'tutorial.ack': 'UNDERSTOOD', 'tutorial.counter': 'RECOMMENDED COUNTER: {tower}',
  'tutorial.armor-heavy.title': 'HEAVY PLATING', 'tutorial.armor-heavy.body': 'Ordinary damage barely works. Use the Prism Cannon to strip heavy armor.',
  'tutorial.armor-flux.title': 'FLUX SHIELD', 'tutorial.armor-flux.body': 'Use the Arc Coil to discharge and collapse its energy shield.',
  'tutorial.armor-crystal.title': 'CRYSTAL SHELL', 'tutorial.armor-crystal.body': 'Nova Mortar explosions fracture the crystal shell.',
  'tutorial.armor-mystic.title': 'MYSTIC WARD', 'tutorial.armor-mystic.body': 'Frost Beacons freeze and shatter the magical barrier.',
  'research.kicker': 'PERMANENT GROWTH', 'research.title': 'NEON LAB', 'research.chips': '{chips} CHIPS AVAILABLE', 'research.buy': 'RESEARCH', 'research.owned': 'COMPLETED', 'research.locked': 'TOWER LOCKED', 'research.close': 'BACK',
  'research.damage': 'CORE AMPLIFIER', 'research.range': 'RANGE MATRIX', 'research.cooldown': 'OVERCLOCK PROTOCOL', 'research.requires': 'PREREQUISITE REQUIRED',
  'levelSelect.kicker': 'CAMPAIGN ARCHIVE', 'levelSelect.title': 'SELECT AN UNLOCKED LEVEL', 'levelSelect.close': 'BACK', 'levelSelect.locked': 'LOCKED', 'levelSelect.current': 'CURRENT',
  'notice.locked': 'THIS TOWER IS LOCKED', 'notice.path': 'ENEMY PATH BLOCKED', 'notice.range': 'MOVE CLOSER TO BUILD', 'notice.energy': 'NOT ENOUGH FUNDS', 'notice.built': '{tower} DEPLOYED',
  'notice.levelClear': 'LEVEL CLEARED', 'notice.saved': 'PROGRESS SAVED', 'notice.language': 'LANGUAGE CHANGED', 'notice.armorBreak': 'ARMOR SHATTERED!',
  'cinematic.skip': 'SKIP CINEMATIC', 'cinematic.replay': 'REPLAY FINALE', 'cinematic.phase.freeze': 'The final hostile has fallen', 'cinematic.phase.cores': 'Five Quantum Cores resonate',
  'cinematic.phase.boss-break': 'Chapter boss disintegrating', 'cinematic.phase.core-flight': 'Quantum Core installing', 'cinematic.phase.tower-reveal': 'New defence protocols unlocked', 'cinematic.phase.chapter-preview': 'Next chapter signal acquired',
  'cinematic.phase.guardian': 'The Neon Guardian awakens', 'cinematic.phase.salute': 'Every defence salutes the victory', 'cinematic.phase.launch': 'The dark canopy is shattered',
  'cinematic.phase.fireworks': 'Twenty levels ignite across the sky',
  'victory.kicker': 'CAMPAIGN COMPLETE', 'victory.title': 'ALL TWENTY LEVELS SECURED', 'victory.challenge': 'ENTER CHALLENGE MODE', 'victory.menu': 'MAIN MENU', 'victory.levels': 'LEVELS CLEARED', 'victory.noLeaks': 'NO-LEAK CLEARS', 'victory.research': 'RESEARCH COMPLETE', 'victory.mostUsed': 'MOST DEPLOYED', 'victory.overclock': 'FINAL OVERCLOCK ACTIVE: ALL DEFENCES ENHANCED',
};

const enemyText = {
  grunt: ['向量体', 'Vector'], runner: ['故障体', 'Glitch'], swarm: ['比特群', 'Bit Swarm'], tank: ['封锁体', 'Blockade'], shield: ['神盾', 'Aegis'],
  juggernaut: ['重装体', 'Ironclad'], aegis: ['通量神盾', 'Flux Aegis'], crystal: ['晶甲兽', 'Shardback'], mystic: ['帷幕行者', 'Veil Walker'],
  healer: ['修复者', 'Mender'], splitter: ['分形体', 'Fractal'], disruptor: ['干扰者', 'Jammer'],
  'boss-overdrive': ['超驱领主', 'Overdrive'], 'boss-twin': ['双子守卫', 'Twin Warden'], 'boss-hydra': ['水晶九头蛇', 'Crystal Hydra'],
  'boss-tyrant': ['帷幕暴君', 'Veil Tyrant'], 'boss-null': ['虚无构筑者', 'Null Architect'],
};
for (const [type, [zhName, enName]] of Object.entries(enemyText)) {
  zh[`enemy.${type}`] = zhName;
  en[`enemy.${type}`] = enName;
}

const towerText = {
  pulse: ['脉冲尖塔', '高速单体攻击', 'Pulse Spire', 'Rapid single-target fire'], prism: ['棱镜炮', '重击与重甲破坏', 'Prism Cannon', 'Heavy damage and armor break'],
  arc: ['电弧线圈', '连锁闪电与护盾克制', 'Arc Coil', 'Chain lightning and shield counter'], nova: ['新星迫击炮', '范围爆炸与晶甲破坏', 'Nova Mortar', 'Splash damage and crystal counter'],
  frost: ['寒霜信标', '范围减速与魔甲破坏', 'Frost Beacon', 'Area slow and mystic counter'], gravity: ['重力井', '聚集并减速敌群', 'Gravity Well', 'Group and slow crowds'],
  solar: ['太阳长矛', '直线穿透与反治疗', 'Solar Lance', 'Piercing anti-heal beam'], drone: ['无人机蜂巢', '跨路线快速支援', 'Drone Hive', 'Cross-route response'],
  corrosion: ['腐蚀熔炉', '通用护甲侵蚀', 'Corrosion Forge', 'Universal armor erosion'], relay: ['共振中继', '强化附近防御塔', 'Resonance Relay', 'Boost nearby towers'],
  rift: ['裂隙之门', '将敌人送回前方', 'Rift Gate', 'Roll enemies backward'], quantum: ['量子分流器', '复制攻击到多路线', 'Quantum Splitter', 'Copy attacks across routes'],
  singularity: ['奇点炮', '终局范围重炮', 'Singularity Cannon', 'Endgame boss artillery'],
};
for (const [type, [zhName, zhRole, enName, enRole]] of Object.entries(towerText)) {
  zh[`tower.${type}.name`] = zhName; zh[`tower.${type}.role`] = zhRole;
  en[`tower.${type}.name`] = enName; en[`tower.${type}.role`] = enRole;
}

export const TRANSLATIONS = Object.freeze({ 'zh-CN': Object.freeze(zh), en: Object.freeze(en) });

export function normalizeLanguage(value) { return value === 'en' ? 'en' : 'zh-CN'; }

function interpolate(value, variables) {
  return value.replace(/\{(\w+)\}/g, (_, key) => String(variables[key] ?? `{${key}}`));
}

export function createI18n(initialLanguage, storage = null) {
  let language = normalizeLanguage(initialLanguage ?? storage?.getItem?.(LANGUAGE_KEY));
  const api = {
    get language() { return language; },
    t(key, variables = {}) {
      const value = TRANSLATIONS[language][key] ?? TRANSLATIONS['zh-CN'][key] ?? key;
      return interpolate(value, variables);
    },
    setLanguage(next) {
      language = normalizeLanguage(next);
      try { storage?.setItem?.(LANGUAGE_KEY, language); } catch { /* storage is optional */ }
      return language;
    },
  };
  return api;
}
