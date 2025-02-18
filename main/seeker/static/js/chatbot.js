// Chatbot State
let isChatbotOpen = false;
let messages = [];
let isTyping = false;

// Quick Replies
const quickReplies = [
    { text: "Find sustainable homes", handler: () => handleQuickReply("I want to find sustainable homes") },
    { text: "Sustainability features", handler: () => handleQuickReply("What sustainability features do you offer?") },
    { text: "Price ranges", handler: () => handleQuickReply("What are the typical price ranges?") },
    { text: "Contact support", handler: () => handleQuickReply("I need help from support") }
];

// Common Responses
const responses = {
    greeting: [
        "Hello! How can I help you find your perfect sustainable home?",
        "Hi there! Looking for an eco-friendly home? I'm here to help!",
        "Welcome to Kudil! What kind of sustainable property are you looking for?"
    ],
    sustainabilityFeatures: [
        "Our properties feature various eco-friendly amenities including:",
        "• Solar panels for renewable energy",
        "• Rainwater harvesting systems",
        "• Energy-efficient appliances",
        "• Green building certification",
        "Would you like to see properties with specific sustainability features?"
    ],
    priceRanges: [
        "Our properties range from:",
        "• Budget-friendly: ₹10,000 - ₹25,000/month",
        "• Mid-range: ₹25,000 - ₹50,000/month",
        "• Premium: ₹50,000+/month",
        "What's your preferred budget range?"
    ],
    support: [
        "I'll connect you with our support team. In the meantime, you can:",
        "• Call us at: +91-XXXXXXXXXX",
        "• Email: support@kudil.com",
        "• Visit our Help Center",
        "A support representative will reach out to you shortly."
    ]
};

// Initialize Chatbot
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
    addQuickReplies();
});

function initializeChatbot() {
    // Add initial message
    addMessage({
        type: 'bot',
        content: "👋 Hi! I'm your Kudil Assistant. How can I help you find your perfect sustainable home?",
        time: new Date()
    });
}

function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    const notificationBadge = document.querySelector('.notification-badge');
    
    isChatbotOpen = !isChatbotOpen;
    chatbotContainer.style.display = isChatbotOpen ? 'flex' : 'none';
    
    // Hide notification badge when opened
    if (isChatbotOpen) {
        notificationBadge.style.display = 'none';
    }
}

function addQuickReplies() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.className = 'quick-replies';
    
    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm mb-2 me-2';
        button.textContent = reply.text;
        button.onclick = reply.handler;
        quickRepliesDiv.appendChild(button);
    });
    
    messagesContainer.appendChild(quickRepliesDiv);
}

function handleQuickReply(message) {
    sendMessage(message);
}

async function sendMessage(message = '') {
    if (isTyping) return;

    const input = document.getElementById('chatbotInput');
    const messageText = message || input.value.trim();
    
    if (!messageText) return;
    
    // Clear input
    input.value = '';

    // Add user message
    addMessage({
        type: 'user',
        content: messageText,
        time: new Date()
    });

    // Show typing indicator
    showTypingIndicator();

    // Process message and get response
    const response = await processMessage(messageText);

    // Hide typing indicator and add bot response
    hideTypingIndicator();
    addMessage({
        type: 'bot',
        content: response,
        time: new Date()
    });
}

function addMessage({ type, content, time }) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    // Create message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;
    
    // Create timestamp
    const timeSpan = document.createElement('small');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(time);
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeSpan);
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    isTyping = true;
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function processMessage(message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();

    // Check for different types of queries
    if (lowerMessage.includes('sustainable') || lowerMessage.includes('eco-friendly')) {
        return responses.sustainabilityFeatures.join('\n');
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
        return responses.priceRanges.join('\n');
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
        return responses.support.join('\n');
    } else {
        // Default response with property suggestions
        return `I found some properties that might interest you:
        
1. 🌿 Eco Apartment in Indiranagar
   • 3 BHK with solar panels
   • ₹45,000/month
   • Available immediately

2. 🌱 Green Villa in Whitefield
   • 4 BHK with rainwater harvesting
   • ₹65,000/month
   • Available from next month

Would you like to know more about any of these properties?`;
    }
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Event Listeners
document.getElementById('chatbotInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
