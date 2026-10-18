// 5주차: 사용자 행동에 반응하는 웹페이지 (스터디 참여 신청 폼)

// 1. 필요한 HTML 요소 선택
const subscribeForm = document.querySelector("#join form");
const nameInput = document.querySelector("#student-name");
const emailInput = document.querySelector("#student-email");
const submitButton = subscribeForm ? subscribeForm.querySelector("button[type=submit]") : null;
const messageBox = document.createElement("p");
messageBox.setAttribute("id", "join-message");
messageBox.setAttribute("role", "status");

// 안내 문구를 표시할 영역을 폼 아래에 추가
if (subscribeForm && submitButton) {
  subscribeForm.appendChild(messageBox);
}

// 2. 폼 제출 시 함수 실행 연결
if (subscribeForm) {
  subscribeForm.addEventListener("submit", handleJoinSubmit);
}

// 입력값이 바뀌면 이전 안내 상태를 초기화
if (emailInput) {
  emailInput.addEventListener("input", resetJoinMessage);
}

function handleJoinSubmit(event) {
  // 5주차: 제출 직후 새로고침 방지
  event.preventDefault();

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";

  // 3. 입력값에 따라 다른 안내 문구 표시 (조건문 + 함수)
  if (name === "") {
    showJoinMessage("이름을 입력해 주세요.", "warn");
    return;
  }

  if (email === "" || !email.endsWith("@") && email.indexOf("@") < 1) {
    showJoinMessage("학교 이메일을 입력해 주세요.", "warn");
    return;
  }

  if (!isValidEmail(email)) {
    showJoinMessage("올바른 이메일 형식이 아닙니다. 예: student@university.ac.kr", "warn");
    return;
  }

  // 4. 처리 결과에 따라 문구 스타일과 버튼 상태 변경
  showJoinMessage(name + "님, 스터디 참여 신청이 완료되었습니다. (" + email + ")", "ok");
  submitButton.textContent = "신청 완료";
  submitButton.disabled = true;
  submitButton.classList.add("submitted");
}

function resetJoinMessage() {
  if (!submitButton.disabled) return;
  submitButton.disabled = false;
  submitButton.textContent = "스터디 참여 신청하기";
  submitButton.classList.remove("submitted");
  messageBox.textContent = "";
  messageBox.className = "";
}

// 간단한 이메일 형식 검사 함수
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// 안내 문구를 화면에 표시하는 함수
function showJoinMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = type === "ok" ? "message-ok" : "message-warn";
}

/* ===== 7주차: 사용자 흐름과 인터랙션 시나리오 구현 (스터디 모임 개설) =====
   흐름: 시작(1) - 정보 입력(2) - 일정 선택(3) - 확인(4) - 완료(5)
   [인터랙션 시나리오: 행동 - 이벤트 - 조건 - 화면 반응 - 다음 상태]
   1) "모임 개설 시작하기" 클릭 | click | 조건 없음 | 2단계 패널 표시 + 진행바 갱신 | 2단계
   2) "다음: 일정 선택" 클릭 | click | 모임이름 또는 소개 비어 있음 | 오류 문구 + 입력창 강조 | 2단계 유지
   3) "다음: 일정 선택" 클릭 | click | 필수값 모두 입력 | 3단계 패널 표시 | 3단계
   4) "다음: 확인" 클릭 | click | 과목 또는 요일 미선택 | 오류 문구 + 항목 강조 | 3단계 유지
   5) "다음: 확인" 클릭 | click | 과목/요일 선택됨 | 확인 화면에 입력값 요약 표시 | 4단계
   6) "수정하기" 클릭 | click | 조건 없음 | 이전 단계로 이동하되 값 유지 | 3단계 (값 보존)
   7) 확인 화면에서 값 수정 후 재진입 | input/change | - | 요약이 최신 값으로 갱신 | 4단계
   8) "개설 확정" 클릭 | click | 조건 없음 | 완료 화면 표시 + 모임 정보 표시 | 5단계 (완료)
   9) "다시 만들기" 클릭 | click | 조건 없음 | 모든 입력/선택/오류 초기화 | 1단계
*/

// 모임 개설 상태 저장 객체: 이전 단계로 돌아가도 값이 유지된다
const createState = { title: "", desc: "", subject: "", day: "", capacity: "" };

const createPanels = [1, 2, 3, 4, 5].map(function (n) {
  return document.getElementById("create-step-" + n);
});
const stepItems = document.querySelectorAll(".create-steps li");

// 단계 전환 함수: 패널과 진행 표시를 항상 같은 단계로 맞춘다
function showCreateStep(step) {
  createPanels.forEach(function (panel, idx) {
    panel.hidden = idx + 1 !== step;
  });
  stepItems.forEach(function (item) {
    const n = Number(item.getAttribute("data-step"));
    item.classList.toggle("active", n === step);
    item.classList.toggle("done", n < step);
  });
}

// 확인 화면 요약 갱신: 저장된 상태를 항상 다시 읽어 반영한다
function updateSummary() {
  document.getElementById("sum-title").textContent = createState.title;
  document.getElementById("sum-desc").textContent = createState.desc;
  document.getElementById("sum-subject").textContent = createState.subject;
  document.getElementById("sum-day").textContent = createState.day + "요일";
  document.getElementById("sum-capacity").textContent =
    createState.capacity ? createState.capacity + "명" : "미정";
}

// 필드별 오류 표시/해제
function showFieldError(guideId, inputEl, text, errorBox, errorText) {
  const guide = document.getElementById(guideId);
  if (guide) {
    guide.textContent = text;
    guide.hidden = false;
  }
  if (inputEl) inputEl.classList.add("field-error");
  if (errorBox) {
    errorBox.textContent = errorText;
    errorBox.hidden = false;
  }
}

function clearFieldErrors(guideIds, inputs, errorBox) {
  guideIds.forEach(function (id) {
    const guide = document.getElementById(id);
    if (guide) guide.hidden = true;
  });
  inputs.forEach(function (el) {
    if (el) el.classList.remove("field-error");
  });
  if (errorBox) errorBox.hidden = true;
}

// 1단계: 시작 버튼 - 2단계로 이동
const btnStart = document.getElementById("btn-create-start");
if (btnStart) {
  btnStart.addEventListener("click", function () {
    showCreateStep(2);
  });
}

// 2단계: 정보 입력
const titleInput = document.getElementById("create-title");
const descInput = document.getElementById("create-desc");
const errorBox2 = document.getElementById("error-step2");

if (titleInput) {
  titleInput.addEventListener("input", function () {
    createState.title = titleInput.value.trim();
    document.getElementById("guide-title").hidden = true;
    titleInput.classList.remove("field-error");
  });
}
if (descInput) {
  descInput.addEventListener("input", function () {
    createState.desc = descInput.value.trim();
    document.getElementById("guide-desc").hidden = true;
    descInput.classList.remove("field-error");
  });
}

const btnTo3 = document.getElementById("btn-to-3");
if (btnTo3) {
  btnTo3.addEventListener("click", function () {
    clearFieldErrors(["guide-title", "guide-desc"], [titleInput, descInput], errorBox2);

    // 조건 검사: 필수 입력이 비어 있으면 이동하지 않고 수정 방법을 안내한다
    if (createState.title === "") {
      showFieldError("guide-title", titleInput, "모임 이름을 입력해 주세요.", errorBox2, "모임 이름이 비어 있습니다. 위 입력창에 이름을 작성한 뒤 다시 눌러 주세요.");
      titleInput.focus();
      return;
    }
    if (createState.desc === "") {
      showFieldError("guide-desc", descInput, "한 줄 소개를 입력해 주세요.", errorBox2, "한 줄 소개가 비어 있습니다. 위 입력창에 소개를 작성한 뒤 다시 눌러 주세요.");
      descInput.focus();
      return;
    }
    showCreateStep(3);
  });
}

// 3단계: 일정 선택
const subjectSelect = document.getElementById("create-subject");
const capacityInput = document.getElementById("create-capacity");
const errorBox3 = document.getElementById("error-step3");

if (subjectSelect) {
  subjectSelect.addEventListener("change", function () {
    createState.subject = subjectSelect.value;
    document.getElementById("guide-subject").hidden = true;
    subjectSelect.classList.remove("field-error");
  });
}

// 요일 라디오 버튼: change 이벤트로 상태 저장
const dayRadios = document.querySelectorAll('input[name="create-day"]');
dayRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    if (radio.checked) {
      createState.day = radio.value;
      document.getElementById("guide-day").hidden = true;
      document.getElementById("guide-day").closest(".create-field").classList.remove("field-error");
    }
  });
});

if (capacityInput) {
  capacityInput.addEventListener("input", function () {
    createState.capacity = capacityInput.value;
  });
}

const btnTo4 = document.getElementById("btn-to-4");
if (btnTo4) {
  btnTo4.addEventListener("click", function () {
    clearFieldErrors(["guide-subject", "guide-day"], [subjectSelect], errorBox3);

    if (createState.subject === "") {
      showFieldError("guide-subject", subjectSelect, "주요 과목을 선택해 주세요.", errorBox3, "주요 과목이 선택되지 않았습니다. 목록에서 과목을 골라 주세요.");
      subjectSelect.focus();
      return;
    }
    if (createState.day === "") {
      const dayField = document.getElementById("guide-day");
      dayField.textContent = "모임 요일을 선택해 주세요.";
      dayField.hidden = false;
      dayField.closest(".create-field").classList.add("field-error");
      errorBox3.textContent = "모임 요일이 선택되지 않았습니다. 요일 버튼 중 하나를 눌러 주세요.";
      errorBox3.hidden = false;
      return;
    }
    // 확인 화면 진입 시 최신 값으로 갱신: 수정한 내용이 반영된다
    updateSummary();
    showCreateStep(4);
  });
}

// 이전/수정하기 버튼: 입력값을 지우지 않고 이동 (값 유지)
const backButtons = document.querySelectorAll(".btn-back");
backButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const target = Number(btn.getAttribute("data-back"));
    showCreateStep(target);
  });
});

// 5단계: 개설 확정 - 완료 화면 표시
const btnConfirm = document.getElementById("btn-confirm");
if (btnConfirm) {
  btnConfirm.addEventListener("click", function () {
    document.getElementById("done-title").textContent = createState.title;
    document.getElementById("done-detail").textContent =
      createState.subject + " 과목, 매주 " + createState.day + "요일, 인원 " +
      (createState.capacity ? createState.capacity + "명" : "미정");
    showCreateStep(5);
  });
}

// 다시 만들기: 입력, 선택, 오류, 진행 상태를 모두 초기화
const btnRestart = document.getElementById("btn-restart");
if (btnRestart) {
  btnRestart.addEventListener("click", function () {
    createState.title = "";
    createState.desc = "";
    createState.subject = "";
    createState.day = "";
    createState.capacity = "";
    if (titleInput) titleInput.value = "";
    if (descInput) descInput.value = "";
    if (subjectSelect) subjectSelect.value = "";
    if (capacityInput) capacityInput.value = "";
    dayRadios.forEach(function (radio) { radio.checked = false; });
    clearFieldErrors(
      ["guide-title", "guide-desc", "guide-subject", "guide-day"],
      [titleInput, descInput, subjectSelect],
      errorBox2
    );
    clearFieldErrors([], [], errorBox3);
    showCreateStep(1);
  });
}

/* ===== 6주차: 이벤트 처리와 동적 UI 구현 (스터디 가이드 탭) =====
   [이벤트 구현]
   - click  : 탭 버튼 클릭 시 선택 탭 전환 (문구·스타일·콘텐츠 동시 변경)
   - input  : 참여 신청 폼 입력 시 이전 안내 상태 초기화 (5주차, 유지)
   - change : 모임 개설의 과목 select, 요일 radio에서 선택값 저장 + 오류 해제 (7주차, 유지)
   [화면 변화: 두 가지 이상 동시 변경]
   - 탭 버튼: 활성 배경색/글자색 변경(스타일) + aria-selected 갱신
   - 탭 콘텐츠: 선택한 탭만 표시(문구 교체), 나머지는 숨김
*/

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const targetId = btn.getAttribute("data-tab");

    // 버튼 상태 변경: 선택된 탭만 active + aria-selected=true
    tabButtons.forEach(function (b) {
      const selected = b === btn;
      b.classList.toggle("active", selected);
      b.setAttribute("aria-selected", selected ? "true" : "false");
    });

    // 콘텐츠 전환: 선택된 탭의 패널만 표시
    tabPanels.forEach(function (panel) {
      panel.hidden = panel.id !== targetId;
    });
  });
});

/* ===== 중간시험: 완료한 모임을 목록에 저장하고 다시 보기/검색/취소 =====
   [7주차에서 추가된 새 행동]
   1) 개설 확정(5단계 완료) 시 모임이 "내 모임" 목록에 저장된다.
   2) 과목으로 목록을 찾아본다 → 결과가 없으면 "결과 없음" 안내와 다음 행동을 제공한다.
   3) 목록에서 모임을 다시 열어 정보를 확인하거나, 취소하여 상태를 되돌린다.
   [사용자 행동 → 조건 → 반응]
   - 개설 확정 | click | 4단계에서 개설 확정 | 완료 화면 + 목록에 카드 추가 | 5단계
   - "찾기" 클릭 | click | 선택한 과목의 모임이 있음 | 해당 카드만 표시 | 목록 갱신
   - "찾기" 클릭 | click | 선택한 과목의 모임이 없음 | "결과 없음" 안내 + 모임 개설 링크 | 목록 유지
   - "모임 취소" 클릭 | click | 확인 대화상자에서 확인 | 카드 제거 + 취소 안내 문구 | 목록 갱신
   - "모임 취소" 클릭 | click | 확인 대화상자에서 취소 | 아무 변화 없음 | 목록 유지
   - "다시 열기" 클릭 | click | 항목이 접힘 | 상세 정보 펼침/접힘 토글 | 카드 상태 갱신
   - 목록이 비어 있음 | - | 저장된 모임 0개 | 빈 상태 안내 + 개설 링크 | 초기 화면
*/

// 저장된 모임 목록 상태 (세션 동안 유지)
const myGroups = [];

const mylistBox = document.getElementById("mylist-items");
const mylistFilter = document.getElementById("mylist-filter");
const btnMylistSearch = document.getElementById("btn-mylist-search");

// 목록 렌더링: filter 값 또는 전체 표시
function renderMyGroups(filterSubject, showEmptyMessage) {
  if (!mylistBox) return;
  mylistBox.innerHTML = "";

  const visible = filterSubject
    ? myGroups.filter(function (g) { return g.subject === filterSubject; })
    : myGroups;

  // 목록이 아예 비어 있는 초기 상태
  if (myGroups.length === 0) {
    const empty = document.createElement("div");
    empty.className = "mylist-empty";
    empty.innerHTML = "아직 개설한 모임이 없습니다. <a href='#create'>모임 개설하러 가기</a>";
    mylistBox.appendChild(empty);
    return;
  }

  // 검색 결과가 없는 상태: 다음 행동을 안내한다
  if (visible.length === 0) {
    const none = document.createElement("div");
    none.className = "mylist-empty";
    none.innerHTML = "'" + filterSubject + "' 과목으로 개설한 모임이 없습니다. <a href='#create'>새로 개설하거나</a>, <button type='button' class='link-btn' id='btn-show-all'>전체 모임 보기</button>로 돌아가세요.";
    mylistBox.appendChild(none);
    const showAll = document.getElementById("btn-show-all");
    if (showAll) {
      showAll.addEventListener("click", function () {
        mylistFilter.value = "";
        renderMyGroups("", false);
      });
    }
    return;
  }

  visible.forEach(function (g, idx) {
    const card = document.createElement("article");
    card.className = "mygroup-card" + (g.canceled ? " canceled" : "");
    card.innerHTML =
      "<div class='mygroup-head'>" +
      "<h3>" + g.title + "</h3>" +
      "<span class='mygroup-status'>" + (g.canceled ? "취소됨" : "운영 중") + "</span>" +
      "</div>" +
      "<p class='mygroup-summary'>" + g.subject + " · " + g.day + "요일 · 인원 " + (g.capacity ? g.capacity + "명" : "미정") + "</p>" +
      "<div class='mygroup-actions'>" +
      "<button type='button' class='btn-toggle-detail' data-idx='" + idx + "'>" + (g.open ? "접기" : "자세히 보기") + "</button>" +
      (g.canceled ? "" : "<button type='button' class='btn-cancel-group' data-idx='" + idx + "'>모임 취소</button>") +
      "</div>" +
      "<div class='mygroup-detail' " + (g.open ? "" : "hidden") + ">" +
      "<dl><div><dt>한 줄 소개</dt><dd>" + g.desc + "</dd></div>" +
      "<div><dt>주요 과목</dt><dd>" + g.subject + "</dd></div>" +
      "<div><dt>모임 요일</dt><dd>" + g.day + "요일</dd></div>" +
      "<div><dt>모집 인원</dt><dd>" + (g.capacity ? g.capacity + "명" : "미정") + "</dd></div></dl>" +
      "</div>";
    mylistBox.appendChild(card);
  });

  // 자세히 보기 토글: 상세 정보 펼침/접힘
  mylistBox.querySelectorAll(".btn-toggle-detail").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const i = Number(btn.getAttribute("data-idx"));
      visible[i].open = !visible[i].open;
      renderMyGroups(filterSubject, false);
    });
  });

  // 모임 취소: 확인 후 상태 변경, 취소 시 되돌리기 제공
  mylistBox.querySelectorAll(".btn-cancel-group").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const i = Number(btn.getAttribute("data-idx"));
      const ok = window.confirm("'" + visible[i].title + "' 모임을 취소할까요? 취소 후 목록에서 상태가 변경됩니다.");
      if (!ok) return;
      visible[i].canceled = true;
      visible[i].open = true;
      renderMyGroups(filterSubject, false);
    });
  });
}

// 찾기 버튼: 선택한 과목으로 목록 필터링
if (btnMylistSearch) {
  btnMylistSearch.addEventListener("click", function () {
    renderMyGroups(mylistFilter.value, true);
  });
}

// 개설 확정 시 목록에 저장하도록 7주차 흐름에 연결
if (btnConfirm) {
  btnConfirm.addEventListener("click", function () {
    myGroups.push({
      title: createState.title,
      desc: createState.desc,
      subject: createState.subject,
      day: createState.day,
      capacity: createState.capacity,
      canceled: false,
      open: false
    });
    // 새 모임이 바로 보이도록 검색 조건을 전체로 되돌린다
    if (mylistFilter) mylistFilter.value = "";
    renderMyGroups("", false);
  });
}

// 초기 렌더링
renderMyGroups("", false);
