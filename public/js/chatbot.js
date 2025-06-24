document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggler = document.querySelector('.chatbot-toggler');
    const chatbot = document.querySelector('.chatbot');
    const closeBtn = document.querySelector('.close-btn');
    const chatbox = document.querySelector('.chatbox');
    const textarea = document.querySelector('.chat-input textarea');
    const sendBtn = document.querySelector('.send-btn');

    if (!chatbotToggler || !chatbot || !closeBtn || !chatbox || !textarea || !sendBtn) {
        console.error('Chatbot elements not found');
        return;
    }

    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chatbot_session_id', sessionId);
    }

    // Toggle chatbot visibility
    function toggleChatbot() {
        document.body.classList.toggle('show-chatbot');
        if (document.body.classList.contains('show-chatbot')) {
            textarea.focus();
        }
    }

    // Add message to chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat ${isUser ? 'outgoing' : 'incoming'}`;
        
        if (!isUser) {
            messageDiv.innerHTML = `
                <div class="chat-icon">
                    <span>🤖</span>
                </div>
            `;
        }
        
        const p = document.createElement('p');
        p.textContent = content;
        messageDiv.appendChild(p);
        
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    // Send message to API
    async function sendMessage(message) {
        try {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<span>⏳</span>';
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            addMessage(data.response);
            
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<span>➤</span>';
        }
    }

    // Handle send button click
    function handleSend() {
        const message = textarea.value.trim();
        if (!message) return;

        addMessage(message, true);
        textarea.value = '';
        textarea.style.height = 'auto';
        
        sendMessage(message);
    }

    // Auto-resize textarea
    function autoResize() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    // Event listeners
    chatbotToggler.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);
    sendBtn.addEventListener('click', handleSend);
    
    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Close chatbot when clicking outside
    document.addEventListener('click', function(e) {
        if (document.body.classList.contains('show-chatbot') && 
            !chatbot.contains(e.target) && 
            !chatbotToggler.contains(e.target)) {
            toggleChatbot();
        }
    });
}); 