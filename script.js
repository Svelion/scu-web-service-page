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
