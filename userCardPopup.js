document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter referências para os elementos do pop-up
    const userCardPopup = document.createElement('div');
    userCardPopup.id = 'user-card-popup';
    userCardPopup.className = 'user-card-popup';
    userCardPopup.innerHTML = `
        <div class="user-card-header">
            <img src="./img/unnamed.jpg" alt="Avatar" class="user-card-avatar" id="user-card-avatar">
            <div class="user-card-names">
                <strong class="user-card-name" id="user-card-name">Nome do Usuário</strong>
                <span class="user-card-handle" id="user-card-handle">@username</span>
            </div>
        </div>
        <p class="user-card-bio" id="user-card-bio">Bio do usuário aparecerá aqui.</p>
        <div class="user-card-stats">
            <span><strong>0</strong> Amigos</span>
            <span><strong>0</strong> Comunidades</span>
        </div>
        <div class="user-card-actions">
            <a href="#" class="primary-btn">Ver Perfil</a>
            <button class="secondary-btn">Adicionar Amigo</button>
        </div>
    `;
    document.body.appendChild(userCardPopup);

    const userCardAvatar = userCardPopup.querySelector('#user-card-avatar');
    const userCardName = userCardPopup.querySelector('#user-card-name');
    const userCardHandle = userCardPopup.querySelector('#user-card-handle');
    const userCardBio = userCardPopup.querySelector('#user-card-bio');
    const viewProfileBtn = userCardPopup.querySelector('a.primary-btn');
    const addFriendBtn = userCardPopup.querySelector('button.secondary-btn');
    const userCardFriendsCount = userCardPopup.querySelector('.user-card-stats span:nth-child(1) strong');
    const userCardCommunitiesCount = userCardPopup.querySelector('.user-card-stats span:nth-child(2) strong');

    // Variáveis para controlar qual elemento ativou o pop-up
    let currentActiveElement = null; // Para saber qual PFP/nome está ativo

    // 2. Função para buscar dados do usuário (simulada)
    function getUserData(authorName, authorHandle, authorAvatar) {
        // Obter dados do usuário logado do localStorage
        const loggedInUserName = localStorage.getItem('profileName') || 'Você';
        const loggedInUserHandle = localStorage.getItem('userHandle') || 'username';
        const loggedInUserBio = localStorage.getItem('profileBio') || 'Edite sua bio!';
        const loggedInUserPic = localStorage.getItem('profilePic') || './img/unnamed.jpg';

        // Verifica se é o próprio usuário logado
        if (authorName === loggedInUserName && (authorHandle === loggedInUserHandle || !authorHandle)) {
            return {
                profileName: loggedInUserName,
                userHandle: loggedInUserHandle,
                profileBio: loggedInUserBio,
                profilePic: loggedInUserPic,
                friendsCount: 150, // Dados simulados
                communitiesCount: 25 // Dados simulados
            };
        }

        // Dados de usuários padrão para simulação
        const defaultUsers = {
            "admin": {
                name: "Admin",
                handle: "gamezone_admin",
                bio: "Administrador da GameZone. Apaixonado por jogos e pela comunidade!",
                avatar: "./img/unnamed.jpg",
                friendsCount: 999,
                communitiesCount: 50
            },
            "john_doe": {
                name: "John Doe",
                handle: "johndoe_gamer",
                bio: "Gamer entusiasta de RPGs e jogos de estratégia. Gosta de compartilhar dicas e truques.",
                avatar: "https://via.placeholder.com/60/FF5733/FFFFFF?text=JD",
                friendsCount: 120,
                communitiesCount: 15
            },
            "maria_silva": {
                name: "Maria Silva",
                handle: "maria_player",
                bio: "Criadora de conteúdo e fã de jogos indie. Streamer nas horas vagas.",
                avatar: "https://via.placeholder.com/60/33FF57/FFFFFF?text=MS",
                friendsCount: 80,
                communitiesCount: 10
            },
            "pedro_gamer": {
                name: "Pedro Gamer",
                handle: "pedro_pro",
                bio: "Competitivo em FPS. Sempre buscando novos desafios.",
                avatar: "https://via.placeholder.com/60/3366FF/FFFFFF?text=PG",
                friendsCount: 200,
                communitiesCount: 30
            }
        };

        // Tenta encontrar o usuário pelos dados fornecidos (nome ou handle)
        const foundUser = Object.values(defaultUsers).find(user =>
            user.handle === authorHandle || user.name === authorName
        );

        // Retorna o usuário encontrado ou um objeto padrão com os dados passados
        return foundUser || {
            profileName: authorName,
            userHandle: authorHandle || authorName.toLowerCase().replace(/\s/g, '_'),
            profileBio: "Sem bio disponível para este usuário.",
            profilePic: authorAvatar || './img/unnamed.jpg',
            friendsCount: Math.floor(Math.random() * 100) + 10,
            communitiesCount: Math.floor(Math.random() * 50) + 5
        };
    }

    // 3. Função para mostrar o painel do usuário
    function showUserCardPopup(targetElement, postAuthorData) {
        const userData = getUserData(postAuthorData.authorName, postAuthorData.authorHandle, postAuthorData.authorAvatar);

        userCardAvatar.src = userData.profilePic;
        userCardName.textContent = userData.profileName;
        userCardHandle.textContent = `@${userData.userHandle}`;
        userCardBio.textContent = userData.profileBio;
        userCardFriendsCount.textContent = userData.friendsCount;
        userCardCommunitiesCount.textContent = userData.communitiesCount;

        // Atualiza os links e botões
        viewProfileBtn.href = `./profile.html?user=${encodeURIComponent(userData.userHandle)}`;
        addFriendBtn.onclick = () => {
            alert(`Solicitação de amizade enviada para ${userData.profileName}! (Funcionalidade a ser implementada!)`);
            hideUserCardPopup(); // Esconde o painel após a ação
        };

        // Posicionamento do pop-up
        const rect = targetElement.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        const popupWidth = userCardPopup.offsetWidth;
        const popupHeight = userCardPopup.offsetHeight; // Obter a altura também para posicionamento vertical

        let leftPosition = rect.left + (rect.width / 2) - (popupWidth / 2) + scrollX;
        let topPosition = rect.bottom + scrollY + 10; // 10px abaixo do elemento

        // Ajustar se sair da tela horizontalmente
        if (leftPosition < 5) {
            leftPosition = 5;
        }
        if ((leftPosition + popupWidth) > (window.innerWidth - 5)) {
            leftPosition = window.innerWidth - popupWidth - 5;
        }

        // Ajustar se sair da tela verticalmente (aparecer acima se não houver espaço abaixo)
        if ((topPosition + popupHeight) > (window.innerHeight + scrollY - 5)) {
            topPosition = rect.top + scrollY - popupHeight - 10; // 10px acima do elemento
            if (topPosition < 5) { // Se ainda não couber, posiciona no topo da tela
                topPosition = 5;
            }
        }

        userCardPopup.style.left = `${leftPosition}px`;
        userCardPopup.style.top = `${topPosition}px`;

        userCardPopup.classList.add('visible');
        currentActiveElement = targetElement; // Marca qual elemento ativou o pop-up
    }

    // 4. Função para esconder o painel do usuário
    function hideUserCardPopup() {
        userCardPopup.classList.remove('visible');
        currentActiveElement = null; // Limpa o elemento ativo
    }

    // 5. Função global para anexar eventos de clique aos elementos do post
    // Esta função será chamada por renderPosts e renderPostElement
    window.setupUserCardClick = function(postElement, postData) {
        const avatarElement = postElement.querySelector('.post-avatar');
        const nameElement = postElement.querySelector('.post-header strong');

        const handleClick = (e) => {
            e.stopPropagation(); // Impede que o clique se propague para o document e feche o pop-up imediatamente

            // Se o pop-up já está visível E o clique foi no MESMO elemento que o ativou, esconde.
            // Isso permite clicar no mesmo elemento para fechar.
            if (userCardPopup.classList.contains('visible') && currentActiveElement === e.currentTarget) {
                hideUserCardPopup();
            } else {
                // Se o pop-up está visível mas o clique é em OUTRO elemento, primeiro esconde o atual
                if (userCardPopup.classList.contains('visible')) {
                    hideUserCardPopup();
                }
                // Em seguida, mostra o novo pop-up para o elemento clicado
                showUserCardPopup(e.currentTarget, postData);
            }
        };

        if (avatarElement) {
            avatarElement.addEventListener('click', handleClick);
        }
        if (nameElement) {
            nameElement.addEventListener('click', handleClick);
        }
    };

    // 6. Listener para fechar o pop-up quando clicar fora dele
    document.addEventListener('click', (event) => {
        // Se o pop-up está visível E o clique não foi dentro do pop-up E o clique não foi no elemento que o ativou
        if (userCardPopup.classList.contains('visible') &&
            !userCardPopup.contains(event.target) &&
            (currentActiveElement === null || !currentActiveElement.contains(event.target))) {
            hideUserCardPopup();
        }
    });
});