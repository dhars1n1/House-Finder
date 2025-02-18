// Messages Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const messageInput = document.querySelector('.message-input input');
    const sendButton = document.querySelector('.message-input .btn');
    const messagesList = document.querySelector('.messages-list');
    const conversationItems = document.querySelectorAll('.conversation-item');

    // Handle sending messages
    function sendMessage(content) {
        if (!content.trim()) return;

        const messageTime = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const messageHTML = `
            <div class="message sent">
                <div class="message-content">
                    <p>${content}</p>
                    <span class="message-time">${messageTime}</span>
                </div>
            </div>
        `;

        messagesList.insertAdjacentHTML('beforeend', messageHTML);
        messagesList.scrollTop = messagesList.scrollHeight;
        messageInput.value = '';
    }

    // Send message on button click
    sendButton.addEventListener('click', () => {
        sendMessage(messageInput.value);
    });

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(messageInput.value);
        }
    });

    // Handle conversation selection
    conversationItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all conversations
            conversationItems.forEach(conv => conv.classList.remove('active'));
            // Add active class to clicked conversation
            item.classList.remove('unread');
            item.classList.add('active');
        });
    });

    // Auto-resize message input
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        conversationItems.forEach(item => {
            const name = item.querySelector('h6').textContent.toLowerCase();
            const message = item.querySelector('.last-message').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || message.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Initialize scrolling
    messagesList.scrollTop = messagesList.scrollHeight;

    // Handle mobile view
    function handleMobileView() {
        const conversationsList = document.querySelector('.conversations-list');
        const conversationView = document.querySelector('.conversation-view');
        
        if (window.innerWidth <= 992) {
            conversationItems.forEach(item => {
                item.addEventListener('click', () => {
                    conversationView.style.display = 'flex';
                    conversationsList.style.display = 'none';
                });
            });

            // Add back button in mobile view
            const backButton = document.createElement('button');
            backButton.className = 'btn btn-link d-lg-none mobile-back-btn';
            backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
            backButton.addEventListener('click', () => {
                conversationView.style.display = 'none';
                conversationsList.style.display = 'flex';
            });

            const conversationHeader = document.querySelector('.conversation-header');
            conversationHeader.insertBefore(backButton, conversationHeader.firstChild);
        }
    }

    // Initialize mobile view
    handleMobileView();
    window.addEventListener('resize', handleMobileView);
});
