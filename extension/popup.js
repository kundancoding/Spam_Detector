const checkBtn = document.getElementById("checkBtn");
const msgInput = document.getElementById("msgInput");
const labelEl = document.getElementById("label");
const explanationEl = document.getElementById("explanation");
const resultEl = document.getElementById("result");
const historyList = document.getElementById("historyList");
const emailsList = document.getElementById("emailsList");
const darkToggle = document.getElementById("darkToggle");

checkBtn.onclick = async () => {
  const message = msgInput.value.trim();
  if (!message) return alert("Please paste a message!");

  const response = await fetch("http://localhost:8000/detect", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  labelEl.innerText = `${data.label} (${(data.confidence * 100).toFixed(1)}%)`;
  explanationEl.innerText = data.explanation;
  emailsList.innerHTML = "";

  if (data.spam_emails && data.spam_emails.length > 0) {
    data.spam_emails.forEach(email => {
      const li = document.createElement("li");
      li.innerText = email;
      emailsList.appendChild(li);
    });
  }

  resultEl.classList.remove("hidden");
  saveToHistory(message, data.label);
};

function saveToHistory(text, result) {
  const entry = { text, result, time: new Date().toLocaleTimeString() };
  let history = JSON.parse(localStorage.getItem("history") || "[]");
  history.unshift(entry);
  history = history.slice(0, 10);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  history.forEach(h => {
    const li = document.createElement("li");
    li.innerText = `[${h.time}] ${h.result}: ${h.text.slice(0, 50)}...`;
    historyList.appendChild(li);
  });
}

darkToggle.onchange = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", darkToggle.checked ? "dark" : "light");
};

window.onload = () => {
  renderHistory();
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    darkToggle.checked = true;
    document.body.classList.add("dark");
  }
};