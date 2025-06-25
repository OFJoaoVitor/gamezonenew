document.addEventListener('DOMContentLoaded', () => {

    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationCountBadge = document.querySelector('.notification-count');
    const notificationOverlay = document.getElementById('notification-overlay');
    const closeNotificationsBtn = document.getElementById('close-notifications-btn');
    const notificationList = document.getElementById('notification-list');
    const filterButtons = document.querySelectorAll('.notification-filters .filter-btn');

    let allNotifications = []; // Array que armazena todas as notificações (lidas e não lidas)
    let unreadCountBeforeOpening = 0;

    const notificationAudioElement = new Audio('./audio/notification.mp3');
    notificationAudioElement.load();
    let audioUnlocked = false;

    function unlockAudio() {
        if (!audioUnlocked) {
            notificationAudioElement.play()
                .then(() => {
                    notificationAudioElement.pause();
                    notificationAudioElement.currentTime = 0;
                    audioUnlocked = true;
                    console.log("AudioUnlocked: Áudio de notificação desbloqueado!");
                })
                .catch(error => {
                    console.warn("AudioUnlocked: Não foi possível desbloquear o áudio ainda (erro de autoplay):", error.message);
                });
        }
    }

    document.body.addEventListener('click', unlockAudio, { once: true, capture: true });
    document.body.addEventListener('touchstart', unlockAudio, { once: true, capture: true });


    function initializeNotifications() {
        const stored = localStorage.getItem('gamezone_notifications');
        allNotifications = stored ? JSON.parse(stored) : [];

        console.log("InitializeNotifications: Notificações carregadas:", allNotifications.length);

        // Roda a verificação de novas menções imediatamente
        checkForNewMentions();

        // Roda checkForNewMentions a cada 10 segundos para detectar novas notificações
        setInterval(checkForNewMentions, 10000);
    }

    function checkForNewMentions() {
        console.log("checkForNewMentions: Verificando novas menções...");
        const currentUserHandle = (localStorage.getItem('userHandle') || 'username').toLowerCase();
        const mentionTag = `@${currentUserHandle}`;

        const posts = JSON.parse(localStorage.getItem('gamezone_posts')) || [];
        const communities = JSON.parse(localStorage.getItem('gamezone_all_communities')) || [];

        let currentMentions = []; // Todas as menções encontradas AGORA nos dados brutos

        // Coleta todas as menções atuais em posts gerais
        posts.forEach(post => {
            const postContentLower = post.content.toLowerCase();
            if (postContentLower.includes(mentionTag)) {
                currentMentions.push({
                    id: `post-${post.id}`, // ID único da notificação
                    type: 'posts',
                    author: post.authorName,
                    authorAvatar: post.authorAvatar,
                    text: `mencionou você em um post: "${post.content.substring(0, 40)}..."`,
                    link: `./index.html#post-${post.id}`,
                    timestamp: post.timestamp
                });
            }
        });

        // Coleta todas as menções atuais em posts de comunidades
        communities.forEach(community => {
            (community.posts || []).forEach(post => {
                const postContentLower = post.content.toLowerCase();
                if (postContentLower.includes(mentionTag)) {
                    currentMentions.push({
                        id: `commpost-${post.id}`, // ID único da notificação
                        type: 'communities',
                        author: post.authorName,
                        authorAvatar: post.authorAvatar,
                        text: `mencionou você em #${community.name}: "${post.content.substring(0, 40)}..."`,
                        link: `./single-community.html?id=${community.id}#post-${post.id}`,
                        timestamp: post.timestamp
                    });
                }
            });
        });

        let soundShouldPlay = false;

        // Criar um mapa das notificações armazenadas para acesso rápido pelo ID
        const storedNotificationsMap = new Map(allNotifications.map(n => [n.id, n]));

        // NOVO: Array para armazenar o estado FINAL das notificações após esta verificação
        let updatedNotificationsList = [];

        currentMentions.forEach(mention => {
            const existingStoredNotif = storedNotificationsMap.get(mention.id);

            if (existingStoredNotif) {
                // Notificação já existe no nosso histórico.
                // Mantemos o estado de "lida" ou "não lida" que ela já tinha.
                updatedNotificationsList.push(existingStoredNotif);
            } else {
                // Notificação completamente nova, nunca vista antes
                soundShouldPlay = true; // Deve tocar o som
                updatedNotificationsList.push({ ...mention, read: false }); // Adiciona como nova e não lida
            }
        });

        // Agora, adicionar ao updatedNotificationsList as notificações que estavam em allNotifications
        // mas não foram encontradas em currentMentions (ou seja, menções que foram removidas do conteúdo original)
        // Essas notificações antigas devem permanecer como lidas.
        allNotifications.forEach(oldNotif => {
            if (!updatedNotificationsList.some(n => n.id === oldNotif.id)) {
                updatedNotificationsList.push({ ...oldNotif, read: true });
            }
        });

        // Garante que não haja duplicatas e ordena pela data mais recente
        const uniqueAndSortedNotifications = Array.from(new Map(updatedNotificationsList.map(n => [n.id, n])).values())
                                                   .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Atualiza o array global de notificações
        allNotifications = uniqueAndSortedNotifications;

        // Salva o novo estado de todas as notificações no localStorage
        saveNotifications();

        // Determina se o som deve tocar com base na flag 'soundShouldPlay'
        if (soundShouldPlay) {
            playNotificationSound();
            console.log("Notifications: Som disparado - Nova menção detectada.");
        } else {
            console.log("Notifications: Nenhuma nova menção para disparar som.");
        }

        // Sempre atualiza a UI do badge de contagem
        updateNotificationUI();
        console.log("checkForNewMentions: Notificações não lidas atuais:", allNotifications.filter(n => !n.read).length);
    }

    function saveNotifications() {
        localStorage.setItem('gamezone_notifications', JSON.stringify(allNotifications));
        console.log("Notifications: Salvas no localStorage. Total:", allNotifications.length);
    }

    function playNotificationSound() {
        if (audioUnlocked) {
            notificationAudioElement.currentTime = 0;
            notificationAudioElement.play().catch(error => {
                console.error("Notifications: Erro ao tocar som de notificação (após desbloqueio):", error);
            });
        } else {
            console.warn("Notifications: Tentativa de tocar som de notificação antes do áudio ser desbloqueado (interação necessária).");
        }
    }

    window.playNotificationSound = playNotificationSound;

    function updateNotificationUI(filter = 'all') {
        const unreadCount = allNotifications.filter(n => !n.read).length;
        unreadCountBeforeOpening = unreadCount;

        if (notificationCountBadge) {
            if (unreadCount > 0) {
                notificationCountBadge.textContent = unreadCount;
                notificationCountBadge.classList.remove('hidden');
            } else {
                notificationCountBadge.classList.add('hidden');
            }
        }

        if (notificationList) { // Verifica se o painel de notificação existe na página
            const filtered = allNotifications.filter(n => filter === 'all' || n.type === filter);

            notificationList.innerHTML = '';
            if (filtered.length === 0) {
                notificationList.innerHTML = '<li class="no-notifications">Nenhuma notificação por aqui.</li>';
            } else {
                filtered.forEach(notification => {
                    const item = document.createElement('a');
                    item.href = notification.link;
                    item.className = 'notification-item';
                    if (!notification.read) item.classList.add('unread');

                    item.innerHTML = `
                        <img src="${notification.authorAvatar}" alt="Avatar de ${notification.author}">
                        <div class="notification-content">
                            <p><strong>${notification.author}</strong> ${notification.text}</p>
                        </div>
                    `;
                    if (notificationOverlay) item.addEventListener('click', togglePanel);
                    notificationList.appendChild(item);
                });
            }
        }
    }

    function togglePanel() {
        if (notificationOverlay) {
            const isHidden = notificationOverlay.classList.contains('hidden');
            notificationOverlay.classList.toggle('hidden');

            if (isHidden && unreadCountBeforeOpening > 0) {
                // Marcar todas as notificações como lidas quando o painel é aberto
                allNotifications.forEach(n => n.read = true);
                saveNotifications();
                updateNotificationUI(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
            }
        }
    }

    // Adiciona event listeners somente se os elementos existem na página
    if (notificationsBtn) notificationsBtn.addEventListener('click', (e) => { e.preventDefault(); togglePanel(); });
    if (closeNotificationsBtn) closeNotificationsBtn.addEventListener('click', togglePanel);
    if (notificationOverlay) notificationOverlay.addEventListener('click', (e) => { if (e.target === notificationOverlay) togglePanel(); });

    filterButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateNotificationUI(button.dataset.filter);
            });
        }
    });

    window.dispatchNotificationCheck = checkForNewMentions; // Mantém a função exposta para testes manuais

    initializeNotifications();
});