// Chatbot functionality
class KudilChatbot {
    constructor() {
        this.isOpen = false;
        this.initialize();
    }

    initialize() {
        // Get DOM elements
        this.toggleButton = document.getElementById('chatbot-toggle');
        this.container = document.getElementById('chatbot-container');
        
        // Add event listeners
        this.toggleButton.addEventListener('click', () => this.toggleChat());
        
        // Initialize chatbot UI
        this.initializeChatUI();
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('d-none');
        
        if (this.isOpen) {
            this.container.innerHTML = this.getChatHTML();
            this.initializeChatListeners();
        }
    }

    getChatHTML() {
        return `
            <div class="chat-header p-3 bg-primary text-white">
                <h5 class="m-0">Kudil Assistant</h5>
            </div>
            <div class="chat-messages p-3" id="chat-messages">
                <div class="message bot-message">
                    Hello! How can I help you today?
                </div>
            </div>
            <div class="chat-input p-3 border-top">
                <div class="input-group">
                    <input type="text" class="form-control" id="chat-input" 
                           placeholder="Type your message...">
                    <button class="btn btn-primary" id="send-message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }

    initializeChatListeners() {
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(input.value);
                input.value = '';
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage(input.value);
            input.value = '';
        });
    }

    sendMessage(message) {
        if (!message.trim()) return;

        const messagesContainer = document.getElementById('chat-messages');
        
        // Add user message
        messagesContainer.innerHTML += `
            <div class="message user-message">
                ${message}
            </div>
        `;

        // Simulate bot response (to be replaced with actual AI implementation)
        setTimeout(() => {
            messagesContainer.innerHTML += `
                <div class="message bot-message">
                    I'm a demo chatbot. The AI implementation will be added later.
                </div>
            `;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    initializeChatUI() {
        // Add chatbot styles
        const style = document.createElement('style');
        style.textContent = `
            .chat-messages {
                height: 350px;
                overflow-y: auto;
            }
            .message {
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 8px;
                max-width: 80%;
            }
            .bot-message {
                background: #f0f0f0;
                margin-right: auto;
            }
            .user-message {
                background: #2563eb;
                color: white;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KudilChatbot();
});
