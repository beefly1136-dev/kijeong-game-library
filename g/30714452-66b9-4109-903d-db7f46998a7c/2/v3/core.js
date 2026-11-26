/* 건설기술 탐험대 v3 · 공통 미션 틀, 끌어 놓기 도우미, 이야기·학습 내용 정리 */
(() => {
  const V3 = window.V3 = window.V3 || {};
  V3.missions = {};
  V3.img = (p) => 'assets/v3/' + p;
  V3.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // 받침에 따라 조사 고르기: V3.j('아파트','은') → '아파트는'
  V3.j = (w, p) => { w = String(w).replace(/<[^>]+>/g, ''); const ch = w.charCodeAt(w.length - 1); const has = ch >= 0xAC00 && ch <= 0xD7A3 && (ch - 0xAC00) % 28 > 0, rieul = has && (ch - 0xAC00) % 28 === 8; const t = { 은: ['은', '는'], 이: ['이', '가'], 을: ['을', '를'], 과: ['과', '와'], 으로: [rieul ? '로' : '으로', '로'] }[p]; return w + (has ? t[0] : t[1]); };
  V3.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const mistake = () => { if (typeof window.__recordMgMistake === 'function') window.__recordMgMistake(); };

  // 탐험 수첩: 미션을 마치면 쌓이는 한 줄 정리
  V3.NOTES = {
    signal: '건축 구조물은 사람이 생활하고 일하는 건물, 토목 구조물은 도로·다리·댐처럼 생활의 바탕이 되는 시설이에요.',
    safetyLog: '유지관리는 점검(상태 살피기), 보수(원래대로 고치기), 보강(더 튼튼하게 하기)으로 구조물을 오래 안전하게 쓰는 일이에요.',
    restoreLog: '구조물은 고정 하중, 적재 하중, 풍하중, 적설 하중, 지진 하중을 받고, 이 힘은 모두 기초를 거쳐 땅으로 전달돼요.',
    historyRecord: '건설 재료는 흙·나무 → 돌 → 목재 → 강철 → 철근콘크리트로 발달하며 더 크고 높은 구조물을 만들 수 있게 되었어요.',
    bridgeDesign: '아치는 위가 넓은 쐐기돌이 양옆 돌을 밀어, 누르는 힘을 양쪽 땅으로 나누어 전달해요.',
    approvalTrail: '가구식은 기둥 위에 보를 얹고, 조적식은 벽돌을 엇갈려 쌓고, 일체식은 거푸집에 콘크리트를 부어 한 덩어리로 만들어요.',
    bridge: '트러스는 삼각형으로 부재를 이어 모양이 쉽게 변하지 않고, 부재가 누르는 힘(압축)과 당기는 힘(인장)을 나누어 받아요.',
    homePlan: '등각투상도는 세 모서리가 120°로 같은 각도를 이루고, 사투상도는 정면을 실제 모양대로 그리고 깊이만 비스듬히 그려요.',
    routePlan: '제3각법에서는 정면도 위에 평면도, 정면도 오른쪽에 우측면도를 놓아요.',
    shelterPlan: '평면도는 약속된 기호로 벽·창문·문을 나타내고, 1:100 축척에서는 도면 1cm가 실제 1m예요.',
    materialsLog: '보가 휘면 위는 눌리고 아래는 당겨져요. 콘크리트는 누르는 힘에, 철근은 당기는 힘에 강해서 철근을 아래쪽에 넣어요.',
    equipmentLog: '굴착기는 땅을 파고, 로드롤러는 땅을 다지고, 콘크리트 펌프카는 콘크리트를 보내고, 타워크레인은 자재를 들어 올려요.',
    processLog: '건설은 기획 → 설계 → 시공 → 유지관리 순서이고, 시공은 가설 공사 → 토공사 → 기초 공사 → 골조 공사 → 마감 공사 순서로 해요.',
    floodMark: '제방, 저류지, 강변 습지, 배수 펌프장 같은 토목 구조물이 함께 홍수 피해를 줄여요.',
    inspectionGap: '내진은 튼튼하게 버티고, 제진은 흔들림을 흡수하고, 면진은 땅의 흔들림이 건물에 덜 전해지게 해요.',
    evacuationMap: '건물은 기초·기둥·보·바닥·벽·지붕으로 이루어지고, 지붕에서 기초까지 힘이 차례로 전달돼요.',
    powerPlan: '제로에너지 건축은 단열로 쓰는 에너지를 줄이고, 태양광으로 에너지를 만들어 둘을 맞춘 건축이에요.',
    waterPlan: '투수성 포장, 빗물 정원, 옥상 녹화, 지하 저류조는 빗물이 스며들고 머물게 해 도시 홍수를 줄여요.',
    greenPlan: '드론 점검, 모듈러 건축, BIM·디지털 트윈, 3D 프린팅 건축은 더 안전하고 빠르고 정확하게 짓는 스마트 건설기술이에요.',
    final: '기술마다 장점이 달라서, 장소에 맞는 기술을 이유를 가지고 고르는 것이 좋은 건설 계획이에요.'
  };

  // ---------------------------------------------------------------
  // 공통 미션 틀: 머리말 · 안내 · 활동 · 힌트와 버튼 · 끝나면 한 줄 정리
  // ---------------------------------------------------------------
  V3.frame = (container, cfg, onComplete) => {
    container.innerHTML = '';
    const wrap = V3.el('div', 'v3-mg mg-wrap' + (cfg.side ? ' v3-sideable' : ''));
    wrap.style.position = 'relative';
    wrap.innerHTML = `
      <div class="v3-head mg-head"><span class="v3-badge">${cfg.badge}</span><strong class="v3-title">${cfg.title}</strong><span class="v3-prog"></span></div>
      <div class="v3-guide">${cfg.guide}</div>
      <div class="v3-body"></div>
      <div class="v3-foot mg-foot"><div class="v3-hint">${cfg.start || '해 보면서 알아봐요.'}</div><span class="v3-extra"></span></div>
      <div class="v3-done"><div class="box"><div class="k">✓ 탐험 수첩에 기록했어요</div><div class="t"></div><div class="note"></div><button type="button" class="v3-btn ok">단서 기록하고 돌아가기</button></div></div>`;
    container.appendChild(wrap);
    const q = (s) => wrap.querySelector(s);
    const body = q('.v3-body'), hintEl = q('.v3-hint'), progEl = q('.v3-prog'), extra = q('.v3-extra'), guideEl = q('.v3-guide');
    let wrongCount = 0, finished = false;
    const api = {
      wrap, body, extra,
      guide: (html) => { guideEl.innerHTML = html; },
      progress: (cur, max) => { progEl.textContent = max ? `${cur} / ${max}` : cur; progEl.style.display = ''; },
      hint: (msg, kind) => { hintEl.innerHTML = msg; hintEl.className = 'v3-hint' + (kind ? ' ' + kind : ''); },
      // 틀렸을 때: 왜 틀렸는지 한 줄, 두 번째부터 정답 자리를 빛내 준다
      wrong: (msg, glowEls) => {
        wrongCount++; mistake();
        api.hint('🤔 ' + msg, 'bad');
        if (wrongCount >= 2 && glowEls) [].concat(glowEls).filter(Boolean).forEach(g => { g.classList.add('v3-glow'); setTimeout(() => g.classList.remove('v3-glow'), 4000); });
      },
      good: (msg) => api.hint('👍 ' + msg, 'good'),
      resetWrong: () => { wrongCount = 0; },
      button: (label, cls, fn) => { const b = V3.el('button', 'v3-btn ' + (cls || ''), label); b.type = 'button'; b.addEventListener('click', fn); extra.appendChild(b); return b; },
      clearButtons: () => { extra.innerHTML = ''; },
      finish: (title) => {
        if (finished) return; finished = true;
        q('.v3-done .t').textContent = title || '미션 완료!';
        q('.v3-done .note').innerHTML = '📒 ' + (V3.NOTES[cfg.id] || '');
        setTimeout(() => q('.v3-done').classList.add('show'), 500);
      }
    };
    q('.v3-done .v3-btn').addEventListener('click', () => { if (typeof onComplete === 'function') onComplete(); });
    progEl.style.display = 'none';
    return api;
  };

  // ---------------------------------------------------------------
  // 끌어 놓기 + 터치 두 번(카드 터치 → 칸 터치)
  // root 안의 [data-card] 를 [data-slot] 에 놓으면 drop(card, slot) 호출
  // ---------------------------------------------------------------
  V3.placer = (root, drop) => {
    let selected = null, drag = null;
    const slotAt = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.closest && root.contains(e) ? e.closest('[data-slot]') : null; };
    const unselect = () => { if (selected) selected.classList.remove('sel'); selected = null; root.querySelectorAll('.v3-slot.hot').forEach(s => s.classList.remove('hot')); };
    root.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('[data-card]');
      if (!card || card.classList.contains('used') || !root.contains(card)) return;
      e.preventDefault();
      drag = { card, x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.moved = true; unselect();
        const g = drag.card.cloneNode(true); g.classList.add('v3-ghost'); g.style.width = drag.card.offsetWidth + 'px'; document.body.appendChild(g); drag.ghost = g;
      }
      if (drag.moved) {
        drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
        root.querySelectorAll('.v3-slot.hot').forEach(s => s.classList.remove('hot'));
        const s = slotAt(e.clientX, e.clientY); if (s) s.classList.add('hot');
      }
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (d.ghost) d.ghost.remove();
      root.querySelectorAll('.v3-slot.hot').forEach(s => s.classList.remove('hot'));
      if (d.moved) { const s = slotAt(e.clientX, e.clientY); if (s) drop(d.card, s); return; }
      if (selected === d.card) { unselect(); return; }
      unselect(); selected = d.card; d.card.classList.add('sel');
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', (e) => { if (drag && drag.ghost) drag.ghost.remove(); drag = null; });
    root.addEventListener('click', (e) => {
      const s = e.target.closest('[data-slot]');
      if (!s || !selected || !root.contains(s)) return;
      const c = selected; unselect(); drop(c, s);
    });
    return { unselect };
  };
  V3.bounce = (card) => { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); };

  // ---------------------------------------------------------------
  // 이야기와 학습 내용 정리 (기록 ID는 저장 호환을 위해 그대로 둔다)
  // ---------------------------------------------------------------
  const C = window.GAME_CONTENT;
  if (C) {
    // 주영 = 건설 현장 책임자(노란 안전모), 수산 = 구조기술 연구원(실험복·고글)
    Object.assign(C.characters.jooyoung, { name: '주영', role: '건설 현장 책임자', color: '#d9822b' });
    Object.assign(C.characters.susan, { name: '수산', role: '구조기술 연구원', color: '#5d8aa8' });
    const R = C.records;
    const rec = (id, item, a, b, clue) => { if (R[id]) Object.assign(R[id], { item, pages: [a, b], clue }); };
    rec('signal', '도시 피해 지도', '【도시 피해 지도】\n무너지거나 멈춘 구조물들이 지도 위에 깜빡이고 있다.\n아파트, 학교, 다리, 댐… 종류가 다양하다.', '【현장 과제】\n구조물을 건축 구조물과 토목 구조물로 나누어\n알맞은 복구팀에 보내자.', '건물과 시설을 나누어 맡아야 복구가 빨라진다.');
    rec('safetyLog', '안전 점검표', '【본부 안전 점검표】\n본부 건물은 몇 달째 점검을 받지 못했다.\n벽과 천장 여기저기에 이상한 곳이 보인다.', '【현장 과제】\n점검이 필요한 곳 4곳을 찾아\n점검·보수·보강 중 알맞은 조치를 정하자.', '정기 점검이 몇 달 동안 이루어지지 않았다.');
    rec('restoreLog', '본부 구조 기록', '【본부 구조 기록】\n본부 건물이 어떤 힘을 받는지 적힌 기록이 지워져 있다.\n힘을 모르면 튼튼하게 다시 지을 수 없다.', '【현장 과제】\n건물이 받는 다섯 가지 힘(하중)을\n알맞은 자리에 붙여 보자.', '건물이 받는 힘을 따져 보지 않고 지었다.');
    rec('historyRecord', '건설기술 연표', '【건설기술 연표】\n옛날부터 오늘까지의 구조물 그림이 뒤섞여 있다.\n재료가 바뀌며 구조물도 달라졌다.', '【현장 과제】\n구조물 그림을 시대 순서로 놓고\n어떤 재료로 지었는지 확인하자.', '재료가 발달하며 더 크고 높은 구조물을 지을 수 있게 되었다.');
    rec('bridgeDesign', '돌다리 모형', '【옛 돌다리 모형】\n돌을 둥글게 쌓은 아치 다리 모형인데, 꼭대기 돌 하나가 빠져 있다.', '【현장 과제】\n꼭대기에 알맞은 돌을 끼우고\n무게를 올려 버티는지 실험하자.', '꼭대기 돌 하나가 아치 전체를 지탱한다.');
    rec('approvalTrail', '구조 형식 모형', '【구조 형식 모형 상자】\n기둥과 보, 벽돌, 거푸집이 섞여 있다.\n건물을 짓는 방식(구조 형식)을 알아보는 모형이다.', '【현장 과제】\n세 가지 방식으로 모형을 조립하고\n주변 건물이 어떤 방식인지 나누어 보자.', '짓는 방식에 따라 건물의 성질이 달라진다.');
    rec('homePlan', '입체 도면 연습장', '【입체 도면 연습장】\n블록을 그린 도면에 모서리가 몇 개 빠져 있다.\n이대로 읽으면 모양을 잘못 알 수 있다.', '【현장 과제】\n점과 점을 이어 빠진 모서리를 그리고\n등각투상도와 사투상도를 비교하자.', '도면이 덜 그려져 모양을 잘못 읽었다.');
    rec('routePlan', '3면도 설계판', '【3면도 설계판】\n정면도·평면도·우측면도가 엉뚱한 자리에 붙어 있다.', '【현장 과제】\n세 도면을 제3각법 자리에 놓고,\n3면도를 보고 블록을 쌓아 보자.', '3면도 자리가 뒤섞여 있었다.');
    rec('shelterPlan', '대피소 평면도', '【대피소 평면도】\n벽에 뚫린 곳마다 기호가 지워져 있다.\n출입문 기호가 빠져 비상 출입구가 제대로 만들어지지 않았다.', '【현장 과제】\n벽·창문·문 기호를 알맞게 넣고\n축척으로 실제 길이를 구하자.', '평면도에서 출입문 기호가 빠져 있었다.');
    rec('materialsLog', '철근콘크리트 보 시험체', '【철근콘크리트 보 시험체】\n금이 간 보가 시험기 위에 놓여 있다.\n검사표에는 철근 위치가 잘못되었다고 적혀 있다.', '【현장 과제】\n보를 눌러 휘게 해 보고\n철근을 어디에 넣어야 할지 찾자.', '철근이 엉뚱한 위치에 들어가 있었다.');
    rec('equipmentLog', '장비 작업 일지', '【장비 작업 일지】\n장비가 맡은 일과 다른 자리에서 일한 날이 많다.', '【현장 과제】\n공사 현장의 작업 자리에\n알맞은 건설 장비를 배치하자.', '장비가 맡은 일과 다른 작업에 쓰였다.');
    rec('processLog', '공정 기록판', '【공정 기록판】\n설계가 끝나기도 전에 공사를 시작한 기록이 남아 있다.', '【현장 과제】\n건설 과정과 시공 순서대로 카드를 놓아\n건물을 한 층씩 올려 보자.', '설계 확정 전에 시공을 서두른 기록이 있다.');
    rec('floodMark', '하천 수위 관측판', '【하천 수위 관측판】\n재난 당일 강물이 둑을 넘어 마을로 들어왔다.\n방재 시설은 계획만 있고 지어지지 않았다.', '【현장 과제】\n방재 시설 2개를 고르고 비를 내려\n마을이 안전한지 실험하자.', '홍수를 막을 방재 시설이 부족했다.');
    rec('inspectionGap', '지진 실험 모형', '【지진 실험 모형】\n같은 모양의 건물 모형 네 채가 흔들림 판 위에 놓여 있다.', '【현장 과제】\n세 가지 지진 대비 장치를 끼우고\n흔들림을 비교하자.', '지진에 대비한 장치가 없는 건물이 많았다.');
    rec('evacuationMap', '무너진 대피소', '【무너진 대피소】\n대피소가 무너져 부품만 흩어져 있다.\n부품마다 맡은 일이 있다.', '【현장 과제】\n기초부터 지붕까지 차례로 세우고\n부품이 하는 일을 연결하자.', '구조물 구성 요소를 제대로 갖추지 않아 무너졌다.');
    rec('powerPlan', '제로에너지 집 설계도', '【제로에너지 집 설계도】\n에너지를 많이 쓰는 낡은 집 설계도가 놓여 있다.', '【현장 과제】\n집에 부품을 붙여\n쓰는 에너지와 만드는 에너지를 맞추자.', '에너지를 아끼는 설계가 빠져 있었다.');
    rec('waterPlan', '빗물 관리 계획서', '【빗물 관리 계획서】\n도시 바닥 대부분이 아스팔트로 덮여 있다.\n빗물이 스며들 곳이 없어 도로가 빠르게 잠겼다.', '【현장 과제】\n바닥을 바꾸고 비를 내려\n물이 고이지 않는 도시를 만들자.', '빗물이 스며들 땅이 부족했다.');
    rec('greenPlan', '스마트 건설 고민 상자', '【스마트 건설 고민 상자】\n현장 사람들이 남긴 고민 쪽지가 가득하다.', '【현장 과제】\n고민마다 알맞은 스마트 건설기술을\n짝지어 주자.', '새 기술을 알맞게 쓰지 못했다.');
    const CL = C.clues;
    const clue = (id, title, source) => { if (CL[id]) Object.assign(CL[id], { title, source }); };
    clue('same-time-failures', '나누지 않은 복구팀', '도시 피해 지도'); clue('missing-inspections', '비어 있는 점검 날짜', '안전 점검표'); clue('missing-approvals', '따져 보지 않은 힘', '본부 구조 기록');
    clue('construction-history', '재료와 함께 변한 건설기술', '건설기술 연표'); clue('approval-gap', '건물마다 다른 짓는 방식', '구조 형식 모형');
    clue('housing-layout', '덜 그린 도면', '입체 도면 연습장'); clue('flood-risk', '지어지지 않은 방재 시설', '하천 수위 관측판'); clue('safety-gap', '지진 대비 장치가 없는 건물', '지진 실험 모형'); clue('evacuation-route', '빠진 구성 요소', '무너진 대피소');
    clue('distributed-power', '에너지를 낭비하는 집', '제로에너지 집 설계도'); clue('water-management', '스며들 곳 없는 빗물', '빗물 관리 계획서'); clue('green-network', '쓰지 못한 새 기술', '스마트 건설 고민 상자');
    const D = C.dialogue, say = (id, speaker, pages, choices) => { D[id] = Object.assign({}, D[id] || {}, { speaker, pages }, choices ? { choices } : {}); };
    say('opening', '나래', ['대장님! 큰 재난으로 미래도시 솔라리스의 건물과 다리가 많이 무너졌어요.\n도시를 다시 세우려면 건설기술을 차근차근 알아야 해요.', '먼저 복구 본부에서 피해 지도와 본부 건물을 살펴봐요.\n이 도시를 함께 다시 세워 봐요!']);
    say('naraActive', '나래', ['피해 지도, 안전 점검표, 본부 구조 기록을 조사해 주세요.\n세 가지를 마치면 윤미에게 보고해요!']);
    say('hubYunmi', '윤미', ['저는 도시 관리 AI 윤미예요. 건설기술은 구조물을 계획하고, 짓고, 오래 안전하게 관리하는 기술이에요.', '본부에서 기록 세 가지를 모아 주세요.']);
    say('hubReport', '윤미', ['기록을 모두 확인했어요. 복구팀을 나누지 않았고, 점검을 건너뛰었고, 건물이 받는 힘도 따져 보지 않았네요.', '연구소에 가면 건설기술이 어떻게 발달해 왔는지 알 수 있어요. 연구소 문을 열까요?'], ['기록을 정리한다', '조금 더 살펴본다']);
    say('hubAfter', '윤미', ['연구소에서 건설기술의 발달과 짓는 방식을 알아봐요.']);
    say('labIntro', '윤미', ['연구소에는 옛날 구조물부터 오늘날 구조물까지 자료가 있어요.', '연표, 돌다리 모형, 구조 형식 모형을 살펴봐 주세요.'], ['연구 기록을 찾는다', '나중에 결정한다']);
    say('labActive', '윤미', ['연표, 돌다리 모형, 구조 형식 모형을\n조사해 제게 알려 주세요.']);
    say('labReport', '윤미', ['좋아요! 재료가 발달하며 구조물이 달라졌고, 아치처럼 힘을 나누는 방법도 알았어요.', '이제 끊어진 다리로 가서 수산 연구원과 다리를 다시 설계해 주세요. 기록을 정리할까요?'], ['기록을 정리한다', '조금 더 살펴본다']);
    say('labAfter', '윤미', ['끊어진 연결로가 열렸어요. 구조기술 연구원 수산과 함께 트러스 다리를 설계해 주세요.']);
    say('bridgeArrival', '수산', ['나는 구조기술 연구원 수산이야. 15톤 구호 트럭이 건너가야 하는데 다리가 끊어졌어!\n상판만 걸쳐 놓으면 트럭 무게(하중)를 버티지 못해.', '먼저 여러 가지 다리를 살펴보고, 삼각형으로 받치는 트러스 다리를 설계해 줘!'], ['교량 설계를 시작한다', '잠시 둘러본다']);
    say('siteIntro', '주영', ['건설 현장 책임자 주영입니다. 솔라리스 건물들은 너무 서둘러 지어졌어요.', '철근, 장비, 공사 순서를 하나씩 바로잡아 주세요.'], ['시공 기록을 찾는다', '잠시 둘러본다']);
    say('siteActive', '주영', ['보 시험체, 장비 작업 일지, 공정 기록판을\n차례로 조사해 주세요.']);
    say('siteReport', '주영', ['철근 위치, 장비 배치, 공사 순서까지 바로잡았어요. 이제 제대로 지을 수 있겠어요.', '재난 대응 구역에서 그날 무슨 일이 있었는지 확인해 주세요.'], ['기록을 정리한다', '조금 더 살펴본다']);
    say('siteAfter', '주영', ['시공 기록을 정리했습니다. 재난 대응 구역에서 기정 담당자가 기다리고 있어요.']);
    say('safeIntro', '기정', ['재난안전 담당자 기정입니다. 그날 홍수와 지진이 함께 와서 대피소까지 무너졌어요.', '하천 관측판, 지진 실험 모형, 무너진 대피소를 살펴봐 주세요.'], ['방재 기록을 찾는다', '잠시 둘러본다']);
    say('safeActive', '기정', ['하천 관측판, 지진 실험 모형, 무너진 대피소를\n차례로 확인해 주세요.']);
    say('safeReport', '기정', ['방재 시설, 지진 대비 구조, 튼튼한 구성 요소까지… 미리 대비하면 피해를 크게 줄일 수 있어요.', '이제 미래도시 구역에서 더 나은 건설기술을 찾아봐요.'], ['기록을 정리한다', '조금 더 살펴본다']);
    say('ecoIntro', '윤미', ['미래도시 구역이에요. 에너지를 아끼고, 빗물을 머금고, 똑똑하게 짓는 기술을 알아봐요.', '기록 세 곳을 조사해 주세요.'], ['기술 기록을 찾는다', '잠시 둘러본다']);
    say('ecoActive', '윤미', ['제로에너지 집, 빗물 관리, 스마트 건설 기록을\n조사해 제게 알려 주세요.']);
    say('ecoReport', '윤미', ['좋아요! 에너지를 아끼는 집, 빗물이 스며드는 도시, 스마트 건설기술까지 모두 확인했어요.', '이제 최종 재건 구역에서 이 기술들로 도시를 다시 세울 차례예요.'], ['기록을 정리한다', '조금 더 살펴본다']);
    const M = C.missions;
    if (M.hub) Object.assign(M.hub, { title: '복구 본부 조사', objective: '본부 기록 3개를 모아 윤미에게 보고', progressCondition: '피해 지도·안전 점검·구조 기록 조사' });
    if (M.lab) Object.assign(M.lab, { title: '건설기술의 발달', objective: '연구 기록 3건을 모아 윤미에게 보고', progressCondition: '연표·돌다리·구조 형식 기록 조사' });
    if (M.site) Object.assign(M.site, { objective: '시공 기록 3건을 모아 주영에게 보고' });
    if (M.safe) Object.assign(M.safe, { objective: '안전 기록 3건을 모아 기정에게 보고', progressCondition: '홍수 방재·지진 대비·구성 요소 기록 조사' });
    if (M.eco) Object.assign(M.eco, { progressCondition: '제로에너지·빗물·스마트 건설 기록 조사' });
    if (M.final) Object.assign(M.final, { objective: '도시 네 구역에 알맞은 건설기술을 골라 도시를 다시 세우자', progressCondition: '구역마다 기술과 이유 고르기' });
  }
  // 확인 문제와 백과: 새 활동에 맞춘다 (ID는 그대로)
  const L = window.LEARNING_CONTENT;
  if (L) {
    const set = (id, o) => { const e = L.find(x => x.id === id); if (e) Object.assign(e, o); };
    set('construction-tech', { title: '건설기술과 구조물', body: '건설기술은 구조물을 계획하고 짓고 관리하는 기술이다. 건물처럼 사람이 생활하는 건축 구조물과, 도로·다리·댐처럼 생활의 바탕이 되는 토목 구조물이 있다.', question: '다음 중 토목 구조물은?', choices: ['댐', '아파트', '학교', '병원'], answer: '댐', feedback: '댐·다리·도로·터널·항만은 토목 구조물이다.' });
    set('disaster-recovery', { title: '하중의 종류', body: '구조물에 작용하는 힘을 하중이라 한다. 구조물 자체 무게(고정 하중), 사람·물건 무게(적재 하중), 바람(풍하중), 눈(적설 하중), 지진(지진 하중)이 있다.', question: '지붕에 쌓인 눈의 무게는 어떤 하중일까?', choices: ['적설 하중', '고정 하중', '풍하중', '지진 하중'], answer: '적설 하중', feedback: '눈이 쌓여 생기는 무게는 적설 하중이다.' });
    set('maintenance', { title: '내진·제진·면진', body: '내진은 구조를 튼튼하게 해 버티고, 제진은 흔들림을 흡수하는 장치를 달고, 면진은 고무 받침 등으로 땅의 흔들림이 건물에 덜 전해지게 한다.', question: '건물과 땅 사이에 고무 받침을 넣어 흔들림이 덜 전해지게 하는 방법은?', choices: ['면진', '내진', '제진', '조적'], answer: '면진', feedback: '면진은 땅의 흔들림을 건물과 떼어 놓는 방법이다.' });
    set('disaster-safety', { title: '구조물의 구성 요소', body: '건물은 기초·기둥·보·바닥·벽·지붕으로 이루어진다. 지붕과 바닥의 무게는 보와 기둥을 거쳐 기초로, 기초는 땅으로 힘을 전달한다.', question: '건물의 무게를 땅에 전달하는 부분은?', choices: ['기초', '지붕', '벽', '창문'], answer: '기초', feedback: '기초는 건물의 모든 무게를 받아 땅으로 전달한다.' });
    set('convergence', { title: '스마트 건설기술', body: '드론으로 위험한 곳을 점검하고, 공장에서 만든 모듈을 조립하고(모듈러), BIM·디지털 트윈으로 짓기 전에 문제를 찾고, 3D 프린터로 곡선 벽을 만든다.', question: '공장에서 방 단위로 만들어 현장에서 조립해 공사 기간을 줄이는 기술은?', choices: ['모듈러 건축', '드론 점검', '투수성 포장', '로드롤러'], answer: '모듈러 건축', feedback: '모듈러 건축은 공장 생산으로 공사 기간을 줄인다.' });
    set('eco-city', { title: '지속 가능한 미래 건설', body: '단열과 태양광으로 에너지를 맞춘 제로에너지 건축, 빗물이 스며들게 하는 스펀지 시티는 환경을 생각한 미래 건설기술이다.', question: '쓰는 에너지를 줄이고 만드는 에너지로 채워 에너지 수지를 맞춘 건축은?', choices: ['제로에너지 건축', '조적식 건축', '가구식 건축', '임시 건축'], answer: '제로에너지 건축', feedback: '제로에너지 건축은 단열 + 신재생 에너지로 에너지를 스스로 채운다.' });
    L.push({ id: 'structure-form', map: 'lab', chapter: '1장 연구소', title: '구조 형식', body: '가구식은 기둥과 보를 짜 맞추고, 조적식은 벽돌·돌을 쌓고, 일체식은 철근콘크리트를 부어 한 덩어리로 만든다.', question: '벽돌을 엇갈려 쌓아 벽을 만드는 구조 형식은?', choices: ['조적식', '가구식', '일체식', '트러스'], answer: '조적식', feedback: '조적식은 벽돌이나 돌을 쌓아 만든다.' });
  }
})();
