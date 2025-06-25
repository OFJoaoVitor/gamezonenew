document.addEventListener('DOMContentLoaded', () => {
    const friendsContainer = document.getElementById('friends-container');
    const suggestionsContainer = document.getElementById('suggestions-container');

    // Simulação de uma base de dados de usuários.
    const allUsers = [
        { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1', bio: 'Jogadora de RPG e fã de fantasia.' },
        { id: 2, name: 'Beto', avatar: 'https://i.pravatar.cc/150?img=3', bio: 'Competitivo no FPS e streamer.' },
        { id: 3, name: 'Carla', avatar: 'https://i.pravatar.cc/150?img=5', bio: 'Adora jogos de estratégia e puzzle.' },
        { id: 4, name: 'Daniel', avatar: 'https://i.pravatar.cc/150?img=7', bio: 'Explorador de mundos abertos.' },
        { id: 5, name: 'Elena', avatar: 'https://i.pravatar.cc/150?img=9', bio: 'Curte jogos indie e narrativas.' },
        { id: 6, name: 'Fábio', avatar: 'https://i.pravatar.cc/150?img=11', bio: 'Mestre em jogos de luta.' }
    ];

    let myFriendsIds = [];

    function loadFriends() {
        const storedFriends = localStorage.getItem('gamezone_friends');
        myFriendsIds = storedFriends ? JSON.parse(storedFriends) : [];
        renderLists();
    }

    function saveFriends() {
        localStorage.setItem('gamezone_friends', JSON.stringify(myFriendsIds));
    }

    function renderLists() {
        friendsContainer.innerHTML = '';
        suggestionsContainer.innerHTML = '';

        const myFriends = allUsers.filter(user => myFriendsIds.includes(user.id));
        const suggestions = allUsers.filter(user => !myFriendsIds.includes(user.id));

        if (myFriends.length === 0) {
            friendsContainer.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary);">Você ainda não adicionou nenhum amigo.</p>';
        } else {
            myFriends.forEach(user => {
                friendsContainer.innerHTML += `
                    <div class="friend-card">
                        <img src="${user.avatar}" alt="Avatar de ${user.name}">
                        <h4>${user.name}</h4>
                        <p>${user.bio}</p>
                        <div class="friend-card-actions">
                            <a href="chat.html?friendId=${user.id}" class="primary-btn chat-btn">Conversar</a>
                            <button class="remove-btn" data-id="${user.id}" title="Remover Amigo">✖</button>
                        </div>
                    </div>
                `;
            });
        }

        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary);">Não há novas sugestões de amigos.</p>';
        } else {
            suggestions.forEach(user => {
                suggestionsContainer.innerHTML += `
                    <div class="friend-card">
                        <img src="${user.avatar}" alt="Avatar de ${user.name}">
                        <h4>${user.name}</h4>
                        <p>${user.bio}</p>
                        <button class="primary-btn add-btn" data-id="${user.id}">Adicionar Amigo</button>
                    </div>
                `;
            });
        }
    }

    function addFriend(id) {
        if (!myFriendsIds.includes(id)) {
            myFriendsIds.push(id);
            saveFriends();
            renderLists();
        }
    }

    function removeFriend(id) {
        // Adiciona uma confirmação antes de remover
        if (confirm('Tem certeza que deseja remover este amigo?')) {
            myFriendsIds = myFriendsIds.filter(friendId => friendId !== id);
            saveFriends();
            renderLists();
        }
    }

    // Delegação de eventos
    document.querySelector('.main-column').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('add-btn')) {
            const userId = Number(target.dataset.id);
            addFriend(userId);
        }
        // Verifica se o botão ou o elemento pai mais próximo é o de remover
        const removeButton = target.closest('.remove-btn');
        if (removeButton) {
            const userId = Number(removeButton.dataset.id);
            removeFriend(userId);
        }
    });

    loadFriends();
});