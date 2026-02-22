
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const msgEl = document.getElementById("msg");

function setMsg(text, isError = false) {
  if (!msgEl) return;
  msgEl.textContent = text;
  msgEl.style.color = isError ? "crimson" : "inherit";
}

document.getElementById("loginBtn").addEventListener("click", () => {
  const email = emailEl.value.trim();
  const password = passEl.value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "./index.html";
    })
    .catch((e) => {
      setMsg(e.message, true);
    });
});

document.getElementById("signupBtn").addEventListener("click", () => {
  const email = emailEl.value.trim();
  const password = passEl.value;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "./index.html";
    })
    .catch((e) => {
      setMsg(e.message, true);
    });
});

// already logged in? skip login page
auth.onAuthStateChanged((user) => {
  if (user) window.location.href = "./index.html";
});