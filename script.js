const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if(e.key === "Enter") sendMessage(); });

function addMessage(sender, message) {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(p);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage('You', message);
    userInput.value = '';

    const typingMsg = document.createElement('p');
    typingMsg.innerHTML = `<strong>UniBot GPT:</strong> Typing...`;
    chatbox.appendChild(typingMsg);
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        typingMsg.innerHTML = `<strong>UniBot GPT:</strong> ${data.reply}`;
    } catch (err) {
        console.error(err);
        typingMsg.innerHTML = `<strong>UniBot GPT:</strong> ⚠️ Error connecting to server`;
    }
}
