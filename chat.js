var WEBHOOK_URL = 'https://n8n.promitray.com/webhook/c5c5c573-a393-4d7b-9b14-a15d2ba212d3';
var conversationHistory = [];

function addMsg(text, type) {
  var messages = document.getElementById('chatMessages');
  var div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  var messages = document.getElementById('chatMessages');
  var div = document.createElement('div');
  div.className = 'msg-typing';
  div.id = 'typing';
  div.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  var t = document.getElementById('typing');
  if (t) t.remove();
}

function sendMessage() {
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if (!text) return;
  input.value = '';

  conversationHistory.push({ role: 'user', content: text });
  addMsg(text, 'user');
  showTyping();

  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history: conversationHistory })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    removeTyping();
    var reply;
    if (Array.isArray(data) && data[0] && data[0].content && data[0].content[0]) {
      reply = data[0].content[0].text;
    } else if (data.content && data.content[0]) {
      reply = data.content[0].text;
    } else if (data.reply) {
      reply = data.reply;
    } else {
      reply = 'Thanks for your message!';
    }
    conversationHistory.push({ role: 'assistant', content: reply });
    addMsg(reply, 'bot');
  })
  .catch(function() {
    removeTyping();
    addMsg('Sorry, something went wrong. Please try again.', 'bot');
  });
}
