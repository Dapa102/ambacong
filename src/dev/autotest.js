const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const log = (ok, name, detail = '') => {
  console.log(`[AUTOTEST] ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const hold = async (code, ms) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code }));
  await sleep(ms);
  window.dispatchEvent(new KeyboardEvent('keyup', { code }));
};

const closeNews = () => document.getElementById('news-close-button')?.click();

export const runAutotest = async (g) => {
  await sleep(600);
  const results = [];

  const assert = (ok, name, detail = '') => results.push([ok, name, detail]);

  log(true, 'bootstrap', `state=${g.state()}`);

  await g.newGame();
  await sleep(400);
  assert(g.state() === 'playing', 'new-game starts playing', `state=${g.state()}`);
  assert(g.phase() === 'wake', 'phase=wake', g.phase());
  assert(g.area() === 'Kamar Kost', 'area=Kamar Kost', g.area());

  const startPos = g.pos();
  await hold('KeyD', 2000);
  const moved = g.pos();
  assert(Math.abs(moved.x - startPos.x) > 0.4, 'strafe moves player', `${startPos.x.toFixed(2)} -> ${moved.x.toFixed(2)}`);

  assert(g.lampOn(), 'all four house lights stay on');

  await g.aimAt(-0.35, 2.15, -1.18, 2.15, 1.15);
  await g.interact();
  await sleep(200);
  assert(g.doorOpen('bathroom-door'), 'bathroom door opens');
  await g.aimAt(-2.0, 2.6, -2.0, 1.6, 1.2);
  await g.interact();
  await sleep(200);
  assert(!g.doorOpen('bathroom-door'), 'bathroom door closes');

  await g.aimAt(3.7, 5.15, 3.7, 6.03, 1.4);
  await g.interact();
  await sleep(400);
  assert(g.newsOpen(), 'computer opens news');
  closeNews();
  await sleep(200);
  assert(g.phase() === 'laptop', 'news close -> phase=laptop', g.phase());

  await g.teleport(0, 4.15, Math.PI);
  await sleep(300);
  await g.interact();
  await sleep(200);
  assert(g.dialogOpen(), 'kost door locked before phone answered');
  assert(g.phase() === 'laptop', 'phase stays laptop when door locked', g.phase());
  await hold('Enter', 30);
  await sleep(100);
  assert(!g.dialogOpen(), 'locked-door dialog can be dismissed');

  await g.aimAt(4.5, -3.6, 6.1, -3.6, 1.2);
  await g.interact();
  await sleep(200);
  assert(g.tvOn(), 'tv turns on');
  await g.interact();
  await sleep(200);
  assert(!g.tvOn(), 'tv turns off');

  await g.aimAt(2.55, 5.15, 2.55, 6.04, 1.2);
  await g.interact();
  await sleep(300);
  assert(g.dialogOpen(), 'phone opens dialog');
  for (let i = 0; i < 9; i++) {
    await hold('Enter', 30);
    await sleep(40);
  }
  assert(g.phase() === 'phone', 'dialog done -> phase=phone', g.phase());

  await g.teleport(0, 4.15, Math.PI);
  await sleep(300);
  await g.interact();
  await sleep(1200);
  assert(g.phase() === 'outside', 'leave kost -> phase=outside', g.phase());
  assert(g.area() === 'Halaman Rumah Sakit', 'area=hospital courtyard', g.area());

  await g.teleport(-12.4, 17.1, 0);
  await sleep(300);
  await g.interact();
  await sleep(1200);
  assert(g.phase() === 'inside', 'side-entry -> phase=inside', g.phase());
  assert(g.area() === 'Lobby', 'inside -> area=Lobby', g.area());

  await g.pressKey('KeyM');
  await sleep(200);
  assert(g.mapOpen(), 'M opens map');
  await g.pressKey('KeyM');
  await sleep(200);
  assert(!g.mapOpen(), 'M closes map');

  await g.pressKey('Tab');
  await sleep(300);
  assert(g.invOpen(), 'Tab opens inventory');
  await g.pressKey('Tab');
  await sleep(200);
  assert(!g.invOpen(), 'Tab closes inventory');

  await g.aimAt(-9.2, 3.2, -9.2, 4, 0.6);
  await g.interact();
  await sleep(300);
  assert(g.has('battery'), 'battery 1 picked up');
  if (g.dialogOpen()) await hold('Enter', 30);

  await g.teleport(6, 4.2, Math.PI);
  await sleep(300);
  await g.pressKey('KeyE');
  await sleep(300);
  assert(g.hidden(), 'hide in locker');
  await g.pressKey('KeyE');
  await sleep(200);
  assert(!g.hidden(), 'exit hide');

  await g.teleport(4.15, -10.4, 0);
  await sleep(300);
  await g.interact();
  await sleep(500);
  assert(g.floor() === 2, 'stairs-up -> floor 2', `floor=${g.floor()}`);
  assert(g.area() === 'Lantai 2 - Koridor', 'floor2 area=Koridor', g.area());

  await g.aimAt(-8.5, -50.5, -9, -50.5, 0.75);
  await g.pressKey('KeyF');
  await g.interact();
  await sleep(300);
  assert(g.has('key-janitor'), 'gold key picked up on floor 2');
  assert(g.pocongVisible(), 'pocong visible after key');
  if (g.dialogOpen()) {
    await hold('Enter', 30);
    await sleep(40);
    await hold('Enter', 30);
  }

  await g.aimAt(8.8, -36.9, 8.8, -37.5, 0.6);
  await g.interact();
  await sleep(300);
  assert(g.countBattery() === 2, 'battery 2 picked up', `count=${g.countBattery()}`);
  if (g.dialogOpen()) await hold('Enter', 30);

  await g.teleport(4.15, -53.4, 0);
  await sleep(300);
  await g.interact();
  await sleep(500);
  assert(g.floor() === 1, 'stairs-down -> floor 1', `floor=${g.floor()}`);

  await g.teleport(0, -15.6, 0);
  await sleep(300);
  await g.pressKey('KeyE');
  await sleep(600);
  assert(g.phase() === 'complete', 'exit door -> phase=complete', `phase=${g.phase()}`);
  assert(g.completeOpen(), 'complete screen shown');

  document.getElementById('complete-menu-button')?.click();
  await sleep(300);
  assert(g.state() === 'menu', 'complete -> back to menu', `state=${g.state()}`);

  let passed = 0;
  for (const [ok, name, detail] of results) {
    log(ok, name, detail);
    if (ok) passed++;
  }
  log(passed === results.length, 'ALL', `${passed}/${results.length} checks passed`);
  log(true, 'final-state', JSON.stringify({ state: g.state(), phase: g.phase(), floor: g.floor() }));
};
