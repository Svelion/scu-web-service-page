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
