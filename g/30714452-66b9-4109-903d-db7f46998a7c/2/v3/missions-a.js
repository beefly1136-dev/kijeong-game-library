/* 건설기술 탐험대 v3 · 1차시 미션 (본부 · 연구소 · 교량 · 주거) */
(() => {
  const V3 = window.V3, el = V3.el, img = V3.img, MS = V3.missions;

  // 비율을 지키며 무대에 꽉 차는 판
  V3.board = (parent, aspect) => {
    const box = el('div'); box.style.cssText = 'position:relative;margin:auto;';
    parent.appendChild(box);
    const fit = () => { const w = parent.clientWidth, h = parent.clientHeight; if (!w || !h) return; let bw = w, bh = w / aspect; if (bh > h) { bh = h; bw = h * aspect; } box.style.width = bw + 'px'; box.style.height = bh + 'px'; };
    if (window.ResizeObserver) new ResizeObserver(fit).observe(parent); requestAnimationFrame(fit); fit();
    return box;
  };
  V3.slotAt = (board, id, x, y, w, h, label) => {
    const s = el('div', 'v3-slot v3-pin', label || ''); s.dataset.slot = id;
    s.style.left = x + '%'; s.style.top = y + '%'; s.style.width = w + '%'; s.style.height = h + '%';
    board.appendChild(s); return s;
  };
  V3.cardEl = (id, label, pic) => { const c = el('div', 'v3-card' + (pic ? ' pic' : ''), (pic ? `<img src="${pic}" alt="">` : '') + `<span>${label}</span>`); c.dataset.card = id; return c; };

  // ---------------------------------------------------------------
  // 본부 1 · 피해 구조물 분류 (건축 / 토목)
  // ---------------------------------------------------------------
  MS.signal = (c, done) => {
    const api = V3.frame(c, { id: 'signal', badge: '본부 · 건설기술이란?', title: '피해 구조물을 복구팀에 보내기', guide: '구조물 카드를 끌어 <b>건축 구조물 복구팀</b>과 <b>토목 구조물 복구팀</b>에 나누어 보내요. (카드를 누른 뒤 팀을 눌러도 돼요)', side: true }, done);
    const items = [['apartment', '아파트', 'a'], ['school', '학교', 'a'], ['hospital', '병원', 'a'], ['bridge', '다리', 'c'], ['tunnel', '터널', 'c'], ['road', '도로', 'c'], ['dam', '댐', 'c'], ['port', '항만', 'c']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); stage.style.gap = '10px'; stage.style.alignItems = 'stretch'; split.appendChild(stage);
    const bin = (id, t, d) => { const b = el('div', 'v3-slot'); b.dataset.slot = id; b.style.cssText = 'flex:1;flex-direction:column;justify-content:flex-start;padding:8px;'; b.innerHTML = `<div style="font-size:15px;color:var(--text)">${t}</div><div class="v3-small">${d}</div><div class="v3-row" data-in style="margin-top:6px"></div>`; stage.appendChild(b); return b; };
    const binA = bin('a', '🏢 건축 구조물 복구팀', '사람이 안에서 생활하거나 일하는 건물'), binC = bin('c', '🌉 토목 구조물 복구팀', '도로·다리처럼 생활의 바탕이 되는 시설');
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(items).forEach(([id, n]) => tray.appendChild(V3.cardEl(id, n, img('structures/' + id + '.webp'))));
    let n = 0; api.progress(0, 8);
    V3.placer(api.wrap, (card, slot) => {
      const it = items.find(i => i[0] === card.dataset.card);
      if (it[2] !== slot.dataset.slot) { V3.bounce(card); api.wrong(it[2] === 'a' ? `${V3.j(it[1],'은')} 사람이 안에서 생활하거나 일하는 건물이에요.` : `${V3.j(it[1],'은')} 사람들이 오가거나 물을 다스리는 시설이에요.`, it[2] === 'a' ? binA : binC); return; }
      card.classList.add('used'); const chip = el('span', 'v3-card', `<img src="${img('structures/' + it[0] + '.webp')}" alt="">${it[1]}`); chip.style.cssText = 'pointer-events:none;padding:3px 6px'; slot.querySelector('[data-in]').appendChild(chip); slot.classList.add('filled');
      api.progress(++n, 8); api.good(`${it[1]} → ${slot.dataset.slot === 'a' ? '건축' : '토목'} 구조물 복구팀!`);
      if (n === 8) api.finish('복구팀 배정 완료!');
    });
  };

  // ---------------------------------------------------------------
  // 본부 2 · 안전 점검 순찰 (찾기 → 점검·보수·보강 도장)
  // ---------------------------------------------------------------
  MS.safetyLog = (c, done) => {
    const api = V3.frame(c, { id: 'safetyLog', badge: '본부 · 유지관리', title: '안전 점검 순찰', guide: '본부 건물에서 <b>이상한 곳 4곳</b>을 찾아 눌러요. 찾은 곳마다 할 일을 읽고 <b>점검·보수·보강</b> 중 알맞은 도장을 찍어요.', side: true }, done);
    const spots = [
      { id: 'crack', x: 18, y: 46, name: '벽 균열', job: '금 간 곳을 메워 원래 상태로 고쳐요.', ans: '보수' },
      { id: 'rebar', x: 66.5, y: 59, name: '드러난 녹슨 철근', job: '철근을 덧대고 감싸 처음보다 더 튼튼하게 만들어요.', ans: '보강' },
      { id: 'leak', x: 61, y: 23, name: '천장 누수', job: '물이 새는 곳에 방수층을 다시 깔아 고쳐요.', ans: '보수' },
      { id: 'rail', x: 66, y: 75, name: '기울어진 난간', job: '얼마나 기울었는지 재고 상태를 기록해요.', ans: '점검' }
    ];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); split.appendChild(stage);
    const board = V3.board(stage, 16 / 9); board.innerHTML = `<img class="v3-img" src="${img('inspection/hub-building.webp')}" style="width:100%;height:100%;cursor:zoom-in" alt="본부 건물">`;
    const side = el('div', 'v3-tray'); side.style.flexDirection = 'column'; split.appendChild(side);
    side.innerHTML = `<div class="v3-small" data-k="task" style="text-align:center;font-size:14px;color:var(--sub)">🔍 사진에서 이상한 곳을 눌러 보세요.</div><div class="v3-row" data-k="stamps"></div><div class="v3-small" style="text-align:center">점검: 상태 살피기 · 보수: 원래대로 고치기 · 보강: 더 튼튼하게</div>`;
    const task = side.querySelector('[data-k=task]'), stamps = side.querySelector('[data-k=stamps]');
    let cur = null, n = 0; const doneSet = new Set(); api.progress(0, 4);
    const marks = {};
    spots.forEach(s => {
      const b = el('button', 'v3-pin'); b.type = 'button'; b.style.cssText = `left:${s.x}%;top:${s.y}%;width:11%;height:15%;border-radius:50%;border:0;background:transparent;cursor:pointer;`;
      b.addEventListener('click', (e) => { e.stopPropagation(); if (doneSet.has(s.id)) return; cur = s; b.style.border = '3px solid #d9822b'; b.style.background = 'rgba(255,243,223,.25)'; task.innerHTML = `<b style="color:var(--text)">찾았어요: ${s.name}</b><br>할 일: ${s.job}<br>어떤 조치일까요?`; stamps.querySelectorAll('button').forEach(x => x.disabled = false); });
      board.appendChild(b); marks[s.id] = b;
    });
    board.addEventListener('click', () => { if (!cur) api.hint('여기는 괜찮아요. 금, 물 자국, 녹, 기울어진 곳을 찾아보세요.'); });
    ['점검', '보수', '보강'].forEach(t => { const b = el('button', 'v3-btn', '🔖 ' + t); b.type = 'button'; b.disabled = true; stamps.appendChild(b);
      b.addEventListener('click', () => {
        if (!cur) return;
        if (t !== cur.ans) { api.wrong(cur.ans === '점검' ? '고치기 전에 먼저 상태를 살피고 기록하는 일이에요.' : cur.ans === '보수' ? '처음 상태로 되돌리는 일이에요. 더 튼튼하게 바꾸는 건 아니에요.' : '원래보다 더 튼튼하게 만드는 일이에요.', [...stamps.children].find(x => x.textContent.includes(cur.ans))); return; }
        doneSet.add(cur.id); const m = marks[cur.id]; m.style.border = '3px solid #4d8a3a'; m.style.background = 'rgba(77,138,58,.18)'; m.innerHTML = `<span style="position:absolute;left:50%;top:-6px;transform:translateX(-50%);background:#4d8a3a;color:#fff;font:800 12px var(--font);padding:2px 7px;border-radius:6px;white-space:nowrap">${t}</span>`;
        api.progress(++n, 4); api.good(`${cur.name} → ${t}!`); cur = null; stamps.querySelectorAll('button').forEach(x => x.disabled = true);
        task.innerHTML = n < 4 ? '🔍 다른 곳도 찾아보세요.' : '모두 찾았어요!';
        if (n === 4) api.finish('본부 안전 점검 완료!');
      }); });
  };

  // ---------------------------------------------------------------
  // 본부 3 · 본부 건물이 받는 힘(하중) 찾기
  // ---------------------------------------------------------------
  MS.restoreLog = (c, done) => {
    const api = V3.frame(c, { id: 'restoreLog', badge: '본부 · 하중', title: '본부 건물이 받는 힘 찾기', guide: '힘 스티커를 건물의 알맞은 자리에 붙여요. 붙일 때마다 건물이 그 힘을 받는 모습을 볼 수 있어요.', side: true }, done);
    const loads = [['dead', '⬇️ 고정 하중', '구조물 자체 무게', 'body'], ['live', '🧑‍🤝‍🧑 적재 하중', '사람·가구 무게', 'inside'], ['wind', '💨 풍하중', '바람이 미는 힘', 'side'], ['snow', '❄️ 적설 하중', '쌓인 눈 무게', 'roof'], ['quake', '〰️ 지진 하중', '땅의 흔들림', 'ground']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); split.appendChild(stage);
    const board = V3.board(stage, 4 / 3);
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 400 300"><defs><marker id="v3ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#4d8a3a"/></marker></defs>
      <rect x="0" y="0" width="400" height="300" fill="#eaf2f5"/><rect x="0" y="248" width="400" height="52" fill="#b9a77f"/><rect x="0" y="248" width="400" height="5" fill="#8f7c55"/>
      <g data-k="bld" style="transform-origin:200px 248px;transition:transform .3s">
        <rect x="128" y="240" width="144" height="18" fill="#9a958a"/><text x="200" y="254" font-size="10" text-anchor="middle" fill="#fff" font-weight="800">기초</text>
        <rect x="140" y="110" width="120" height="130" fill="#e9dfc9" stroke="#8b7f66" stroke-width="2"/><rect x="140" y="172" width="120" height="5" fill="#8b7f66"/>
        <polygon points="128,112 200,70 272,112" fill="#b85c3c" stroke="#7a3c27" stroke-width="2" data-k="roof"/>
        <rect x="155" y="125" width="26" height="22" fill="#9cc5dc"/><rect x="219" y="125" width="26" height="22" fill="#9cc5dc"/>
        <rect x="186" y="200" width="28" height="40" fill="#7a5a3a"/>
        <g data-k="snow" opacity="0"><path d="M132,110 Q200,60 268,110 L262,104 Q200,58 138,104z" fill="#fff"/></g>
        <g data-k="ppl" opacity="0"><circle cx="160" cy="188" r="5" fill="#d9822b"/><rect x="156" y="193" width="8" height="12" fill="#d9822b"/><circle cx="240" cy="188" r="5" fill="#5d8aa8"/><rect x="236" y="193" width="8" height="12" fill="#5d8aa8"/><rect x="222" y="160" width="22" height="12" fill="#8b6b4a"/></g>
      </g>
      <g data-k="windfx" opacity="0" stroke="#5d8aa8" stroke-width="3" fill="none"><path d="M40,140 h60"/><path d="M30,165 h70"/><path d="M45,190 h55"/></g>
      <g data-k="flow" opacity="0" stroke="#4d8a3a" stroke-width="4" marker-end="url(#v3ar)"><path d="M170,95 V232"/><path d="M230,95 V232"/><path d="M200,258 V290"/></g>
    </svg>`;
    const q = (k) => board.querySelector(`[data-k=${k}]`), bld = q('bld');
    const slots = { roof: V3.slotAt(board, 'roof', 50, 15, 26, 10, '지붕 위'), side: V3.slotAt(board, 'side', 16, 52, 24, 11, '옆벽'), body: V3.slotAt(board, 'body', 50, 44, 26, 10, '건물 전체'), inside: V3.slotAt(board, 'inside', 50, 66, 26, 10, '건물 안'), ground: V3.slotAt(board, 'ground', 50, 91, 26, 10, '땅') };
    Object.values(slots).forEach(s => s.style.fontSize = '12px');
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(loads).forEach(([id, t, d]) => { const k = V3.cardEl(id, `${t}<br><small style="font-weight:600;color:var(--muted)">${d}</small>`); tray.appendChild(k); });
    const fx = {
      roof: () => { q('snow').setAttribute('opacity', 1); bld.style.transform = 'scaleY(.97)'; setTimeout(() => bld.style.transform = '', 400); },
      side: () => { q('windfx').setAttribute('opacity', 1); bld.style.transform = 'skewX(-4deg)'; setTimeout(() => bld.style.transform = '', 500); },
      body: () => { bld.style.transform = 'scaleY(.97)'; setTimeout(() => bld.style.transform = '', 400); },
      inside: () => { q('ppl').setAttribute('opacity', 1); bld.style.transform = 'scaleY(.98)'; setTimeout(() => bld.style.transform = '', 400); },
      ground: () => { bld.style.setProperty('--amp', '5px'); bld.classList.remove('v3-sway'); void bld.offsetWidth; bld.classList.add('v3-sway'); }
    };
    const hints = { roof: '지붕 위에 쌓이는 것의 무게예요.', side: '옆에서 벽을 미는 힘이에요.', body: '건물 자체의 무게예요. 늘 그대로 있어요.', inside: '건물 안에 있는 사람과 가구의 무게예요.', ground: '땅이 흔들려서 생기는 힘이에요.' };
    let n = 0; api.progress(0, 5);
    V3.placer(api.wrap, (card, slot) => {
      const L = loads.find(l => l[0] === card.dataset.card);
      if (L[3] !== slot.dataset.slot) { V3.bounce(card); api.wrong(`${V3.j(L[1].replace(/^\S+\s/, ''),'은')} ${hints[L[3]]}`, slots[L[3]]); return; }
      card.classList.add('used'); slot.classList.add('filled'); slot.innerHTML = L[1]; fx[L[3]](); api.progress(++n, 5); api.good(`${L[1].replace(/^\S+\s/, '')}: ${L[2]}`);
      if (n === 5) { q('flow').setAttribute('opacity', 1); api.hint('모든 힘이 기둥과 벽을 따라 <b>기초</b>로, 기초에서 <b>땅</b>으로 전달돼요!', 'good'); api.finish('하중 다섯 가지를 모두 찾았어요!'); }
    });
  };

  // ---------------------------------------------------------------
  // 연구소 1 · 건설기술 타임라인
  // ---------------------------------------------------------------
  MS.historyRecord = (c, done) => {
    const api = V3.frame(c, { id: 'historyRecord', badge: '연구소 · 건설기술의 발달', title: '건설기술 타임라인', guide: '구조물 그림을 <b>옛날부터 오늘날</b> 순서로 연표에 놓아요. 놓으면 어떤 재료로 지었는지 보여요.' }, done);
    const items = [['hut', '움집', '흙·나무'], ['stone-bridge', '돌다리', '돌'], ['hanok', '한옥', '목재'], ['steel-bridge', '철골 다리', '강철'], ['skyscraper', '초고층 빌딩', '철근콘크리트']];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); stage.style.flexDirection = 'column'; stage.style.gap = '6px'; split.appendChild(stage);
    const line = el('div'); line.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:100%;flex:1;min-height:0'; stage.appendChild(line);
    const arrow = el('div', 'v3-small', '<span>◀ 아주 옛날</span><span style="flex:1;height:4px;background:linear-gradient(90deg,#b8ae95,#d9822b);border-radius:4px;margin:0 8px"></span><span>오늘날 ▶</span>'); arrow.style.cssText = 'display:flex;align-items:center;width:100%'; stage.appendChild(arrow);
    const slots = items.map((it, i) => { const s = el('div', 'v3-slot', `<span>${i + 1}</span>`); s.dataset.slot = i; s.style.flexDirection = 'column'; line.appendChild(s); return s; });
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(items).forEach(([id, n]) => tray.appendChild(V3.cardEl(id, n, img('history/' + id + '.webp'))));
    let n = 0; api.progress(0, 5);
    V3.placer(api.wrap, (card, slot) => {
      const i = items.findIndex(t => t[0] === card.dataset.card), want = +slot.dataset.slot;
      if (slot.classList.contains('filled')) return;
      if (i !== want) { V3.bounce(card); api.wrong(i > want ? `${V3.j(items[i][1],'은')} 더 나중에 나왔어요. ${V3.j(items[i][2],'으로')} 지었거든요.` : `${V3.j(items[i][1],'은')} 더 옛날 구조물이에요.`, slots[i]); return; }
      card.classList.add('used'); slot.classList.add('filled');
      slot.innerHTML = `<img src="${img('history/' + items[i][0] + '.webp')}" style="width:100%;flex:1;min-height:0;object-fit:cover;border-radius:6px" alt=""><b style="font-size:13px">${items[i][1]}</b><span style="font-size:12px;background:#fff3df;border-radius:6px;padding:1px 6px;color:#9a5a17">재료: ${items[i][2]}</span>`;
      api.progress(++n, 5); api.good(`${items[i][1]}: ${V3.j(items[i][2],'으로')} 지었어요.`);
      if (n === 5) api.finish('건설 재료가 발달한 순서를 찾았어요!');
    });
  };

  // ---------------------------------------------------------------
  // 연구소 2 · 돌다리 아치 실험
  // ---------------------------------------------------------------
  MS.bridgeDesign = (c, done) => {
    const api = V3.frame(c, { id: 'bridgeDesign', badge: '연구소 · 아치 구조', title: '돌다리 아치 실험', guide: '아치 꼭대기에 돌을 하나 끼우고, 아래 막대를 밀어 <b>무게를 올려 봐요</b>. 끝까지 버티는 돌을 찾아요.' }, done);
    const cx = 300, cy = 250, r1 = 120, r2 = 170, N = 9;
    const P = (r, a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    let stones = '';
    for (let i = 0; i < N; i++) { if (i === 4) continue; const a0 = Math.PI - i * Math.PI / N, a1 = Math.PI - (i + 1) * Math.PI / N; const pts = [P(r1, a0), P(r2, a0), P(r2, a1), P(r1, a1)].map(p => p.join(',')).join(' '); stones += `<polygon points="${pts}" fill="#c9c1ad" stroke="#7d7461" stroke-width="2"/>`; }
    const k0 = Math.PI - 4 * Math.PI / N, k1 = Math.PI - 5 * Math.PI / N;
    const kp = [P(r1, k0), P(r2, k0), P(r2, k1), P(r1, k1)];
    const top = [kp[1], kp[2]], bot = [kp[0], kp[3]], bw = bot[1][0] - bot[0][0], tw = top[1][0] - top[0][0], yT = top[0][1], yB = bot[0][1];
    const shapes = {
      wedge: kp.map(p => p.join(',')).join(' '),
      rect: [[cx - bw / 2 + 3, yT], [cx + bw / 2 - 3, yT], [cx + bw / 2 - 3, yB], [cx - bw / 2 + 3, yB]].map(p => p.join(',')).join(' '),
      inv: [[cx - bw / 2 + 6, yT], [cx + bw / 2 - 6, yT], [cx + tw / 2, yB], [cx - tw / 2, yB]].map(p => p.join(',')).join(' ')
    };
    const stage = el('div', 'v3-stage'); api.body.appendChild(stage);
    const board = V3.board(stage, 600 / 330);
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 600 330"><defs><marker id="v3ar2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#4d8a3a"/></marker></defs>
      <rect width="600" height="330" fill="#eaf2f5"/><rect y="250" width="600" height="80" fill="#9cc5dc"/><rect x="0" y="250" width="135" height="80" fill="#a99f86"/><rect x="465" y="250" width="135" height="80" fill="#a99f86"/>
      <g data-k="arch" style="transition:transform .6s;transform-origin:300px 250px">${stones}</g>
      <polygon data-k="key" points="" fill="#e99a45" stroke="#9a5a17" stroke-width="2" style="transition:transform .9s cubic-bezier(.5,0,1,1)"/>
      <polygon data-k="gap" points="${shapes.wedge}" fill="none" stroke="#d9822b" stroke-width="2" stroke-dasharray="6 5"/>
      <g data-k="w" style="transition:transform .3s"><rect x="${cx - 40}" y="40" width="80" height="0" fill="#6b6672" rx="4"/></g>
      <g data-k="flow" opacity="0" stroke="#4d8a3a" stroke-width="5" fill="none" marker-end="url(#v3ar2)"><path d="M285,72 Q190,95 150,240"/><path d="M315,72 Q410,95 450,240"/></g>
    </svg>`;
    const q = (k) => board.querySelector(`[data-k=${k}]`);
    const ctrl = el('div', 'v3-row'); api.body.appendChild(ctrl);
    const pick = el('div', 'v3-row'); ctrl.appendChild(pick);
    const sh = (pts, w = 52, h = 40) => `<svg width="${w}" height="${h}" viewBox="${cx - 30} ${yT - 4} 60 ${yB - yT + 8}"><polygon points="${pts}" fill="#e99a45" stroke="#9a5a17" stroke-width="2"/></svg>`;
    const opts = [['rect', '네모난 돌'], ['inv', '아래가 넓은 돌'], ['wedge', '위가 넓은 쐐기돌']];
    let stone = null, broken = false, n = 0;
    const btns = V3.shuffle(opts).map(([id, t]) => { const b = el('button', 'v3-btn', `${sh(shapes[id], 40, 30)}<br>${t}`); b.type = 'button'; b.style.lineHeight = '1.2'; b.addEventListener('click', () => { if (broken) return; stone = id; btns.forEach(x => x.classList.remove('on')); b.classList.add('on'); q('key').setAttribute('points', shapes[id]); q('gap').style.display = 'none'; range.value = 0; setW(0); range.disabled = false; api.hint('이제 아래 막대를 오른쪽으로 밀어 무게를 올려 보세요.'); }); b.dataset.id = id; pick.appendChild(b); return b; });
    const rw = el('label', 'v3-col', '<span class="v3-small">위에 올리는 무게</span>'); rw.style.minWidth = '200px'; rw.style.flex = '1'; ctrl.appendChild(rw);
    const range = el('input', 'v3-range'); range.type = 'range'; range.min = 0; range.max = 100; range.value = 0; range.disabled = true; rw.appendChild(range);
    const setW = (v) => { const r = q('w').querySelector('rect'); const h = 6 + v * 0.22; r.setAttribute('height', h); r.setAttribute('y', yT - h - 2); };
    const reset = api.button('↺ 다시 하기', '', () => { broken = false; q('arch').style.transform = ''; q('key').style.transform = ''; stone = null; q('key').setAttribute('points', ''); q('gap').style.display = ''; btns.forEach(x => x.classList.remove('on')); range.value = 0; range.disabled = true; setW(0); reset.style.display = 'none'; api.hint('다른 돌을 골라 보세요.'); });
    reset.style.display = 'none';
    api.progress(0, 2);
    range.addEventListener('input', () => {
      if (!stone || broken) return; const v = +range.value; setW(v);
      const limit = stone === 'rect' ? 35 : stone === 'inv' ? 12 : 999;
      if (v > limit) {
        broken = true; range.disabled = true; q('key').style.transform = 'translateY(260px)'; q('arch').style.transform = 'scaleY(.9) translateY(12px)'; reset.style.display = '';
        api.wrong(stone === 'rect' ? '네모난 돌은 양옆 돌 사이로 미끄러져 빠졌어요. 누를수록 더 꽉 끼는 모양이어야 해요.' : '아래가 넓은 돌은 누르면 바로 빠져요. 반대 모양을 생각해 보세요.', btns.find(b => b.dataset.id === 'wedge'));
      } else if (v >= 100 && stone === 'wedge') {
        range.disabled = true; q('flow').setAttribute('opacity', 1); api.progress(2, 2);
        api.hint('버텼어요! 쐐기돌이 양옆 돌을 밀어, 누르는 힘이 <b>아치를 따라 양쪽 땅</b>으로 전달돼요.', 'good'); api.finish('아치가 무게를 버텼어요!');
      } else if (stone === 'wedge' && v > 50 && n === 0) { n = 1; api.progress(1, 2); api.good('누를수록 쐐기돌이 더 꽉 끼고 있어요. 끝까지 올려 보세요!'); }
    });
  };

  // ---------------------------------------------------------------
  // 연구소 3 · 구조 형식 쌓기 실험 (가구식 · 조적식 · 일체식)
  // ---------------------------------------------------------------
  MS.approvalTrail = (c, done) => {
    const api = V3.frame(c, { id: 'approvalTrail', badge: '연구소 · 구조 형식', title: '구조 형식 쌓기 실험', guide: '세 칸에서 모형을 직접 만들어요. 다 만들면 주변 건물이 어떤 방식으로 지어졌는지 나누어 봐요.' }, done);
    const grid = el('div'); grid.style.cssText = 'flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px'; api.body.appendChild(grid);
    const panel = (t, d) => { const p = el('div', 'v3-col'); p.style.cssText = 'background:#f6f2e8;border:1px solid var(--line);border-radius:10px;padding:6px;min-height:0'; p.innerHTML = `<b style="text-align:center">${t}</b><div class="v3-small" style="text-align:center">${d}</div><div style="flex:1;min-height:0" data-k="svg"></div><div class="v3-row" data-k="btn"></div>`; grid.appendChild(p); return p; };
    const A = panel('① 가구식', '기둥 위에 보를 얹어요'), B = panel('② 조적식', '벽돌을 쌓아요'), Cc = panel('③ 일체식', '거푸집에 콘크리트를 부어요');
    const svgBox = (p, inner) => { p.querySelector('[data-k=svg]').innerHTML = `<svg class="v3-svg" viewBox="0 0 160 120">${inner}</svg>`; return p.querySelector('svg'); };
    const btn = (p, t, fn) => { const b = el('button', 'v3-btn', t); b.type = 'button'; b.addEventListener('click', fn); p.querySelector('[data-k=btn]').appendChild(b); return b; };
    let doneParts = 0; const markDone = (p) => { p.style.borderColor = '#4d8a3a'; p.style.background = '#f3f6e6'; doneParts++; api.progress(doneParts, 4); if (doneParts === 3) setTimeout(step2, 700); };
    api.progress(0, 4);
    // 가구식
    const sa = svgBox(A, `<rect y="108" width="160" height="12" fill="#b9a77f"/><rect x="30" y="40" width="12" height="68" fill="#a5733f"/><rect x="118" y="40" width="12" height="68" fill="#a5733f"/><rect data-k="beam" x="22" y="-30" width="116" height="12" fill="#8b5a2b" style="transition:transform .5s"/>`);
    const bA = btn(A, '보 얹기', () => { sa.querySelector('[data-k=beam]').style.transform = 'translateY(58px)'; bA.disabled = true; api.good('기둥 위에 보를 얹었어요. 기둥과 보를 짜 맞추는 방식이에요.'); markDone(A); });
    // 조적식
    let pattern = null;
    const sb = svgBox(B, `<rect y="108" width="160" height="12" fill="#b9a77f"/><g data-k="wall"></g>`);
    const drawWall = (stag) => { let s = ''; for (let r = 0; r < 6; r++) { const off = stag && r % 2 ? 12 : 0; for (let i = -1; i < 6; i++) { const x = 32 + off + i * 24; if (x < 32 || x + 24 > 132) { if (stag && r % 2 && (i === -1 || i === 4)) { const xx = Math.max(32, x), w = Math.min(132, x + 24) - xx; if (w > 0) s += `<rect class="b" data-c="${i}" x="${xx}" y="${96 - r * 12}" width="${w}" height="12" fill="#c4533d" stroke="#f6f2e8"/>`; } continue; } s += `<rect class="b" data-c="${i}" x="${x}" y="${96 - r * 12}" width="24" height="12" fill="#c4533d" stroke="#f6f2e8"/>`; } } sb.querySelector('[data-k=wall]').innerHTML = s; };
    const b1 = btn(B, '일자로 쌓기', () => { pattern = 'line'; drawWall(false); shake.disabled = false; }), b2 = btn(B, '엇갈려 쌓기', () => { pattern = 'stag'; drawWall(true); shake.disabled = false; });
    const shake = btn(B, '흔들기 시험', () => {
      const wall = sb.querySelector('[data-k=wall]');
      if (pattern === 'line') { wall.querySelectorAll('.b').forEach(r => { const c = +r.dataset.c; r.style.transition = 'transform .6s'; r.style.transform = `translate(${(c - 1.5) * 10}px,${c % 2 ? 8 : -2}px) rotate(${(c - 1.5) * 6}deg)`; }); api.wrong('일자로 쌓으면 벽돌 줄이 따로 놀아 흔들 때 갈라져요. 엇갈려 쌓아 보세요.', b2); setTimeout(() => drawWall(false), 1400); }
      else { wall.style.transition = 'transform .15s'; let k = 0; const t = setInterval(() => { wall.style.transform = `translateX(${k % 2 ? 3 : -3}px)`; if (++k > 6) { clearInterval(t); wall.style.transform = ''; } }, 120); api.good('엇갈려 쌓으니 벽돌이 서로 물려 흔들어도 버텨요!'); [b1, b2, shake].forEach(x => x.disabled = true); markDone(B); }
    }); shake.disabled = true;
    // 일체식
    let pour = 0;
    const sc = svgBox(Cc, `<rect y="108" width="160" height="12" fill="#b9a77f"/><g data-k="form"><rect x="36" y="28" width="6" height="80" fill="#d9b47a"/><rect x="118" y="28" width="6" height="80" fill="#d9b47a"/></g><g stroke="#6b6672" stroke-width="2"><path d="M60 30V106M80 30V106M100 30V106M44 50H116M44 80H116"/></g><rect data-k="con" x="42" y="108" width="76" height="0" fill="#a9a59c" opacity=".92"/>`);
    const bC = btn(Cc, '콘크리트 붓기', () => {
      pour++; const h = Math.min(80, pour * 27); const r = sc.querySelector('[data-k=con]'); r.setAttribute('y', 108 - h); r.setAttribute('height', h);
      if (pour >= 3) { bC.disabled = true; setTimeout(() => { sc.querySelector('[data-k=form]').style.opacity = 0; api.good('거푸집을 떼니 철근과 콘크리트가 한 덩어리가 되었어요.'); markDone(Cc); }, 500); }
      else api.hint(`철근을 감싸도록 콘크리트를 더 부어요. (${pour}/3)`);
    });
    // 2단계: 사례 분류
    function step2() {
      grid.innerHTML = ''; grid.style.gridTemplateRows = '1fr auto';
      api.guide('주변 건물 사진을 알맞은 구조 형식 칸에 놓아요.');
      const kinds = [['post-beam', '가구식', '한옥'], ['masonry', '조적식', '벽돌집'], ['monolithic', '일체식', '철근콘크리트 건물']];
      kinds.forEach(([id, t]) => { const s = el('div', 'v3-slot', `<b style="font-size:15px;color:var(--text)">${t}</b>`); s.dataset.slot = id; s.style.flexDirection = 'column'; grid.appendChild(s); });
      const tray = el('div', 'v3-tray'); tray.style.gridColumn = '1/-1'; grid.appendChild(tray);
      V3.shuffle(kinds).forEach(([id, , n]) => { const k = V3.cardEl(id, n, img('form/' + id + '.webp')); tray.appendChild(k); });
      let m = 0;
      V3.placer(api.wrap, (card, slot) => {
        if (card.dataset.card !== slot.dataset.slot) { V3.bounce(card); const k = kinds.find(x => x[0] === card.dataset.card); api.wrong(`${V3.j(k[2],'은')} ${k[1] === '가구식' ? '나무 기둥 위에 보를 짜 맞춰' : k[1] === '조적식' ? '벽돌을 쌓아' : '콘크리트를 부어 한 덩어리로'} 지었어요.`, grid.querySelector(`[data-slot="${card.dataset.card}"]`)); return; }
        card.classList.add('used'); slot.classList.add('filled'); slot.insertAdjacentHTML('beforeend', `<img src="${img('form/' + card.dataset.card + '.webp')}" style="width:100%;flex:1;min-height:0;object-fit:contain" alt="">`);
        if (++m === 3) { api.progress(4, 4); api.finish('구조 형식 세 가지를 알았어요!'); } else api.good('맞아요!');
      });
    }
  };

  // ---------------------------------------------------------------
  // 교량 · 다리 종류 도감 + 기존 트러스 설계 (시험 뒤 힘 색 표시)
  // ---------------------------------------------------------------
  const M = window.MINIGAMES, origBridge = M.createBridgeSimulator;
  window.__v3ForceColor = (A, B) => {
    const dy = Math.abs(A.y - B.y), dx = Math.abs(A.x - B.x);
    if (dy < 4) return Math.min(A.y, B.y) < 215 ? '#3f7fa8' : '#e0802a'; // 위 가로 부재는 압축, 아래 가로 부재는 인장
    if (dx < 4) return '#3f7fa8';
    const hi = A.y < B.y ? A : B, lo = A.y < B.y ? B : A;
    return Math.abs(lo.x - 360) < Math.abs(hi.x - 360) ? '#e0802a' : '#3f7fa8';
  };
  M.createBridgeSimulator = function (container, onComplete) {
    const api = V3.frame(container, { id: 'bridge', badge: '교량 · 다리의 종류', title: '다리 종류 도감', guide: '다리 그림을 눌러 다섯 가지 다리를 살펴봐요. 다 보면 트러스 다리 설계를 시작해요.' }, null);
    const types = [['beam', '보교', '기둥 위에 상판(보)을 걸친 가장 단순한 다리예요.'], ['arch', '아치교', '둥근 아치가 무게를 양쪽 땅으로 전해요.'], ['truss', '트러스교', '삼각형 부재로 상판을 받쳐 가볍고 튼튼해요.'], ['suspension', '현수교', '주탑 사이 큰 케이블에 상판을 매달아요.'], ['cable-stayed', '사장교', '주탑에서 비스듬한 케이블로 상판을 바로 당겨요.']];
    const big = el('div', 'v3-stage'); big.style.flexDirection = 'column'; api.body.appendChild(big);
    big.innerHTML = `<img data-k="pic" class="v3-img" style="flex:1;min-height:0" src="${img('bridges/beam.webp')}" alt=""><div data-k="cap" style="font-weight:800;margin-top:4px;text-align:center"></div>`;
    const row = el('div', 'v3-row'); api.body.appendChild(row);
    const seen = new Set(); api.progress(0, 5);
    const show = (t, b) => { big.querySelector('[data-k=pic]').src = img('bridges/' + t[0] + '.webp'); big.querySelector('[data-k=cap]').innerHTML = `<span style="color:#9a5a17">${t[1]}</span> · ${t[2]}`; row.querySelectorAll('.v3-btn').forEach(x => x.classList.remove('on')); b.classList.add('on'); seen.add(t[0]); api.progress(seen.size, 5); if (seen.size === 5) { go.disabled = false; api.good('다섯 가지 다리를 모두 봤어요. 이제 트러스 다리를 설계해요!'); } };
    types.forEach((t, i) => { const b = el('button', 'v3-btn', t[1]); b.type = 'button'; b.addEventListener('click', () => show(t, b)); row.appendChild(b); if (!i) setTimeout(() => show(t, b)); });
    const go = api.button('트러스 다리 설계 시작 ▶', 'primary', () => {
      origBridge.call(M, container, onComplete);
      const w = container.querySelector('.mg-wrap'); if (!w) return;
      w.style.background = 'var(--panel)'; w.style.borderColor = 'var(--line2)'; w.style.color = 'var(--text)';
      w.querySelectorAll('.mg-head, .mg-foot').forEach(x => { x.style.background = 'var(--panel2)'; x.style.borderColor = 'var(--line)'; });
      const cw = w.children[2]; if (cw) cw.style.background = '#e4dece';
      const g = w.children[1]; if (g) { g.style.background = '#f6f2e8'; g.style.color = 'var(--sub)'; g.style.borderColor = 'var(--line)'; }
      w.querySelectorAll('strong').forEach(x => { if (x.style.color) x.style.color = '#9a5a17'; });
      w.querySelectorAll('span[style*="0e1720"]').forEach(x => { x.style.background = '#fff8ea'; x.style.borderColor = '#e8cfa6'; x.style.color = '#9a5a17'; });
      // 시험 통과 문구가 나오면 힘 색 설명을 한 번만 덧붙인다 (글자 변화만 지켜봐서 무한 반복을 막는다)
      const fb = w.querySelector('[data-k=feedback]'); if (fb) new MutationObserver(() => { if (fb.textContent.includes('통과') && !fb.querySelector('.v3-legend')) { fb.style.color = '#4d8a3a'; fb.insertAdjacentHTML('beforeend', '<br><span class="v3-legend"><span style="color:#3f7fa8">■ 파랑: 누르는 힘(압축)</span> · <span style="color:#e0802a">■ 주황: 당기는 힘(인장)</span></span>'); } }).observe(fb, { childList: true });
    });
    go.disabled = true;
  };

  // ---------------------------------------------------------------
  // 주거 1 · 모눈 위에 입체 그리기 (등각투상도 → 사투상도)
  // ---------------------------------------------------------------
  MS.homePlan = (c, done) => {
    const api = V3.frame(c, { id: 'homePlan', badge: '주거 · 입체 그리기', title: '모눈 위에 입체 그리기', guide: '<b>점 하나를 누르고 다른 점을 누르면</b> 선이 그어져요. 블록 그림에서 빠진 모서리를 그려 완성해요.' }, done);
    const stage = el('div', 'v3-stage'); api.body.appendChild(stage);
    const C30 = Math.cos(Math.PI / 6), S = 34;
    let phase = 1;
    const isoP = ([x, y, z]) => [(x - y) * C30 * S, ((x + y) * 0.5 - z) * S];
    const isoEdges = [['0,0,2', '1,0,2'], ['1,0,2', '1,2,2'], ['1,2,2', '0,2,2'], ['0,2,2', '0,0,2'], ['1,0,2', '1,0,1'], ['1,2,1', '1,2,2'], ['1,0,1', '1,2,1'], ['0,2,0', '3,2,0'], ['3,2,0', '3,2,1'], ['3,2,1', '1,2,1'], ['0,2,2', '0,2,0'], ['1,0,1', '3,0,1'], ['3,0,1', '3,2,1'], ['3,0,0', '3,2,0'], ['3,0,0', '3,0,1']];
    const isoMissing = ['1,0,2|1,0,1', '3,0,1|3,2,1', '0,2,0|3,2,0'].map(m => m.split('|').sort().join('|'));
    const obl = ([x, z, d]) => [(x + d * 0.5) * S * 1.25, (-z - d * 0.5) * S * 1.25];
    const oblEdges = [['0,0,0', '3,0,0'], ['3,0,0', '3,1,0'], ['3,1,0', '1,1,0'], ['1,1,0', '1,2,0'], ['1,2,0', '0,2,0'], ['0,2,0', '0,0,0'], ['0,2,0', '0,2,2'], ['1,2,0', '1,2,2'], ['0,2,2', '1,2,2'], ['1,2,2', '1,1,2'], ['1,1,0', '1,1,2'], ['1,1,2', '3,1,2'], ['3,1,0', '3,1,2'], ['3,1,2', '3,0,2'], ['3,0,0', '3,0,2']];
    const oblMissing = ['3,1,0|3,1,2', '3,0,0|3,0,2'].map(m => m.split('|').sort().join('|'));
    let drawn = new Set(), sel = null;
    function build() {
      const isIso = phase === 1, proj = isIso ? isoP : obl, edges = isIso ? isoEdges : oblEdges, missing = isIso ? isoMissing : oblMissing;
      const k = (a, b) => [a, b].sort().join('|');
      const pts = []; edges.forEach(e => e.forEach(p => pts.push(proj(p.split(',').map(Number)))));
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const pad = 40, minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad, W = Math.max(...xs) - minX + pad, H = Math.max(...ys) - minY + pad;
      let dots = '';
      if (isIso) { for (let u = -4; u <= 5; u++) for (let v = -6; v <= 7; v++) { if ((u + v) % 2) continue; const x = u * C30 * S, y = v * 0.5 * S; if (x < minX || x > minX + W || y < minY || y > minY + H) continue; dots += `<circle cx="${x}" cy="${y}" r="3" fill="#b8ae95"/>`; } }
      else { for (let i = -2; i <= 10; i++) for (let j = -8; j <= 4; j++) { const x = i * 0.5 * S * 1.25, y = j * 0.5 * S * 1.25; if (x < minX || x > minX + W || y < minY || y > minY + H) continue; dots += `<circle cx="${x}" cy="${y}" r="3" fill="#b8ae95"/>`; } }
      const line = (a, b, col, w, extra = '') => { const [x1, y1] = proj(a.split(',').map(Number)), [x2, y2] = proj(b.split(',').map(Number)); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`; };
      let lines = ''; edges.forEach(([a, b]) => { const kk = k(a, b); if (missing.includes(kk) && !drawn.has(kk)) return; lines += line(a, b, missing.includes(kk) ? '#d9822b' : '#2a2833', 3.5); });
      const vtx = [...new Set(edges.flat())];
      let hits = ''; vtx.forEach(p => { const [x, y] = proj(p.split(',').map(Number)); hits += `<circle data-p="${p}" cx="${x}" cy="${y}" r="7" fill="${sel === p ? '#d9822b' : '#5d8aa8'}" stroke="#fff" stroke-width="2"/><circle data-p="${p}" cx="${x}" cy="${y}" r="15" fill="transparent" style="cursor:pointer"/>`; });
      stage.innerHTML = `<svg class="v3-svg" viewBox="${minX} ${minY} ${W} ${H}" style="max-height:100%"><rect x="${minX}" y="${minY}" width="${W}" height="${H}" fill="#fffdf7" rx="10"/>${dots}${lines}${hits}</svg>`;
      api.progress(drawn.size, missing.length);
      stage.querySelectorAll('[data-p]').forEach(h => h.addEventListener('click', () => {
        const p = h.dataset.p; if (!sel) { sel = p; build(); return; }
        if (sel === p) { sel = null; build(); return; }
        const kk = k(sel, p); sel = null;
        if (missing.includes(kk) && !drawn.has(kk)) { drawn.add(kk); api.good('모서리를 그렸어요!'); build(); if (drawn.size === missing.length) next(); return; }
        if (edges.some(e => k(e[0], e[1]) === kk)) { api.hint('그 선은 이미 있어요. 빈 곳을 찾아보세요.'); build(); return; }
        api.wrong(isIso ? '블록의 모서리가 아니에요. 등각투상도에서는 세로선과 30° 기울어진 선만 써요.' : '사투상도의 깊이 선은 모두 같은 방향(45°)으로 비스듬히 그려요.'); build();
      }));
    }
    function next() {
      if (phase === 1) { phase = 2; drawn = new Set(); api.guide('이번에는 같은 블록을 <b>사투상도</b>로 그려요. 정면은 그대로 두고, 비스듬한 <b>깊이 선 2개</b>를 더 그어요.'); api.hint('등각투상도 완성! 이제 사투상도예요.', 'good'); setTimeout(build, 600); return; }
      stage.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;height:100%;align-items:center">
        <div class="v3-col" style="align-items:center"><b>실제 블록</b><img class="v3-img" src="${window.__ASSETS__ ? window.__ASSETS__['assets/drawings/block-3d-model.png'] : ''}" style="max-height:30vh" alt=""></div>
        <div class="v3-col" style="align-items:center"><b>등각투상도</b><img class="v3-img" src="${img('drawings/isometric.webp')}" style="max-height:30vh" alt=""><span class="v3-small">세 모서리가 120°로 같아요</span></div>
        <div class="v3-col" style="align-items:center"><b>사투상도</b><img class="v3-img" src="${window.__ASSETS__ ? window.__ASSETS__['assets/drawings/projection-oblique.png'] : ''}" style="max-height:30vh" alt=""><span class="v3-small">정면은 그대로, 깊이는 비스듬히</span></div></div>`;
      api.progress(2, 2); api.finish('두 가지 입체 그림을 완성했어요!');
    }
    build();
  };

  // ---------------------------------------------------------------
  // 주거 2 · 정투상도 ↔ 블록 쌓기
  // ---------------------------------------------------------------
  MS.routePlan = (c, done) => {
    const api = V3.frame(c, { id: 'routePlan', badge: '주거 · 정투상도', title: '정투상도와 블록 쌓기', guide: '1단계: 세 도면을 <b>제3각법</b> 자리에 놓아요. 정면도를 가운데 두고 위에서 본 모습은 위에, 오른쪽에서 본 모습은 오른쪽에 놓아요.' }, done);
    const A = (k) => window.__ASSETS__ ? window.__ASSETS__[k] : k;
    const split = el('div', 'v3-split'); split.style.gridTemplateRows = '1fr'; split.style.gridTemplateColumns = '1fr 1.3fr'; api.body.appendChild(split);
    const left = el('div', 'v3-col'); left.style.cssText += 'align-items:center;justify-content:center;min-height:0'; split.appendChild(left);
    left.innerHTML = `<b>입체 모형</b><img class="v3-img" src="${A('assets/drawings/block-3d-model.png')}" style="max-height:32vh" alt="">`;
    const tray = el('div', 'v3-tray'); left.appendChild(tray);
    const views = [['top', '평면도', 'assets/drawings/view-top.png'], ['front', '정면도', 'assets/drawings/view-front.png'], ['side', '우측면도', 'assets/drawings/view-side.png']];
    V3.shuffle(views).forEach(([id, t, p]) => tray.appendChild(V3.cardEl(id, t, A(p))));
    const g = el('div'); g.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;min-height:0'; split.appendChild(g);
    const sl = {}; [['top', '1/2', '1/2'], ['front', '2/3', '1/2'], ['side', '2/3', '2/3']].forEach(([id, r, cc]) => { const s = el('div', 'v3-slot', '?'); s.dataset.slot = id; s.style.gridRow = r; s.style.gridColumn = cc; s.style.flexDirection = 'column'; g.appendChild(s); sl[id] = s; });
    let n = 0; api.progress(0, 2);
    const pl = V3.placer(api.wrap, (card, slot) => {
      if (phase !== 1) return;
      const v = views.find(x => x[0] === card.dataset.card);
      if (v[0] !== slot.dataset.slot) { V3.bounce(card); api.wrong(v[0] === 'top' ? '평면도는 위에서 본 모습이라 정면도의 위에 놓아요.' : v[0] === 'side' ? '우측면도는 오른쪽에서 본 모습이라 정면도의 오른쪽에 놓아요.' : '정면도가 기준이에요. 평면도 아래, 우측면도 왼쪽 자리예요.', sl[v[0]]); return; }
      card.classList.add('used'); slot.classList.add('filled'); slot.innerHTML = `<img src="${A(v[2])}" style="flex:1;min-height:0;max-width:100%;object-fit:contain" alt=""><b style="font-size:12.5px">${v[1]}</b>`;
      if (++n === 3) { api.progress(1, 2); api.good('제3각법 배치 완성!'); setTimeout(step2, 800); }
    });
    let phase = 1;
    function step2() {
      phase = 2; api.body.innerHTML = '';
      api.guide('2단계: 왼쪽 <b>3면도</b>를 보고 오른쪽 바닥 칸을 눌러 블록을 쌓아요. 한 번 누를 때마다 한 층씩 올라가요(4번째는 0층).');
      const target = [[1, 0, 0], [2, 1, 0], [3, 2, 1]];
      let h = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      const viewsOf = (m) => ({ front: [0, 1, 2].map(cc => Math.max(m[0][cc], m[1][cc], m[2][cc])), top: m.map(r => r.map(v => v > 0 ? 1 : 0)), side: [2, 1, 0].map(r => Math.max(...m[r])) });
      const colGrid = (cols, cls) => { let s = `<svg viewBox="0 0 66 66" style="width:100%;height:100%"><rect width="66" height="66" fill="#fffdf7"/>`; cols.forEach((v, i) => { for (let z = 0; z < v; z++) s += `<rect x="${3 + i * 20}" y="${63 - (z + 1) * 20}" width="20" height="20" fill="${cls}" stroke="#2a2833" stroke-width="1.5"/>`; }); return s + '</svg>'; };
      const topGrid = (m, cls) => { let s = `<svg viewBox="0 0 66 66" style="width:100%;height:100%"><rect width="66" height="66" fill="#fffdf7"/>`; m.forEach((r, ri) => r.forEach((v, ci) => { if (v) s += `<rect x="${3 + ci * 20}" y="${3 + ri * 20}" width="20" height="20" fill="${cls}" stroke="#2a2833" stroke-width="1.5"/>`; })); return s + '</svg>'; };
      const three = (vw, cls, title) => `<div class="v3-col" style="min-height:0;align-items:center"><b style="font-size:13px">${title}</b><div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4px;width:min(100%,24vh);aspect-ratio:1">
        <div data-v="top" style="border-radius:6px;overflow:hidden">${topGrid(vw.top, cls)}</div><div></div>
        <div data-v="front" style="border-radius:6px;overflow:hidden">${colGrid(vw.front, cls)}</div><div data-v="side" style="border-radius:6px;overflow:hidden">${colGrid(vw.side, cls)}</div></div>
        <div class="v3-small">위: 평면도 · 아래: 정면도, 우측면도</div></div>`;
      const wrapG = el('div'); wrapG.style.cssText = 'flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:center'; api.body.appendChild(wrapG);
      const tgt = el('div', '', three(viewsOf(target), '#e9c98f', '🎯 문제 3면도')); wrapG.appendChild(tgt);
      const base = el('div', 'v3-col'); base.style.alignItems = 'center'; wrapG.appendChild(base);
      const mine = el('div'); wrapG.appendChild(mine);
      const iso = (m) => { const S = 16, C = Math.cos(Math.PI / 6); let s = ''; const cube = (x, y, z) => { const p = (a, b, c) => `${(a - b) * C * S + 70},${((a + b) * 0.5 - c) * S + 70}`; s += `<polygon points="${p(x, y, z + 1)} ${p(x + 1, y, z + 1)} ${p(x + 1, y + 1, z + 1)} ${p(x, y + 1, z + 1)}" fill="#f2d49a" stroke="#6b5a3a"/><polygon points="${p(x + 1, y, z)} ${p(x + 1, y + 1, z)} ${p(x + 1, y + 1, z + 1)} ${p(x + 1, y, z + 1)}" fill="#c9a66b" stroke="#6b5a3a"/><polygon points="${p(x, y + 1, z)} ${p(x + 1, y + 1, z)} ${p(x + 1, y + 1, z + 1)} ${p(x, y + 1, z + 1)}" fill="#ddb97c" stroke="#6b5a3a"/>`; };
        for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < m[y][x]; z++) cube(x, y, z); return `<svg viewBox="0 0 140 150" style="width:100%;max-height:22vh">${s}</svg>`; };
      const draw = () => {
        base.innerHTML = `<b style="font-size:13px">🧱 바닥 칸 (뒤 ↑ · 앞 ↓)</b><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:min(100%,20vh)">${h.map((r, ri) => r.map((v, ci) => `<button type="button" data-c="${ri},${ci}" class="v3-btn" style="aspect-ratio:1;padding:0;font-size:18px;background:${v ? ['#fff', '#f2d49a', '#e2b86f', '#c9963f'][v] : '#fffdf7'}">${v || ''}</button>`).join('')).join('')}</div>${iso(h)}`;
        mine.innerHTML = three(viewsOf(h), '#a6c78a', '🔎 내가 쌓은 블록의 3면도');
        base.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { const [r, cc] = b.dataset.c.split(',').map(Number); h[r][cc] = (h[r][cc] + 1) % 4; draw(); }));
      };
      draw();
      api.button('비교하기', 'primary', () => {
        const a = viewsOf(target), b = viewsOf(h), bad = ['top', 'front', 'side'].filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
        if (!bad.length) { api.progress(2, 2); api.good('세 도면이 모두 같아요!'); api.clearButtons(); api.finish('3면도를 보고 입체를 만들었어요!'); return; }
        const name = { top: '평면도', front: '정면도', side: '우측면도' };
        bad.forEach(k => { const e = mine.querySelector(`[data-v=${k}]`); if (e) { e.style.outline = '3px solid #c4533d'; setTimeout(() => e.style.outline = '', 2500); } });
        api.wrong(`${V3.j(bad.map(k => name[k]).join(', '),'이')} 달라요. 빨간 테두리를 문제와 비교해 보세요.`, bad.map(k => tgt.querySelector(`[data-v=${k}]`)));
      });
    }
  };

  // ---------------------------------------------------------------
  // 주거 3 · 대피소 평면도 완성 (기호 5개 + 축척)
  // ---------------------------------------------------------------
  MS.shelterPlan = (c, done) => {
    const api = V3.frame(c, { id: 'shelterPlan', badge: '주거 · 평면도', title: '대피소 평면도 완성', guide: '벽에 뚫린 곳마다 <b>설명</b>을 읽고 알맞은 기호를 놓아요.', side: true }, done);
    const ops = [
      { id: 'win', x1: 110, y1: 40, x2: 210, y2: 40, tip: '햇빛과 바람이 들어와요', ans: 'window', sx: 26.7, sy: 10.5 },
      { id: 'main', x1: 120, y1: 340, x2: 210, y2: 340, tip: '넓은 현관, 양쪽으로 열어요', ans: 'double', sx: 27.5, sy: 89.5 },
      { id: 'room', x1: 300, y1: 90, x2: 300, y2: 145, tip: '방문, 한쪽으로 열고 닫아요', ans: 'swing', sx: 50, sy: 31 },
      { id: 'util', x1: 400, y1: 190, x2: 460, y2: 190, tip: '좁은 다용도실, 옆으로 밀어요', ans: 'slide', sx: 71.7, sy: 50 },
      { id: 'hole', x1: 560, y1: 240, x2: 560, y2: 300, tip: '실수로 뚫린 곳, 막아야 해요', ans: 'wall', sx: 91, sy: 71 }
    ];
    const syms = [['window', '창문'], ['double', '쌍여닫이문'], ['swing', '외여닫이문'], ['slide', '미닫이문'], ['wall', '벽']];
    const symSvg = (t) => ({ window: '<line x1="4" y1="10" x2="40" y2="10" stroke="#2a2833" stroke-width="2"/><line x1="4" y1="16" x2="40" y2="16" stroke="#2a2833" stroke-width="2"/><rect x="4" y="7" width="36" height="12" fill="none" stroke="#2a2833"/>', double: '<path d="M4,22 A18,18 0 0 1 22,4 M40,22 A18,18 0 0 0 22,4" fill="none" stroke="#2a2833" stroke-dasharray="3 2"/><line x1="4" y1="22" x2="4" y2="4" stroke="#2a2833" stroke-width="2"/><line x1="40" y1="22" x2="40" y2="4" stroke="#2a2833" stroke-width="2"/>', swing: '<path d="M8,22 A30,30 0 0 1 38,0" fill="none" stroke="#2a2833" stroke-dasharray="3 2"/><line x1="8" y1="22" x2="8" y2="0" stroke="#2a2833" stroke-width="2"/>', slide: '<line x1="4" y1="11" x2="26" y2="11" stroke="#2a2833" stroke-width="3"/><line x1="18" y1="16" x2="40" y2="16" stroke="#2a2833" stroke-width="3"/>', wall: '<rect x="4" y="8" width="36" height="10" fill="#2a2833"/>' })[t];
    const split = el('div', 'v3-split'); api.body.appendChild(split);
    const stage = el('div', 'v3-stage'); split.appendChild(stage);
    const board = V3.board(stage, 600 / 380);
    const W = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2a2833" stroke-width="10" stroke-linecap="square"/>`;
    board.innerHTML = `<svg class="v3-svg" viewBox="0 0 600 380"><rect width="600" height="380" fill="#fffdf7"/>
      ${W(40, 40, 110, 40)}${W(210, 40, 560, 40)}${W(40, 340, 120, 340)}${W(210, 340, 560, 340)}${W(40, 40, 40, 340)}${W(560, 40, 560, 240)}${W(560, 300, 560, 340)}
      ${W(300, 40, 300, 90)}${W(300, 145, 300, 340)}${W(300, 190, 400, 190)}${W(460, 190, 560, 190)}
      <text x="170" y="200" font-size="22" font-weight="800" fill="#b8ae95" text-anchor="middle">거실</text><text x="430" y="120" font-size="20" font-weight="800" fill="#b8ae95" text-anchor="middle">방</text><text x="430" y="275" font-size="18" font-weight="800" fill="#b8ae95" text-anchor="middle">다용도실</text>
      <rect x="320" y="60" width="60" height="34" fill="#e4dece" stroke="#b8ae95"/><text x="350" y="82" font-size="11" text-anchor="middle" fill="#6b6672">침대</text>
      <g data-k="placed"></g><g data-k="scale" opacity="0"><line x1="40" y1="365" x2="560" y2="365" stroke="#d9822b" stroke-width="2"/><line x1="40" y1="358" x2="40" y2="372" stroke="#d9822b" stroke-width="2"/><line x1="560" y1="358" x2="560" y2="372" stroke="#d9822b" stroke-width="2"/></g></svg>`;
    const slots = {}; ops.forEach(o => { const s = V3.slotAt(board, o.id, o.sx, o.sy, 19, 11, `<span style="font-size:11px;line-height:1.2">${o.tip}</span>`); s.style.background = 'rgba(255,243,223,.92)'; slots[o.id] = s; });
    const tray = el('div', 'v3-tray'); split.appendChild(tray);
    V3.shuffle(syms).forEach(([id, t]) => { const k = V3.cardEl(id, `<svg width="44" height="24" viewBox="0 0 44 24">${symSvg(id)}</svg> ${t}`); tray.appendChild(k); });
    const placed = board.querySelector('[data-k=placed]');
    const drawSym = (o, s) => {
      const v = o.x1 === o.x2, L = v ? o.y2 - o.y1 : o.x2 - o.x1;
      const tr = v ? `translate(${o.x1 - 5},${o.y1}) rotate(90) translate(0,-5) scale(${L / 44},1)` : `translate(${o.x1},${o.y1 - 13}) scale(${L / 44},1)`;
      let extra = '';
      if (s === 'swing') extra = `<path d="M300,145 A55,55 0 0 1 355,90" fill="none" stroke="#d9822b" stroke-width="2" stroke-dasharray="5 4"/>`;
      placed.insertAdjacentHTML('beforeend', `<g transform="${tr}">${symSvg(s).replace(/#2a2833/g, '#4d8a3a')}</g>${extra}`);
    };
    let n = 0; api.progress(0, 6);
    V3.placer(api.wrap, (card, slot) => {
      const o = ops.find(x => x.id === slot.dataset.slot); if (!o || slot.classList.contains('filled')) return;
      if (card.dataset.card !== o.ans) { V3.bounce(card); const t = syms.find(s => s[0] === o.ans)[1]; api.wrong(`'${o.tip}' 자리에는 다른 기호가 어울려요.`, [...tray.children].find(k => k.dataset.card === o.ans)); return; }
      card.classList.add('used'); slot.classList.add('filled'); slot.style.display = 'none'; drawSym(o, o.ans); api.progress(++n, 6); api.good(`${syms.find(s => s[0] === o.ans)[1]} 기호를 넣었어요.${o.ans === 'swing' ? ' 점선은 문이 열리는 길이에요. 침대와 부딪히지 않네요!' : ''}`);
      if (n === 5) scale();
    });
    function scale() {
      board.querySelector('[data-k=scale]').setAttribute('opacity', 1);
      tray.innerHTML = `<div class="v3-col" style="width:100%;text-align:center"><b>📏 축척 1:100</b><span class="v3-small">주황 자로 잰 대피소 가로 길이는 도면에서 <b>13cm</b>예요. 실제로는 몇 m일까요?</span><input class="v3-range" type="range" min="1" max="30" step="1" value="1" data-k="r"><b data-k="v" style="font-size:20px;color:#9a5a17">1 m</b><button type="button" class="v3-btn primary" data-k="ok">확인</button></div>`;
      const r = tray.querySelector('[data-k=r]'), v = tray.querySelector('[data-k=v]');
      r.addEventListener('input', () => v.textContent = r.value + ' m');
      tray.querySelector('[data-k=ok]').addEventListener('click', () => { if (+r.value === 13) { api.progress(6, 6); api.good('맞아요! 1:100이면 도면 1cm가 실제 100cm(1m)예요.'); api.finish('평면도를 완성했어요!'); } else api.wrong('1:100은 실제 길이를 100분의 1로 줄여 그린 거예요. 도면 1cm = 실제 1m.', r); });
    }
  };
})();
