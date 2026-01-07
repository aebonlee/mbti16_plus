const AXES = {
  EI: { pos:"E", neg:"I", name:"외향(E) / 내향(I)" },
  SN: { pos:"S", neg:"N", name:"감각(S) / 직관(N)" },
  TF: { pos:"T", neg:"F", name:"사고(T) / 감정(F)" },
  JP: { pos:"J", neg:"P", name:"판단(J) / 인식(P)" },
  AO: { pos:"A", neg:"O", name:"결단(A) / 고민(O)" },
  HC: { pos:"H", neg:"C", name:"따뜻(H) / 고냉(C)" },
};

const state = {
  idx: 0,
  answers: Array(QUESTIONS.length).fill(null),
};

const elProgress = document.getElementById("progress");
const elQuestionArea = document.getElementById("questionArea");
const elPrev = document.getElementById("prevBtn");
const elNext = document.getElementById("nextBtn");
const elCard = document.getElementById("card");
const elResult = document.getElementById("result");

function render() {
  const q = QUESTIONS[state.idx];
  elProgress.textContent = `문항 ${state.idx + 1} / ${QUESTIONS.length}  ·  축: ${AXES[q.axis].name}`;

  const selected = state.answers[state.idx];

  elQuestionArea.innerHTML = `
    <div class="q-title">${escapeHtml(q.text)}</div>
    <div class="scale">
      ${SCALE.map(s => `
        <label>
          <input type="radio" name="ans" value="${s.value}" ${selected === s.value ? "checked" : ""}/>
          <span>${escapeHtml(s.label)}</span>
        </label>
      `).join("")}
    </div>
  `;

  elPrev.disabled = state.idx === 0;

  // 마지막 문항이면 "결과 보기"로
  if (state.idx === QUESTIONS.length - 1) {
    elNext.textContent = "결과 보기";
  } else {
    elNext.textContent = "다음";
  }
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function getSelectedValue(){
  const checked = document.querySelector('input[name="ans"]:checked');
  if (!checked) return null;
  return Number(checked.value);
}

function computeScores() {
  const scores = { EI:0, SN:0, TF:0, JP:0, AO:0, HC:0 };
  const maxAbs = { EI:0, SN:0, TF:0, JP:0, AO:0, HC:0 };

  for (let i=0;i<QUESTIONS.length;i++){
    const q = QUESTIONS[i];
    const ans = state.answers[i];

    // 응답 안 했으면 0점 처리(원하면 강제 응답으로 바꿔도 됨)
    const raw = (ans == null) ? 0 : (ans - 3); // -2..+2
    const delta = raw * q.dir;

    scores[q.axis] += delta;
    maxAbs[q.axis] += 2; // 문항 1개당 최대 절대값 2
  }

  return { scores, maxAbs };
}

function axisPercent(score, maxAbs) {
  if (maxAbs === 0) return 50;
  // score가 +면 pos쪽, -면 neg쪽
  // 50% 기준으로 최대 50%까지 이동
  const p = 50 + (score / maxAbs) * 50;
  return Math.max(0, Math.min(100, Math.round(p)));
}

function decideLetter(axisKey, score){
  const a = AXES[axisKey];
  return score >= 0 ? a.pos : a.neg;
}

function subtypeExplain(aLetter, hLetter){
  const ao = (aLetter === "A")
    ? "결정과 실행이 빠른 편(결단형)"
    : "리스크/타인을 고려하며 숙고가 길어질 수 있음(고민형)";

  const hc = (hLetter === "H")
    ? "표현이 비교적 따뜻하고 공감 시그널이 잘 드러남(따뜻형)"
    : "표현이 담백해서 차가워 보일 수 있으나 실질적 도움으로 배려하는 편(고냉형)";

  return `${ao} · ${hc}`;
}

function showResult() {
  const { scores, maxAbs } = computeScores();

  const mbti =
    decideLetter("EI", scores.EI) +
    decideLetter("SN", scores.SN) +
    decideLetter("TF", scores.TF) +
    decideLetter("JP", scores.JP);

  const extraA = decideLetter("AO", scores.AO); // A or O
  const extraH = decideLetter("HC", scores.HC); // H or C

  const fullType = `${mbti}-${extraA}${extraH}`;

  const rows = Object.keys(AXES).map(k => {
    const pctPos = axisPercent(scores[k], maxAbs[k]);
    const pctNeg = 100 - pctPos;
    const label = AXES[k].name;
    const pos = AXES[k].pos;
    const neg = AXES[k].neg;

    // "pos쪽 퍼센트"가 50보다 크면 pos 우세
    const lead = (pctPos >= 50) ? `${pos} 우세` : `${neg} 우세`;
    const conf = Math.abs(pctPos - 50) * 2; // 0~100 근사
    return { label, pos, neg, pctPos, pctNeg, lead, conf };
  });

  elCard.classList.add("hidden");
  elResult.classList.remove("hidden");

  elResult.innerHTML = `
    <h2 class="result-title">결과: ${escapeHtml(fullType)}</h2>
    <p class="small">${escapeHtml(subtypeExplain(extraA, extraH))}</p>

    <div class="kv">
      ${rows.map(r => `
        <div class="box">
          <div>${escapeHtml(r.label)}</div>
          <div class="small">
            ${r.pos}: ${r.pctPos}%  ·  ${r.neg}: ${r.pctNeg}%
            <br/>
            판정: ${escapeHtml(r.lead)}  ·  확신도(근사): ${r.conf}%
          </div>
        </div>
      `).join("")}
    </div>

    <div class="nav">
      <button id="restartBtn" class="btn ghost" type="button">다시 하기</button>
      <a class="btn" href="./" onclick="return false;" id="copyBtn">결과 복사</a>
    </div>

    <p class="small" style="margin-top:12px;">
      안내: 이 결과는 재미/자기성찰용 자가진단입니다. 삶의 중요한 의사결정(채용, 의료, 법률 등)에 단독 사용하지 마세요.
    </p>
  `;

  document.getElementById("restartBtn").addEventListener("click", () => {
    state.idx = 0;
    state.answers = Array(QUESTIONS.length).fill(null);
    elResult.classList.add("hidden");
    elCard.classList.remove("hidden");
    render();
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    const text = `MBTI 64형 간이 테스트 결과: ${fullType}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사했습니다.");
    } catch {
      alert("복사에 실패했습니다. 결과를 직접 선택해 복사해 주세요.");
    }
  });
}

elPrev.addEventListener("click", () => {
  const v = getSelectedValue();
  if (v != null) state.answers[state.idx] = v;
  state.idx = Math.max(0, state.idx - 1);
  render();
});

elNext.addEventListener("click", () => {
  const v = getSelectedValue();
  if (v == null) {
    alert("응답을 선택해 주세요.");
    return;
  }
  state.answers[state.idx] = v;

  if (state.idx === QUESTIONS.length - 1) {
    showResult();
  } else {
    state.idx += 1;
    render();
  }
});

render();
