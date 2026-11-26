/* 건설기술 탐험대 v3 · 2차시 미션 (현장 · 재난 · 미래도시 · 최종 재건) */
(() => {
  const V3 = window.V3, el = V3.el, img = V3.img, MS = V3.missions;
  const A = (k) => (window.__ASSETS__ && window.__ASSETS__[k]) || k;

  // ---------------------------------------------------------------
  // 현장 1 · 철근콘크리트 보 실험
  // ---------------------------------------------------------------
  MS.materialsLog = (c, done) => {
    const api = V3.frame(c, { id: 'materialsLog', badge: '현장 · 건설 재료', title: '철근콘크리트 보 실험', guide: '① <b>보 누르기</b>를 꾹 눌러 보가 휘는 모습을 봐요. ② 철근을 넣을 자리를 고르고 다시 눌러 금이 가는지 확인해요.' }, done);
    const stage = el('div', 'v3-stage'); api.body.appendChild(stage);
    const board = V3.board(stage, 600 / 260);
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 600 260"><rect width="600" height="260" fill="#fffdf7"/>
      <polygon points="70,200 100,240 40,240" fill="#a99f86"/><polygon points="530,200 560,240 500,240" fill="#a99f86"/>
      <path data-k="beam" d="" fill="#c9c4b8" stroke="#6b6672" stroke-width="2"/>
      <g data-k="top"></g><g data-k="bot"></g><path data-k="bar" d="" stroke="#c4533d" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g data-k="crack" opacity="0" stroke="#2a2833" stroke-width="3" fill="none"><path d="M290,198 l6,-14 l-5,-10 l6,-12"/><path d="M320,198 l-5,-12 l6,-9"/></g>
      <g data-k="push" opacity="0"><path d="M300,40 V88" stroke="#3f7fa8" stroke-width="6"/><polygon points="288,84 312,84 300,100" fill="#3f7fa8"/></g>
      <text data-k="t1" x="300" y="70" font-size="15" text-anchor="middle" font-weight="800" fill="#3f7fa8" opacity="0">윗면: 눌려서 줄어요 (압축)</text>
      <text data-k="t2" x="300" y="236" font-size="15" text-anchor="middle" font-weight="800" fill="#e0802a" opacity="0">아랫면: 당겨져 늘어나요 (인장) → 콘크리트는 여기서 금이 가요</text></svg>`;
    const q = (k) => board.querySelector(`[data-k=${k}]`);
    let rebar = null, step = 1, sag = 0, holding = false, testedBare = false;
    const yOf = (x, off) => { const t = (x - 70) / 460; return off + sag * 4 * t * (1 - t); };
    const draw = () => {
      let top = 'M70,110', bot = '';
      for (let x = 70; x <= 530; x += 20) top += ` L${x},${yOf(x, 110)}`;
      for (let x = 530; x >= 70; x -= 20) bot += ` L${x},${yOf(x, 200)}`;
      q('beam').setAttribute('d', top + bot + 'Z');
      let ts = '', bs = ''; for (let i = 0; i < 12; i++) { const x = 100 + i * 36, sq = sag / 40; ts += `<line x1="${x - 8 + sq * (x < 300 ? 3 : -3)}" y1="${yOf(x, 118)}" x2="${x + 8 - sq * (x < 300 ? -3 : 3)}" y2="${yOf(x, 118)}" stroke="#3f7fa8" stroke-width="3" opacity="${sag ? 1 : 0}"/>`; bs += `<line x1="${x - 8 - sq * 4}" y1="${yOf(x, 192)}" x2="${x + 8 + sq * 4}" y2="${yOf(x, 192)}" stroke="#e0802a" stroke-width="3" opacity="${sag ? 1 : 0}"/>`; }
      q('top').innerHTML = ts; q('bot').innerHTML = bs;
      if (rebar) { const off = { top: 125, mid: 155, bot: 185 }[rebar]; let d = `M80,${yOf(80, off)}`; for (let x = 100; x <= 520; x += 20) d += ` L${x},${yOf(x, off)}`; q('bar').setAttribute('d', d); } else q('bar').setAttribute('d', '');
      q('push').setAttribute('opacity', holding ? 1 : 0); q('t1').setAttribute('opacity', sag > 20 ? 1 : 0); q('t2').setAttribute('opacity', sag > 20 ? 1 : 0);
    };
    const tick = () => { if (!board.isConnected) return; sag = holding ? Math.min(28, sag + 1.2) : Math.max(0, sag - 2); draw(); if (holding && sag >= 28) release(); requestAnimationFrame(tick); };
    const release = () => {
      if (!holding) return; holding = false;
      if (sag < 20) return;
      if (step === 1) { q('crack').setAttribute('opacity', 1); testedBare = true; step = 2; api.progress(1, 2); api.hint('콘크리트만 있는 보는 <b>아랫면</b>에서 금이 갔어요. 이제 철근을 넣을 자리를 골라 보세요.'); pick.style.display = ''; return; }
      if (!rebar) { api.hint('먼저 철근 자리를 골라 주세요.'); return; }
      if (rebar !== 'bot') { q('crack').setAttribute('opacity', 1); api.wrong(rebar === 'top' ? '윗면은 눌리는 곳이라 콘크리트가 잘 버텨요. 당겨지는 곳에 철근이 필요해요.' : '가운데는 힘을 거의 받지 않아요. 금이 간 곳을 다시 보세요.', pick.querySelector('[data-r=bot]')); return; }
      q('crack').setAttribute('opacity', 0); api.progress(2, 2); api.good('금이 가지 않아요! 당겨지는 아랫면을 철근이 붙잡아 줘요.'); api.finish('철근을 알맞은 자리에 넣었어요!');
    };
    const ctrl = el('div', 'v3-row'); api.body.appendChild(ctrl);
    const press = el('button', 'v3-btn primary', '✋ 보 누르기 (꾹)'); press.type = 'button'; press.style.touchAction = 'none'; ctrl.appendChild(press);
    press.addEventListener('pointerdown', (e) => { e.preventDefault(); if (step === 2) q('crack').setAttribute('opacity', 0); holding = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => press.addEventListener(ev, release));
    const pick = el('div', 'v3-row', '<span class="v3-small">철근 넣을 자리:</span>'); pick.style.display = 'none'; ctrl.appendChild(pick);
    [['top', '위'], ['mid', '가운데'], ['bot', '아래']].forEach(([id, t]) => { const b = el('button', 'v3-btn', t); b.type = 'button'; b.dataset.r = id; b.addEventListener('click', () => { rebar = id; q('crack').setAttribute('opacity', 0); pick.querySelectorAll('.v3-btn').forEach(x => x.classList.toggle('on', x === b)); draw(); api.hint('철근을 넣었어요. 다시 보를 꾹 눌러 보세요.'); }); pick.appendChild(b); });
    api.progress(0, 2); draw(); requestAnimationFrame(tick);
  };

  // ---------------------------------------------------------------
  // 현장 2 · 현장 장비 배치
  // ---------------------------------------------------------------
  MS.equipmentLog = (c, done) => {
    const api = V3.frame(c, { id: 'equipmentLog', badge: '현장 · 건설 장비', title: '현장 장비 배치', guide: '공사 현장의 <b>작업 자리 4곳</b>에 알맞은 장비를 끌어다 놓아요. 맞으면 장비가 일을 시작해요.', side: true }, done);
    const eq = [['dig', '굴착기', 'assets/drawings/equip-excavator.png', '땅 파기', 14, 50], ['roll', '로드롤러', 'assets/drawings/equip-roller.png', '흙 다지기', 40, 80], ['pump', '콘크리트 펌프카', img('equip/pumpcar.webp'), '콘크리트 보내기', 52, 52], ['crane', '타워크레인', 'assets/drawings/equip-crane.png', '자재 들어 올리기', 84, 36]];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); split.appendChild(stage);
    const board = V3.board(stage, 16 / 9); board.innerHTML = `<img class="v3-img" src="${img('site/work-yard.webp')}" style="width:100%;height:100%" alt="">`;
    const slots = {}; eq.forEach(([id, , , job, x, y]) => { const s = V3.slotAt(board, id, x, y, 20, 16, `<span style="font-size:12.5px">${job}</span>`); s.style.background = 'rgba(255,243,223,.9)'; slots[id] = s; });
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(eq).forEach(([id, n, p]) => tray.appendChild(V3.cardEl(id, n, p.startsWith('assets/v3') ? p : A(p))));
    const why = { dig: '땅을 파는 일은 큰 삽(버킷)이 달린 장비가 해요.', roll: '무거운 바퀴로 땅을 꾹꾹 눌러 다지는 장비예요.', pump: '긴 팔(붐)로 콘크리트를 원하는 곳까지 보내요.', crane: '높은 곳까지 무거운 자재를 들어 올리는 장비예요.' };
    let n = 0; api.progress(0, 4);
    V3.placer(api.wrap, (card, slot) => {
      if (slot.classList.contains('filled')) return;
      if (card.dataset.card !== slot.dataset.slot) { V3.bounce(card); api.wrong(why[slot.dataset.slot], [...tray.children].find(k => k.dataset.card === slot.dataset.slot)); return; }
      const e = eq.find(x => x[0] === card.dataset.card); card.classList.add('used'); slot.classList.add('filled');
      slot.innerHTML = `<img src="${card.querySelector('img').src}" style="width:100%;height:100%;object-fit:contain;animation:v3sway 1s ease-in-out infinite;--amp:2px" alt=""><span class="v3-tip" style="top:-14px">${e[1]} 작업 중</span>`;
      api.progress(++n, 4); api.good(`${e[1]}: ${e[3]}!`);
      if (n === 4) api.finish('모든 장비가 알맞은 일을 시작했어요!');
    });
  };

  // ---------------------------------------------------------------
  // 현장 3 · 건물 쌓아 올리기 (건설 과정 → 시공 순서)
  // ---------------------------------------------------------------
  MS.processLog = (c, done) => {
    const api = V3.frame(c, { id: 'processLog', badge: '현장 · 건설 과정', title: '건물 쌓아 올리기', guide: '1단계: 건설의 큰 흐름 카드 4장을 순서대로 놓아요.' }, done);
    const big = [['plan', '기획', '무엇을 왜 지을지 정해요'], ['design', '설계', '도면을 그려요'], ['build', '시공', '실제로 지어요'], ['keep', '유지관리', '점검하고 고쳐요']];
    const work = [['temp', '가설 공사', '울타리·임시 사무실을 세워요'], ['earth', '토공사(터파기)', '땅을 파요'], ['found', '기초 공사', '기초를 만들어요'], ['frame', '골조 공사', '기둥·보·바닥을 세워요'], ['finish', '마감 공사', '벽·창·칠을 마무리해요']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); stage.style.gap = '8px'; stage.style.alignItems = 'stretch'; split.appendChild(stage);
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    let phase = 1, n = 0, slots = [];
    const pic = el('div'); pic.style.cssText = 'flex:1.1;min-width:0;display:none';
    const col = el('div', 'v3-col'); col.style.cssText = 'flex:1;min-width:0;justify-content:center';
    stage.appendChild(pic); stage.appendChild(col);
    const setup = (list) => {
      col.innerHTML = ''; tray.innerHTML = ''; n = 0;
      slots = list.map((it, i) => { const s = el('div', 'v3-slot', `${i + 1}`); s.dataset.slot = i; s.style.minHeight = '34px'; s.style.flex = '1'; col.appendChild(s); return s; });
      V3.shuffle(list).forEach(([id, t, d]) => tray.appendChild(V3.cardEl(id, `${t}<br><small style="font-weight:600;color:var(--muted)">${d}</small>`)));
    };
    const layers = { temp: '<rect x="10" y="150" width="8" height="40" fill="#5d8aa8"/><rect x="182" y="150" width="8" height="40" fill="#5d8aa8"/><rect x="10" y="150" width="180" height="6" fill="#5d8aa8"/>', earth: '<path d="M40,190 h120 v14 h-120z" fill="#8f7c55"/>', found: '<rect x="44" y="180" width="112" height="14" fill="#9a958a"/>', frame: '<g fill="#b8b2a5"><rect x="52" y="80" width="8" height="100"/><rect x="96" y="80" width="8" height="100"/><rect x="140" y="80" width="8" height="100"/><rect x="48" y="78" width="104" height="8"/><rect x="48" y="128" width="104" height="8"/></g>', finish: '<rect x="56" y="86" width="88" height="94" fill="#e9dfc9"/><rect x="64" y="96" width="20" height="18" fill="#9cc5dc"/><rect x="116" y="96" width="20" height="18" fill="#9cc5dc"/><rect x="64" y="142" width="20" height="18" fill="#9cc5dc"/><rect x="90" y="150" width="20" height="30" fill="#7a5a3a"/><polygon points="44,80 100,50 156,80" fill="#b85c3c"/>' };
    const drawB = (tilt) => { pic.innerHTML = `<svg class="v3-svg" viewBox="0 0 200 220"><rect width="200" height="220" fill="#eaf2f5"/><rect y="190" width="200" height="30" fill="#b9a77f"/><g style="transform-origin:100px 190px;transition:transform .5s;transform:rotate(${tilt || 0}deg)">${work.slice(0, n).map(w => layers[w[0]]).join('')}</g></svg>`; };
    setup(big); api.progress(0, 9);
    V3.placer(api.wrap, (card, slot) => {
      const list = phase === 1 ? big : work, i = list.findIndex(x => x[0] === card.dataset.card), want = +slot.dataset.slot;
      if (slot.classList.contains('filled')) return;
      if (want !== n) { V3.bounce(card); api.wrong('위에서부터 차례로 채워요.', slots[n]); return; }
      if (i !== want) {
        V3.bounce(card);
        if (phase === 2) { drawB(8); setTimeout(() => drawB(0), 900); }
        api.wrong(phase === 1 ? `${V3.j(list[i][1],'은')} 지금 할 단계가 아니에요. 무엇을 먼저 해야 다음 일을 할 수 있을까요?` : `${V3.j(list[i][1],'을')} 지금 하면 건물이 기울어요. ${n ? list[n - 1][1] + ' 다음에 할 일을 찾아보세요.' : '공사장을 안전하게 둘러싸는 일부터 해요.'}`, [...tray.children].find(k => k.dataset.card === list[want][0]));
        return;
      }
      card.classList.add('used'); slot.classList.add('filled'); slot.innerHTML = `<b>${list[i][1]}</b>`; n++;
      api.progress((phase === 1 ? 0 : 4) + n, 9); api.good(`${list[i][1]}: ${list[i][2]}`);
      if (phase === 2) drawB(0);
      if (phase === 1 && n === 4) {
        setTimeout(() => { phase = 2; api.guide('2단계: 이제 <b>시공</b> 단계예요. 공사 순서대로 카드를 놓으면 건물이 한 층씩 올라가요.'); pic.style.display = ''; setup(work); drawB(0); api.hint('빈 땅이에요. 무엇부터 할까요?'); }, 700);
      } else if (phase === 2 && n === 5) api.finish('건물을 순서대로 완성했어요!');
    });
  };

  // ---------------------------------------------------------------
  // 재난 1 · 홍수 막기 실험
  // ---------------------------------------------------------------
  MS.floodMark = (c, done) => {
    const api = V3.frame(c, { id: 'floodMark', badge: '재난 · 홍수 방재', title: '홍수 막기 실험', guide: '방재 시설을 <b>2개까지</b> 고르고 비 막대를 끝까지 올려요. 강물이 마을로 넘치지 않으면 성공이에요.' }, done);
    const fac = [['levee', '🧱 제방 높이기', '둑을 높여 물이 넘지 않게', 2], ['pond', '🟦 저류지', '넘치는 물을 잠시 모아 두기', 2], ['wet', '🌿 강변 습지', '물을 머금고 천천히 흘려보내기', 1.5], ['pump', '⚙️ 배수 펌프장', '마을에 고인 물을 강으로 퍼내기', 1]];
    const stage = el('div', 'v3-stage'); api.body.appendChild(stage);
    const board = V3.board(stage, 600 / 270);
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 600 270"><rect width="600" height="270" fill="#eaf2f5"/>
      <g data-k="rain" opacity="0" stroke="#5d8aa8" stroke-width="2">${Array.from({ length: 30 }, (_, i) => `<line x1="${i * 20 + 5}" y1="${(i * 37) % 60}" x2="${i * 20}" y2="${(i * 37) % 60 + 14}"/>`).join('')}</g>
      <path d="M0,150 L150,150 L190,160 L230,250 L370,250 L410,160 L450,150 L600,150 L600,270 L0,270z" fill="#b9a77f"/>
      <rect data-k="water" x="0" y="250" width="600" height="20" fill="#5d8aa8" opacity=".8"/>
      <rect data-k="leveeL" x="168" y="150" width="20" height="0" fill="#8f7c55"/><rect data-k="leveeR" x="412" y="150" width="20" height="0" fill="#8f7c55"/>
      <g data-k="pond" opacity="0"><path d="M455,150 h80 v18 h-80z" fill="#9cc5dc"/><text x="495" y="185" font-size="12" text-anchor="middle" fill="#3f5f7a">저류지</text></g>
      <g data-k="wet" opacity="0" fill="#6f9a4a"><circle cx="200" cy="168" r="6"/><circle cx="212" cy="190" r="6"/><circle cx="398" cy="170" r="6"/><circle cx="388" cy="192" r="6"/></g>
      <g data-k="pump" opacity="0"><rect x="110" y="122" width="26" height="28" fill="#6b6672"/><text x="123" y="117" font-size="11" text-anchor="middle" fill="#2a2833">펌프</text></g>
      <g><rect x="20" y="118" width="34" height="32" fill="#e9dfc9" stroke="#8b7f66"/><polygon points="16,120 37,100 58,120" fill="#b85c3c"/><rect x="66" y="124" width="28" height="26" fill="#e9dfc9" stroke="#8b7f66"/><polygon points="62,126 80,110 98,126" fill="#b85c3c"/><text x="60" y="170" font-size="13" font-weight="800" text-anchor="middle">마을</text></g>
      <rect data-k="flood" x="0" y="150" width="190" height="0" fill="#5d8aa8" opacity=".6"/>
      <line x1="150" y1="150" x2="450" y2="150" stroke="#c4533d" stroke-dasharray="6 5"/><text x="300" y="144" font-size="12" text-anchor="middle" fill="#c4533d">둑 높이</text></svg>`;
    const q = (k) => board.querySelector(`[data-k=${k}]`);
    const ctrl = el('div', 'v3-row'); api.body.appendChild(ctrl);
    const chosen = new Set();
    const btns = fac.map(([id, t, d]) => { const b = el('button', 'v3-btn', `${t}<br><small style="font-weight:600">${d}</small>`); b.type = 'button'; b.style.lineHeight = '1.25'; b.addEventListener('click', () => { if (chosen.has(id)) chosen.delete(id); else { if (chosen.size >= 2) { api.hint('예산이 2개까지예요. 하나를 빼고 골라 주세요.'); return; } chosen.add(id); } b.classList.toggle('on', chosen.has(id)); update(); }); ctrl.appendChild(b); return b; });
    const rw = el('label', 'v3-col', '<span class="v3-small">☔ 비의 양</span>'); rw.style.cssText += 'min-width:180px;flex:1'; ctrl.appendChild(rw);
    const range = el('input', 'v3-range'); range.type = 'range'; range.min = 0; range.max = 100; range.value = 0; rw.appendChild(range);
    const val = (id) => fac.find(f => f[0] === id)[3];
    function update() {
      const r = +range.value / 100, bank = 6 + (chosen.has('levee') ? 2 : 0), reduce = [...chosen].filter(x => x !== 'levee').reduce((s, x) => s + val(x), 0);
      const level = Math.max(0, r * 9 - reduce * r); // 0~9 단위
      q('leveeL').setAttribute('height', chosen.has('levee') ? 18 : 0); q('leveeL').setAttribute('y', chosen.has('levee') ? 132 : 150); q('leveeR').setAttribute('height', chosen.has('levee') ? 18 : 0); q('leveeR').setAttribute('y', chosen.has('levee') ? 132 : 150);
      ['pond', 'wet', 'pump'].forEach(k => q(k).setAttribute('opacity', chosen.has(k) ? 1 : 0));
      q('rain').setAttribute('opacity', r);
      const y = 250 - Math.min(level, bank + 1) * (100 / 6) * (level > bank ? 1 : 1);
      q('water').setAttribute('y', Math.max(110, y)); q('water').setAttribute('height', 270 - Math.max(110, y));
      const over = level > bank;
      q('flood').setAttribute('height', over ? 22 : 0); q('flood').setAttribute('y', over ? 128 : 150);
      return { over, r };
    }
    let lock = false; api.progress(0, 1);
    range.addEventListener('input', () => {
      if (lock) return; const { over, r } = update();
      if (over) { lock = true; api.wrong(chosen.size < 2 ? '시설이 부족해서 왼쪽 둑을 넘어 마을이 잠겼어요. 시설을 2개 골라 보세요.' : '물이 왼쪽 둑을 넘어 마을로 들어왔어요. 둑을 높이거나 물을 모아 두는 시설을 함께 써 보세요.', btns[0]); setTimeout(() => { range.value = 0; update(); lock = false; }, 1500); return; }
      if (r >= 1 && chosen.size === 2) { lock = true; range.disabled = true; btns.forEach(b => b.disabled = true); api.progress(1, 1); api.good('큰비에도 마을이 안전해요! 방재 시설이 함께 물을 막았어요.'); api.finish('홍수를 막았어요!'); }
      else if (r >= 1) api.hint('시설을 하나 더 고를 수 있어요.');
    });
    update();
  };

  // ---------------------------------------------------------------
  // 재난 2 · 지진 흔들기 실험 (내진 · 제진 · 면진)
  // ---------------------------------------------------------------
  MS.inspectionGap = (c, done) => {
    const api = V3.frame(c, { id: 'inspectionGap', badge: '재난 · 지진 대비', title: '지진 흔들기 실험', guide: '건물마다 적힌 <b>방법</b>을 읽고 알맞은 장치를 끼워요. 그다음 <b>지진 시작</b>을 눌러 흔들림을 비교해요.', side: true }, done);
    const kinds = [['brace', '내진', 'X자 가새', '구조를 튼튼하게 해서 버텨요'], ['damper', '제진', '흔들림 흡수 장치', '흔들림을 흡수해 줄여요'], ['rubber', '면진', '고무 받침', '땅의 흔들림이 덜 전해지게 해요']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); split.appendChild(stage);
    const board = V3.board(stage, 640 / 300);
    const bld = (x, id, label) => `<g data-b="${id}" style="transform-origin:${x + 45}px 260px"><rect x="${x}" y="90" width="90" height="170" fill="#e9dfc9" stroke="#8b7f66" stroke-width="2"/><rect x="${x}" y="145" width="90" height="4" fill="#8b7f66"/><rect x="${x}" y="200" width="90" height="4" fill="#8b7f66"/><g data-dev="${id}"></g><text x="${x + 45}" y="82" font-size="15" font-weight="900" text-anchor="middle" fill="#2a2833">${label}</text></g>`;
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 640 300"><rect width="640" height="300" fill="#eaf2f5"/><rect data-k="ground" y="262" width="640" height="38" fill="#b9a77f"/>${bld(20, 'none', '보강 없음')}${bld(180, 'brace', '내진')}${bld(340, 'damper', '제진')}${bld(500, 'rubber', '면진')}</svg>`;
    const slots = {}; kinds.forEach(([id, , , d], i) => { const s = V3.slotAt(board, id, 28 + i * 25, 42, 14, 24, `<span style="font-size:11px">${d}</span>`); s.style.background = 'rgba(255,243,223,.92)'; slots[id] = s; });
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(kinds).forEach(([id, , n]) => tray.appendChild(V3.cardEl(id, n)));
    const dev = { brace: (x) => `<path d="M${x},90 L${x + 90},260 M${x + 90},90 L${x},260" stroke="#3f7fa8" stroke-width="5"/>`, damper: (x) => `<rect x="${x + 35}" y="160" width="20" height="36" fill="#d9822b" rx="4"/><path d="M${x + 45},149 V160 M${x + 45},196 V200" stroke="#2a2833" stroke-width="3"/>`, rubber: (x) => `<rect x="${x + 6}" y="256" width="18" height="10" fill="#2a2833" rx="3"/><rect x="${x + 66}" y="256" width="18" height="10" fill="#2a2833" rx="3"/>` };
    const xs = { brace: 180, damper: 340, rubber: 500 };
    let n = 0; api.progress(0, 4);
    V3.placer(api.wrap, (card, slot) => {
      if (slot.classList.contains('filled')) return;
      const k = kinds.find(x => x[0] === card.dataset.card);
      if (card.dataset.card !== slot.dataset.slot) { V3.bounce(card); const want = kinds.find(x => x[0] === slot.dataset.slot); api.wrong(`'${want[3]}' 방법에는 ${V3.j(want[2],'이')} 어울려요. ${V3.j(k[2],'은')} ${k[1]} 장치예요.`, [...tray.children].find(t => t.dataset.card === slot.dataset.slot)); return; }
      card.classList.add('used'); slot.classList.add('filled'); slot.style.display = 'none'; board.querySelector(`[data-dev=${k[0]}]`).innerHTML = dev[k[0]](xs[k[0]]);
      api.progress(++n, 4); api.good(`${k[1]}: ${V3.j(k[2],'을')} 끼웠어요.`);
      if (n === 3) { quake.disabled = false; api.hint('이제 지진 시작을 눌러 보세요!'); }
    });
    const quake = api.button('〰️ 지진 시작', 'primary', () => {
      const amp = { none: 16, brace: 7, damper: 5, rubber: 3 };
      board.querySelector('[data-k=ground]').classList.remove('v3-sway'); void board.offsetWidth; board.querySelector('[data-k=ground]').style.setProperty('--amp', '8px'); board.querySelector('[data-k=ground]').classList.add('v3-sway');
      board.querySelectorAll('[data-b]').forEach(g => { g.style.setProperty('--amp', amp[g.dataset.b] + 'px'); g.classList.remove('v3-sway'); void g.getBBox(); g.classList.add('v3-sway'); });
      quake.disabled = true; setTimeout(() => { api.progress(4, 4); api.good('보강 없는 건물이 가장 크게 흔들렸어요. 세 방법 모두 흔들림을 줄였어요!'); api.finish('지진 대비 구조 세 가지를 비교했어요!'); }, 2800);
    }); quake.disabled = true;
  };

  // ---------------------------------------------------------------
  // 재난 3 · 무너진 대피소 다시 세우기 (구조물 구성 요소)
  // ---------------------------------------------------------------
  MS.evacuationMap = (c, done) => {
    const api = V3.frame(c, { id: 'evacuationMap', badge: '재난 · 구성 요소', title: '무너진 대피소 다시 세우기', guide: '부품 카드를 <b>아래부터 차례로</b> 빈 땅에 놓아 건물을 세워요. 부품을 놓을 때마다 그 부품이 하는 일을 골라요.', side: true }, done);
    const parts = [['found', '기초', '건물의 무게를 땅에 전달해요'], ['col', '기둥', '위의 무게를 받아 아래로 내려보내요'], ['beam', '보', '기둥과 기둥 사이에 걸쳐 바닥의 무게를 기둥에 전해요'], ['floor', '바닥', '사람과 가구를 받쳐요'], ['wall', '벽', '공간을 나누고 바람과 비를 막아요'], ['roof', '지붕', '눈·비·햇빛을 막아 건물을 덮어요']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); split.appendChild(stage);
    const board = V3.board(stage, 300 / 260);
    const art = { found: '<rect x="50" y="222" width="200" height="16" fill="#9a958a"/>', col: '<rect x="62" y="110" width="12" height="112" fill="#a8a29a"/><rect x="226" y="110" width="12" height="112" fill="#a8a29a"/><rect x="144" y="110" width="12" height="112" fill="#a8a29a"/>', beam: '<rect x="56" y="104" width="188" height="10" fill="#8f8a80"/>', floor: '<rect x="56" y="114" width="188" height="7" fill="#b9b3a7"/><rect x="56" y="214" width="188" height="8" fill="#b9b3a7"/>', wall: '<rect x="74" y="121" width="70" height="93" fill="#e9dfc9"/><rect x="156" y="121" width="70" height="93" fill="#e9dfc9"/><rect x="92" y="140" width="30" height="24" fill="#9cc5dc"/><rect x="176" y="160" width="26" height="54" fill="#7a5a3a"/>', roof: '<polygon points="40,106 150,52 260,106" fill="#b85c3c" stroke="#7a3c27" stroke-width="2"/>' };
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 300 260"><defs><marker id="v3ar3" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#4d8a3a"/></marker></defs><rect width="300" height="260" fill="#eaf2f5"/><rect y="238" width="300" height="22" fill="#b9a77f"/><g data-k="b" style="transform-origin:150px 238px;transition:transform .5s"></g><g data-k="flow" opacity="0" stroke="#4d8a3a" stroke-width="4" marker-end="url(#v3ar3)"><path d="M150,62 V100"/><path d="M68,116 V218"/><path d="M232,116 V218"/><path d="M150,240 V256"/></g></svg>`;
    const slot = V3.slotAt(board, 'site', 15, 30, 70, 55, '<span>여기에 부품을 놓아요<br>(아래부터)</span>'); slot.style.background = 'rgba(255,253,247,.35)';
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(parts).forEach(([id, n]) => tray.appendChild(V3.cardEl(id, n)));
    const g = board.querySelector('[data-k=b]');
    let n = 0, waiting = null; api.progress(0, 12);
    V3.placer(api.wrap, (card, s) => {
      if (waiting) { api.hint('먼저 아래에서 이 부품이 하는 일을 골라 주세요.'); return; }
      const i = parts.findIndex(p => p[0] === card.dataset.card);
      if (i !== n) { V3.bounce(card); g.style.transform = 'rotate(7deg)'; setTimeout(() => g.style.transform = '', 900); api.wrong(n === 0 ? '받쳐 줄 기초가 없으면 건물이 기울어요. 땅에 맨 먼저 놓는 부품은?' : `${V3.j(parts[i][1],'을')} 놓기 전에 아래에서 받쳐 줄 부품이 먼저 있어야 해요.`, [...tray.children].find(k => k.dataset.card === parts[n][0])); return; }
      card.classList.add('used'); g.insertAdjacentHTML('beforeend', art[parts[i][0]]); api.progress(n * 2 + 1, 12); waiting = parts[i]; slot.style.display = 'none'; askRole();
    });
    const ask = el('div', 'v3-col'); ask.style.cssText = 'position:absolute;left:8px;right:8px;bottom:8px;z-index:4;background:rgba(255,253,247,.97);border:1.5px solid var(--accent);border-radius:10px;padding:6px;display:none'; api.body.style.position = 'relative'; api.body.appendChild(ask);
    function askRole() {
      ask.style.display = ''; ask.innerHTML = `<b style="text-align:center">💬 ${V3.j(waiting[1],'이')} 하는 일은?</b><div class="v3-row"></div>`;
      const row = ask.querySelector('.v3-row');
      V3.shuffle(parts.filter(p => !p.done || p === waiting)).forEach(p => { const b = el('button', 'v3-btn', p[2]); b.type = 'button'; b.style.whiteSpace = 'normal'; b.style.fontSize = '13px'; b.addEventListener('click', () => {
        if (p !== waiting) { api.wrong(`그건 ${V3.j(p[1],'이')} 하는 일이에요.`, [...row.children].find(x => x.textContent === waiting[2])); return; }
        waiting.done = true; n++; api.progress(n * 2, 12); api.good(`${waiting[1]}: ${waiting[2]}`); waiting = null; ask.style.display = 'none'; slot.style.display = n < 6 ? '' : 'none';
        if (n === 6) { board.querySelector('[data-k=flow]').setAttribute('opacity', 1); api.hint('지붕 → 보 → 기둥 → 기초 → 땅으로 힘이 내려가요!', 'good'); api.finish('대피소를 다시 세웠어요!'); }
      }); row.appendChild(b); });
    }
  };

  // ---------------------------------------------------------------
  // 미래도시 1 · 제로에너지 집 만들기
  // ---------------------------------------------------------------
  MS.powerPlan = (c, done) => {
    const api = V3.frame(c, { id: 'powerPlan', badge: '미래도시 · 친환경 건축', title: '제로에너지 집 만들기', guide: '부품 카드를 집의 알맞은 자리에 붙여요. <b>쓰는 에너지</b>와 <b>만드는 에너지</b> 막대가 같아지면 성공!', side: true }, done);
    const parts = [['ins', '🧱 두꺼운 단열재', 'wall', -25, 0, '벽 속'], ['glass', '🪟 3중 유리창', 'win', -15, 0, '창문'], ['pv', '☀️ 건물 일체형 태양광', 'roof', 0, 45, '지붕'], ['green', '🌿 녹화(옥상·마당 식물)', 'yard', -10, 0, '마당'], ['ess', '🔋 에너지 저장 장치', 'room', 0, 5, '다용도 공간']];
    const pos = { wall: [3, 52], win: [70, 33], roof: [32, 10], yard: [78, 80], room: [46, 82] };
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); stage.style.flexDirection = 'column'; stage.style.gap = '6px'; split.appendChild(stage);
    const bw = el('div'); bw.style.cssText = 'flex:1;min-height:0;width:100%;position:relative'; stage.appendChild(bw);
    const board = V3.board(bw, 16 / 9); board.innerHTML = `<img class="v3-img" src="${img('eco/zero-energy-house.webp')}" style="width:100%;height:100%" alt="">`;
    const slots = {}; parts.forEach(p => { const [x, y] = pos[p[2]]; const s = V3.slotAt(board, p[2], x, y, 18, 12, p[5]); s.style.background = 'rgba(255,243,223,.9)'; slots[p[2]] = s; });
    const bars = el('div', 'v3-col'); bars.style.width = '100%'; stage.appendChild(bars);
    bars.innerHTML = `<div class="v3-row" style="flex-wrap:nowrap"><b style="width:120px;font-size:13px">쓰는 에너지</b><div class="v3-bar" style="flex:1"><i data-k="use" style="background:#c4533d;width:100%"></i></div><b data-k="uv" style="width:36px">100</b></div><div class="v3-row" style="flex-wrap:nowrap"><b style="width:120px;font-size:13px">만드는 에너지</b><div class="v3-bar" style="flex:1"><i data-k="make" style="background:#7d8a3a;width:0%"></i></div><b data-k="mv" style="width:36px">0</b></div>`;
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(parts).forEach(([id, t]) => tray.appendChild(V3.cardEl(id, t)));
    let use = 100, make = 0, n = 0; api.progress(0, 5);
    const setBars = () => { bars.querySelector('[data-k=use]').style.width = use + '%'; bars.querySelector('[data-k=make]').style.width = make + '%'; bars.querySelector('[data-k=uv]').textContent = use; bars.querySelector('[data-k=mv]').textContent = make; };
    V3.placer(api.wrap, (card, slot) => {
      if (slot.classList.contains('filled')) return;
      const p = parts.find(x => x[0] === card.dataset.card);
      if (p[2] !== slot.dataset.slot) { V3.bounce(card); api.wrong(`${V3.j(p[1].replace(/^\S+\s/, ''),'은')} ${p[5]}에 어울려요.`, slots[p[2]]); return; }
      card.classList.add('used'); slot.classList.add('filled'); slot.innerHTML = p[1]; use += p[3]; make += p[4]; setBars(); api.progress(++n, 5);
      api.good(p[3] ? `쓰는 에너지가 ${-p[3]} 줄었어요.` : `만드는 에너지가 ${p[4]} 늘었어요.`);
      if (n === 5) { api.hint(`쓰는 에너지 ${use} = 만드는 에너지 ${make}! 제로에너지 집이에요.`, 'good'); api.finish('제로에너지 집 완성!'); }
    });
  };

  // ---------------------------------------------------------------
  // 미래도시 2 · 빗물이 스며드는 도시
  // ---------------------------------------------------------------
  MS.waterPlan = (c, done) => {
    const api = V3.frame(c, { id: 'waterPlan', badge: '미래도시 · 물 순환', title: '빗물이 스며드는 도시', guide: '아래 도구를 고르고 도시 칸을 눌러 바꿔요. 그다음 <b>비 내리기</b>를 눌러 도로에 고인 물이 빨간 선 아래인지 확인해요.' }, done);
    const tools = { perm: ['투수성 포장', '#c9b99a', 1, 'road'], garden: ['빗물 정원', '#7d9a4a', 1.5, 'any'], roofg: ['옥상 녹화', '#8fb35a', 1, 'bld'], tank: ['지하 저류조', '#5d8aa8', 2, 'any'] };
    const cells = [['bld', 'road', 'bld', 'road'], ['road', 'road', 'road', 'road'], ['bld', 'road', 'park', 'bld']];
    const state = cells.map(r => r.map(() => null));
    const wrapG = el('div'); wrapG.style.cssText = 'flex:1;min-height:0;display:grid;grid-template-columns:1fr 110px;gap:10px'; api.body.appendChild(wrapG);
    const gridEl = el('div'); gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);gap:4px;min-height:0'; wrapG.appendChild(gridEl);
    const gauge = el('div', 'v3-col'); gauge.style.cssText = 'align-items:center;min-height:0'; wrapG.appendChild(gauge);
    gauge.innerHTML = '<b style="font-size:12.5px">도로의 물 높이</b><div style="position:relative;flex:1;width:46px;border:2px solid #8b7f66;border-radius:6px;background:#fffdf7;overflow:hidden"><div data-k="lv" style="position:absolute;left:0;right:0;bottom:0;height:0;background:#5d8aa8;transition:height 1.2s"></div><div style="position:absolute;left:-4px;right:-4px;bottom:40%;border-top:3px dashed #c4533d"></div></div><span class="v3-small">빨간 선 아래면 통과</span>';
    let tool = 'perm';
    const tb = el('div', 'v3-row'); api.body.appendChild(tb);
    Object.entries(tools).forEach(([id, [t, col]]) => { const b = el('button', 'v3-btn' + (id === tool ? ' on' : ''), `<span style="display:inline-block;width:12px;height:12px;background:${col};border-radius:3px"></span> ${t}`); b.type = 'button'; b.addEventListener('click', () => { tool = id; tb.querySelectorAll('.v3-btn').forEach(x => x.classList.toggle('on', x === b)); }); tb.appendChild(b); });
    const base = { bld: ['🏢 건물 옥상', '#b5aea0'], road: ['아스팔트', '#6b6672'], park: ['공원', '#a6c78a'] };
    const draw = () => { gridEl.innerHTML = ''; cells.forEach((r, ri) => r.forEach((k, ci) => { const s = state[ri][ci], b = el('button', '', s ? tools[s][0] : base[k][0]); b.type = 'button'; b.style.cssText = `border:2px solid ${s ? '#4d8a3a' : '#8b7f66'};border-radius:8px;background:${s ? tools[s][1] : base[k][1]};color:${k === 'road' && !s ? '#fff' : '#2a2833'};font:800 13px var(--font);cursor:pointer;min-height:0`; b.addEventListener('click', () => {
      const need = tools[tool][3];
      if (k === 'park') { api.hint('공원은 이미 빗물이 스며들어요.'); return; }
      if (need === 'road' && k !== 'road') { api.wrong('투수성 포장은 도로·보도 바닥에 깔아요.'); return; }
      if (need === 'bld' && k !== 'bld') { api.wrong('옥상 녹화는 건물 지붕 위에 해요.'); return; }
      if (tool === 'garden' && k === 'bld') { api.wrong('빗물 정원은 땅 위에 만들어요. 건물 위에는 옥상 녹화!'); return; }
      if (tool === 'tank' && Object.values(state).flat().filter(x => x === 'tank').length >= 1 && s !== 'tank') { api.hint('지하 저류조는 크고 비싸서 하나만 만들 수 있어요.'); return; }
      state[ri][ci] = s === tool ? null : tool; draw(); }); gridEl.appendChild(b); })); };
    draw(); api.progress(0, 1);
    const level = () => { const sum = state.flat().filter(Boolean).reduce((a, s) => a + tools[s][2], 0); return Math.max(8, 100 - sum * 9.5); };
    api.button('☔ 비 내리기', 'primary', () => {
      const lv = level(); gauge.querySelector('[data-k=lv]').style.height = '0%'; setTimeout(() => gauge.querySelector('[data-k=lv]').style.height = lv + '%', 50);
      setTimeout(() => {
        if (lv < 40) { api.progress(1, 1); const kinds = new Set(state.flat().filter(Boolean)); api.good(`물이 빨간 선 아래예요! (${kinds.size}가지 기술 사용)`); api.clearButtons(); api.finish('빗물이 스며드는 도시를 만들었어요!'); }
        else api.wrong('아직 물이 많이 고여요. 아스팔트와 옥상을 더 바꿔 보세요.');
      }, 1300);
    });
  };

  // ---------------------------------------------------------------
  // 미래도시 3 · 스마트 건설 해결사
  // ---------------------------------------------------------------
  MS.greenPlan = (c, done) => {
    const api = V3.frame(c, { id: 'greenPlan', badge: '미래도시 · 스마트 건설', title: '스마트 건설 해결사', guide: '현장 고민 쪽지마다 알맞은 <b>기술 카드</b>를 끌어다 놓아요.', side: true }, done);
    const tech = [['drone', '드론 점검', img('smart/drone.webp'), '높은 다리 점검이 위험해요'], ['modular', '모듈러 건축', img('cards/modular.webp'), '공사를 빨리 끝내야 해요'], ['bim', 'BIM·디지털 트윈', img('smart/bim.webp'), '짓기 전에 문제를 미리 찾고 싶어요'], ['print', '3D 프린팅 건축', img('smart/3dprint.webp'), '곡선 모양 벽을 만들고 싶어요']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div'); stage.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;min-height:0'; split.appendChild(stage);
    const slots = {}; V3.shuffle(tech).forEach(([id, , , prob]) => { const s = el('div', 'v3-slot', `<span style="font-size:14px;color:var(--text)">📝 “${prob}”</span>`); s.dataset.slot = id; s.style.flexDirection = 'column'; stage.appendChild(s); slots[id] = s; });
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(tech).forEach(([id, t, p]) => tray.appendChild(V3.cardEl(id, t, p)));
    const why = { drone: '사람 대신 날아가서 높은 곳을 찍어 보는 기술이 필요해요.', modular: '공장에서 방 단위로 만들어 현장에서 조립하면 빨라요.', bim: '컴퓨터 속에 건물을 먼저 지어 보면 문제를 미리 찾을 수 있어요.', print: '재료를 층층이 쌓아 원하는 모양을 뽑아내는 기술이에요.' };
    let n = 0; api.progress(0, 4);
    V3.placer(api.wrap, (card, slot) => {
      if (slot.classList.contains('filled')) return;
      if (card.dataset.card !== slot.dataset.slot) { V3.bounce(card); api.wrong(why[slot.dataset.slot], [...tray.children].find(k => k.dataset.card === slot.dataset.slot)); return; }
      const t = tech.find(x => x[0] === card.dataset.card); card.classList.add('used'); slot.classList.add('filled');
      slot.insertAdjacentHTML('beforeend', `<img src="${t[2]}" style="flex:1;min-height:0;max-width:100%;object-fit:contain;border-radius:6px" alt=""><b style="color:#4d8a3a">✓ ${t[1]}</b>`);
      api.progress(++n, 4); api.good(`${V3.j(t[1],'으로')} 해결!`); if (n === 4) api.finish('스마트 건설로 고민을 모두 해결했어요!');
    });
  };

  // ---------------------------------------------------------------
  // 최종 재건 · 우리 도시 재건 계획판
  // ---------------------------------------------------------------
  const TECH = [
    { id: 'levee', name: '제방·저류지', tag: '홍수 방재', s: 3, e: 1, c: 1 },
    { id: 'sponge', name: '스펀지 시티', tag: '빗물 관리', s: 2, e: 3, c: 1, img: 'cards/sponge-city.webp' },
    { id: 'quake', name: '내진·면진 구조', tag: '지진 대비', s: 3, e: 0, c: 1 },
    { id: 'zero', name: '제로에너지 건축', tag: '친환경 건축', s: 1, e: 3, c: 2, img: 'cards/zero-energy.webp' },
    { id: 'modular', name: '모듈러 건축', tag: '빠른 시공', s: 1, e: 2, c: 3, img: 'cards/modular.webp' },
    { id: 'truss', name: '트러스 다리', tag: '튼튼한 다리', s: 2, e: 1, c: 3 },
    { id: 'drone', name: '드론 점검', tag: '유지관리', s: 3, e: 1, c: 2 },
    { id: 'twin', name: 'BIM·디지털 트윈', tag: '미리 시험하기', s: 2, e: 1, c: 3, img: 'cards/digital-twin.webp' },
    { id: 'heal', name: '자기 치유 콘크리트', tag: '오래 쓰는 재료', s: 2, e: 2, c: 1, img: 'cards/self-healing-concrete.webp' },
    { id: 'sensor', name: '스마트 센서', tag: '실시간 감시', s: 2, e: 1, c: 3, img: 'cards/smart-sensors.webp' }
  ];
  const ZONES = [['river', '🌊 강가', 26, 18], ['bridge', '🌉 다리', 22, 48], ['home', '🏘️ 주거지', 62, 22], ['city', '🏙️ 도심', 62, 70]];
  const REASONS = ['재난(홍수·지진)에 안전해서', '환경을 지키고 에너지를 아껴서', '빠르고 편리하게 지을 수 있어서', '오래 튼튼하게 쓸 수 있어서'];
  window.MINIGAMES.createCityRebuildSimulator = function (container, onComplete) {
    const api = V3.frame(container, { id: 'final', badge: '최종 재건', title: '우리 도시 재건 계획판', guide: '도시 네 구역에 기술 카드를 <b>하나씩</b> 놓고, 고른 <b>이유</b>도 골라요. 조합에 따라 결과 도시가 달라져요.', side: true }, () => {});
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); stage.style.flexDirection = 'column'; stage.style.gap = '6px'; split.appendChild(stage);
    const bw = el('div'); bw.style.cssText = 'flex:1;min-height:0;width:100%;position:relative'; stage.appendChild(bw);
    const board = V3.board(bw, 16 / 9); board.innerHTML = `<img class="v3-img" src="${img('final/rebuild-map.webp')}" style="width:100%;height:100%" alt="">`;
    const plan = {};
    const slots = {}; ZONES.forEach(([id, t, x, y]) => { const s = V3.slotAt(board, id, x, y, 26, 24, `<b style="color:var(--text)">${t}</b>`); s.style.background = 'rgba(255,253,247,.88)'; s.style.flexDirection = 'column'; slots[id] = s; });
    const bars = el('div', 'v3-col'); bars.style.width = '100%'; stage.appendChild(bars);
    const bar = (k, t, col) => `<div class="v3-row" style="flex-wrap:nowrap"><b style="width:44px;font-size:13px">${t}</b><div class="v3-bar" style="flex:1"><i data-k="${k}" style="background:${col};width:0%"></i></div></div>`;
    bars.innerHTML = bar('s', '안전', '#3f7fa8') + bar('e', '환경', '#7d8a3a') + bar('c', '편리', '#d9822b');
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    TECH.forEach(t => tray.appendChild(V3.cardEl(t.id, `${t.name}<br><small style="font-weight:600;color:var(--muted)">${t.tag}</small>`)));
    const score = () => { const z = { s: 0, e: 0, c: 0 }; Object.values(plan).forEach(p => { const t = TECH.find(x => x.id === p.tech); z.s += t.s; z.e += t.e; z.c += t.c; }); ['s', 'e', 'c'].forEach(k => bars.querySelector(`[data-k=${k}]`).style.width = Math.min(100, z[k] / 12 * 100) + '%'); return z; };
    const renderZone = (id) => {
      const p = plan[id], s = slots[id], t = TECH.find(x => x.id === p.tech), zname = ZONES.find(z => z[0] === id)[1];
      s.classList.add('filled'); s.innerHTML = `<b style="color:var(--text);font-size:12px">${zname} · ${t.name}</b><select data-r style="max-width:100%;font:700 11.5px var(--font);border-radius:6px;border:1px solid var(--line2);background:#fffdf7"><option value="">이유 고르기 ▾</option>${REASONS.map((r, i) => `<option value="${i}" ${p.reason === i ? 'selected' : ''}>${r}</option>`).join('')}</select>`;
      s.querySelector('[data-r]').addEventListener('change', (e) => { p.reason = e.target.value === '' ? null : +e.target.value; check(); });
      s.querySelector('[data-r]').addEventListener('pointerdown', (e) => e.stopPropagation());
    };
    const check = () => { const z = score(); const all = ZONES.every(([id]) => plan[id] && plan[id].reason != null); fin.disabled = !all; api.progress(Object.values(plan).filter(p => p.reason != null).length, 4); if (all) api.good('계획이 완성됐어요. 재건 시작을 눌러요!'); return z; };
    V3.placer(api.wrap, (card, slot) => {
      const id = slot.dataset.slot, old = plan[id];
      if (old) { const oc = tray.querySelector(`[data-card="${old.tech}"]`); if (oc) oc.classList.remove('used'); }
      plan[id] = { tech: card.dataset.card, reason: null }; card.classList.add('used'); renderZone(id); check();
      api.hint('이 기술을 고른 이유를 골라 주세요.');
    });
    const fin = api.button('🏗️ 재건 시작', 'primary', () => {
      const z = check(), tot = z.s + z.e + z.c, ids = Object.values(plan).map(p => p.tech);
      let arch = 'hybrid';
      const mx = Math.max(z.s, z.e, z.c), spread = mx - Math.min(z.s, z.e, z.c);
      if (ids.includes('modular') && z.c === mx && spread >= 2) arch = 'modular';
      else if (spread <= 1) arch = 'hybrid';
      else if (z.s === mx) arch = 'safe'; else if (z.e === mx) arch = 'eco'; else arch = 'smart';
      const INFO = {
        hybrid: ['⚖️ 조화로운 하이브리드 도시', '안전, 환경, 편리함을 고르게 챙긴 도시예요. 어느 한쪽에 치우치지 않아 오래 살기 좋은 도시가 되었어요.'],
        safe: ['🛡️ 재난에 강한 회복 도시', '홍수와 지진에 대비한 기술을 많이 골랐어요. 다음 재난이 와도 빠르게 회복할 수 있는 도시가 되었어요.'],
        eco: ['🌱 친환경 생태 순환 도시', '에너지와 물을 아끼는 기술을 많이 골랐어요. 숲과 물이 살아 숨 쉬는 도시가 되었어요.'],
        smart: ['🚀 똑똑한 스마트 도시', '미리 시험하고 실시간으로 살피는 기술을 많이 골랐어요. 편리하고 빠르게 관리되는 도시가 되었어요.'],
        modular: ['🧩 빠르게 다시 세운 모듈러 도시', '공장에서 만든 모듈로 빠르게 다시 지었어요. 시민들이 일찍 집으로 돌아올 수 있었어요.']
      };
      const SHORT = { hybrid: '조화로운 하이브리드 도시', modular: '모듈러 스마트 도시', eco: '친환경 생태 순환 도시', smart: '초연결 스마트 시티', safe: '재난에 강한 회복 도시' };
      const reason = ZONES.map(([id, t]) => `${t.replace(/^\S+\s/, '')}: ${TECH.find(x => x.id === plan[id].tech).name} (${REASONS[plan[id].reason]})`).join(' / ');
      window.__rebuildOutcome = { archetype: arch, short: SHORT[arch], reason, title: INFO[arch][0], outcomeImg: img('rebuild/' + arch + '.webp'), summary: INFO[arch][1], cards: ZONES.map(([id]) => { const t = TECH.find(x => x.id === plan[id].tech); return { id: t.id, name: t.name, tag: t.tag }; }), scores: z };
      try { window.localStorage?.setItem('constructionExplorer.rebuildOutcome', JSON.stringify(window.__rebuildOutcome)); } catch (_) {}
      if (typeof onComplete === 'function') onComplete();
    });
    fin.disabled = true; api.progress(0, 4); score();
  };

  // ---------------------------------------------------------------
  // 연결: 기록 18개는 새 미션으로
  // ---------------------------------------------------------------
  const M = window.MINIGAMES, prev = M.createObjectMiniGame;
  M.createObjectMiniGame = (id, c, cb) => (MS[id] ? MS[id](c, cb) : prev(id, c, cb));
})();
