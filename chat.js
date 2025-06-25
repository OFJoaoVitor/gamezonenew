document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const friendNameElement = document.getElementById('chat-friend-name');
    const friendAvatarElement = document.getElementById('chat-friend-avatar');
    const messagesArea = document.getElementById('messages-area');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const chatListContainer = document.getElementById('chat-list-container');
    const noChatSelected = document.querySelector('.no-chat-selected');
    const fileInput = document.getElementById('chat-file-input');

    // --- BASE DE DADOS SIMULADA (a mesma de amigos.js) ---
    const allUsers = [
        { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Beto', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: 3, name: 'Carla', avatar: 'https://i.pravatar.cc/150?img=5' },
        { id: 4, name: 'Daniel', avatar: 'https://i.pravatar.cc/150?img=7' },
        { id: 5, name: 'Elena', avatar: 'https://i.pravatar.cc/150?img=9' },
        { id: 6, name: 'Fábio', avatar: 'https://i.pravatar.cc/150?img=11' }
    ];

    let myFriendsIds = [];
    let allChats = {};
    let currentFriendId = null;
    let fileToUpload = null;

    // --- FALAS GENÉRICAS DO AMIGO ---
    const genericReplies = [
        'Muito bacana, irmão!',
        'Uhm, interessante!',
        'Saquei! Boa ideia!',
        'Legal, cara!',
        'Entendi perfeitamente.',
        'Show de bola!',
        'Estou por aqui, pode falar!',
        'Pode crer!',
        'É isso aí!',
        'Gostei muito, de verdade.',
        'Valeu por compartilhar!',
        'Tô ligado!',
        'Fico feliz em saber disso.',
        'Que massa!',
        'Faz sentido o que você diz.'
    ];

    // --- FUNÇÕES ---

    function getFriendIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('friendId');
        return id ? Number(id) : null;
    }

    function loadData() {
        const storedFriends = localStorage.getItem('gamezone_friends');
        myFriendsIds = storedFriends ? JSON.parse(storedFriends) : [];

        const storedChats = localStorage.getItem('gamezone_chats');
        allChats = storedChats ? JSON.parse(storedChats) : {};
        
        // allUsers = JSON.parse(localStorage.getItem('gamezone_all_users') || '[]');
    }

    function saveChats() {
        localStorage.setItem('gamezone_chats', JSON.stringify(allChats));
    }

    function renderFriendList() {
        chatListContainer.innerHTML = '';
        const myFriends = allUsers.filter(user => myFriendsIds.includes(user.id));

        myFriends.forEach(friend => {
            const friendElement = document.createElement('a');
            friendElement.href = `chat.html?friendId=${friend.id}`;
            friendElement.className = 'chat-list-item';
            if (friend.id === currentFriendId) {
                friendElement.classList.add('active');
            }
            friendElement.innerHTML = `
                <img src="${friend.avatar}" alt="Avatar de ${friend.name}">
                <span>${friend.name}</span>
            `;
            chatListContainer.appendChild(friendElement);
        });
    }

    function renderMessages() {
        messagesArea.innerHTML = '';
        const conversation = allChats[String(currentFriendId)] || [];

        conversation.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', msg.sender);
            
            let mediaHTML = '';
            if (msg.fileData) {
                if (msg.fileType.startsWith('image/')) {
                    mediaHTML = `<div class="message-media"><img src="${msg.fileData}" alt="${msg.fileName}"></div>`;
                } else if (msg.fileType.startsWith('video/')) {
                    mediaHTML = `<div class="message-media"><video src="${msg.fileData}" controls></video></div>`;
                } else if (msg.fileType === 'application/pdf') {
                    mediaHTML = `<div class="message-media"><a href="${msg.fileData}" target="_blank" download="${msg.fileName}"><img src="./img/pdf-icon.png" alt="PDF Icon" class="file-icon"> ${msg.fileName}</a></div>`;
                } else {
                    mediaHTML = `<div class="message-media"><a href="${msg.fileData}" target="_blank" download="${msg.fileName}"><img src="./img/file-icon.png" alt="File Icon" class="file-icon"> ${msg.fileName}</a></div>`;
                }
            }

            messageElement.innerHTML = `
                <p>${msg.text}</p>
                ${mediaHTML}
                <span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            `;
            messagesArea.appendChild(messageElement);
        });

        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    
    function addMessage(text, file = null) {
        if (!text && !file || !currentFriendId) {
            if (!text && !file) console.log("CHAT.JS: Tentativa de enviar mensagem ou arquivo vazio.");
            return;
        }

        const newMessage = { 
            sender: 'me', 
            text: text, 
            timestamp: new Date().toISOString(),
            fileData: null, 
            fileName: null, 
            fileType: null 
        };

        const processAndSend = () => {
            if (!allChats[String(currentFriendId)]) {
                allChats[String(currentFriendId)] = [];
            }
            
            allChats[String(currentFriendId)].push(newMessage);
            saveChats();
            renderMessages();
            messageInput.value = '';
            fileInput.value = '';
            fileToUpload = null;
            messageInput.placeholder = 'Digite uma mensagem...';

            // CHAMA A FUNÇÃO DE RESPOSTA DO AMIGO APÓS ENVIAR SUA MENSAGEM
            setTimeout(() => {
                simulateFriendReply(currentFriendId);
            }, 1000); // Responde após 1 segundo (ajuste o tempo se quiser)
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newMessage.fileData = e.target.result;
                newMessage.fileName = file.name;
                newMessage.fileType = file.type;
                processAndSend();
            };
            reader.readAsDataURL(file);
        } else {
            processAndSend();
        }
    }

    // FUNÇÃO: Simula a resposta do amigo com falas aleatórias e TOCA O SOM
    function simulateFriendReply(friendId) {
        const randomReply = genericReplies[Math.floor(Math.random() * genericReplies.length)];

        const friendReply = {
            sender: 'friend',
            text: randomReply,
            timestamp: new Date().toISOString(),
            fileData: null,
            fileName: null,
            fileType: null
        };

        if (!allChats[String(friendId)]) {
            allChats[String(friendId)] = [];
        }
        allChats[String(friendId)].push(friendReply);
        saveChats();
        renderMessages();

        // TOCA O SOM DE NOTIFICAÇÃO SE A FUNÇÃO EXISTIR E ESTIVER ACESSÍVEL
        if (window.playNotificationSound) {
            console.log("CHAT.JS: Chamando window.playNotificationSound()");
            window.playNotificationSound();
        } else {
            console.warn("CHAT.JS: window.playNotificationSound não está definido. Verifique se notifications.js foi carregado corretamente E se a função está sendo exposta globalmente (window.playNotificationSound = ...).");
        }
    }

    function initializeChat() {
        loadData();
        currentFriendId = getFriendIdFromUrl();
        renderFriendList();

        const currentFriendData = allUsers.find(user => user.id === currentFriendId);

        if (currentFriendData) {
            if (noChatSelected) noChatSelected.style.display = 'none';
            friendNameElement.textContent = currentFriendData.name;
            friendAvatarElement.src = currentFriendData.avatar;
            messageForm.classList.remove('hidden');
            renderMessages();
        } else {
            friendNameElement.textContent = 'Selecione uma conversa';
            friendAvatarElement.src = './img/unnamed.jpg';
            messageForm.classList.add('hidden');
            if (noChatSelected) noChatSelected.style.display = 'block';
        }
    }
    
    initializeChat();

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileToUpload = fileInput.files[0];
            messageInput.placeholder = `Anexando: ${fileToUpload.name}`;
        } else {
            fileToUpload = null;
            messageInput.placeholder = 'Digite uma mensagem...';
        }
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addMessage(messageInput.value.trim(), fileToUpload);
    });
});