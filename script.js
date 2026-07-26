document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Replace with your n8n webhook URL
    const webhookUrl = 'http://localhost:5678/webhook/Astral-Chatbot';

    function addMessage(content, sender, isImage = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        if (isImage) {
            // Create image element for bot image responses
            const img = document.createElement('img');
            img.src = content;
            img.alt = 'Generated image';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.marginTop = '8px';
            messageDiv.appendChild(img);
        } else {
            messageDiv.textContent = content;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage(message) {
        addMessage(message, 'user');
        userInput.value = '';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Handle different response types from n8n
                if (Array.isArray(data) && data.length > 0) {
                    const firstItem = data[0];
                    
                    // Check if it's an image generation request
                    if (firstItem.prompt && firstItem.category && !firstItem.skipImageGen) {
                        addMessage('Generating image...', 'bot');
                        // Note: You'll need to handle the actual image generation
                        // This is just a placeholder for the workflow
                        // The actual image URL would come from a subsequent response
                    }
                    // Handle text responses - Technical/Creative/Information categories
                    else if (firstItem.response) {
                        addMessage(firstItem.response, 'bot');
                    }
                    // Handle General category responses
                    else if (firstItem.output) {
                        addMessage(firstItem.output, 'bot');
                    }
                    // Handle image URL response (if your workflow returns the generated image)
                    else if (firstItem.imageUrl) {
                        addMessage(firstItem.imageUrl, 'bot', true);
                    }
                    else {
                        addMessage('Received response from bot', 'bot');
                    }
                } else {
                    // Fallback for non-array responses
                    addMessage(data.reply || data.output || 'No response from bot', 'bot');
                }
            } else {
                addMessage('Error: Unable to get response from bot', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error: Network issue', 'bot');
        }
    }

    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    });
});