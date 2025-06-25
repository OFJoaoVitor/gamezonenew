document.addEventListener('DOMContentLoaded', () => {
    const serverList = document.getElementById('server-list');
    const createCommunitySection = document.getElementById('create-community-section');
    const exploreSection = document.getElementById('explore-communities-section');
    const createCommunityForm = document.getElementById('create-community-form');
    const nameInput = document.getElementById('community-name-input');
    const descInput = document.getElementById('community-desc-input');
    const iconInput = document.getElementById('community-icon-input');
    const searchInput = document.getElementById('community-search-input');
    const searchResultsContainer = document.getElementById('community-search-results');

    let allCommunities = [];
    let myCommunityIds = [];

    function loadAllData() {
        const storedAll = localStorage.getItem('gamezone_all_communities');
        allCommunities = storedAll ? JSON.parse(storedAll) : [];

        const storedMine = localStorage.getItem('gamezone_my_communities');
        myCommunityIds = storedMine ? JSON.parse(storedMine) : [];
        
        renderServerList();
        renderSearchResults(''); // Mostra todas as comunidades inicialmente
    }

    function saveAllCommunities() {
        localStorage.setItem('gamezone_all_communities', JSON.stringify(allCommunities));
    }

    function saveMyCommunities() {
        localStorage.setItem('gamezone_my_communities', JSON.stringify(myCommunityIds));
    }

    function renderServerList() {
        serverList.innerHTML = '';
        
        // Filtra para mostrar apenas as comunidades que o usuário entrou
        const myCommunities = allCommunities.filter(c => myCommunityIds.includes(c.id));

        myCommunities.forEach(community => {
            const link = document.createElement('a');
            link.href = `./single-community.html?id=${community.id}`;
            link.className = 'server-icon';
            link.title = community.name;
            link.innerHTML = `<img src="${community.icon || './img/group-banner-default.jpg'}" alt="${community.name}">`;
            serverList.appendChild(link);
        });

        const addServerButton = document.createElement('button');
        addServerButton.className = 'server-icon add-server-btn';
        addServerButton.title = 'Criar Comunidade';
        addServerButton.innerHTML = `+`;
        addServerButton.onclick = () => {
            exploreSection.classList.add('hidden');
            createCommunitySection.classList.remove('hidden');
        };
        serverList.appendChild(addServerButton);
    }

    function renderSearchResults(query) {
        searchResultsContainer.innerHTML = '';
        const normalizedQuery = query.toLowerCase();
        
        const filteredCommunities = allCommunities.filter(community => {
            return community.name.toLowerCase().includes(normalizedQuery) || 
                   community.id.toString().includes(normalizedQuery);
        });

        if (filteredCommunities.length === 0) {
            searchResultsContainer.innerHTML = '<p>Nenhuma comunidade encontrada.</p>';
            return;
        }

        filteredCommunities.forEach(community => {
            const isMember = myCommunityIds.includes(community.id);
            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.innerHTML = `
                <img src="${community.icon || './img/group-banner-default.jpg'}" alt="${community.name}">
                <div class="search-card-details">
                    <h4>${community.name}</h4>
                    <p>ID: ${community.id}</p>
                </div>
                <button class="primary-btn join-leave-btn" data-id="${community.id}">
                    ${isMember ? 'Sair' : 'Entrar'}
                </button>
            `;
            searchResultsContainer.appendChild(card);
        });
    }
    
    function joinOrLeaveCommunity(communityId) {
        const id = Number(communityId);
        const isMember = myCommunityIds.includes(id);

        if (isMember) {
            // Sair da comunidade
            myCommunityIds = myCommunityIds.filter(memberId => memberId !== id);
        } else {
            // Entrar na comunidade
            myCommunityIds.push(id);
        }
        
        saveMyCommunities();
        renderServerList();
        renderSearchResults(searchInput.value); // Atualiza o botão na busca
    }


    createCommunityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const iconFile = iconInput.files[0];

        if (!name || !description) return;

        const newCommunity = {
            id: Date.now(),
            name: name,
            description: description,
            banner: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800', // Banner padrão
            posts: [],
            icon: './img/group-banner-default.jpg'
        };
        
        const processAndSave = () => {
            allCommunities.push(newCommunity);
            saveAllCommunities();
            
            // Entra automaticamente na comunidade criada
            myCommunityIds.push(newCommunity.id);
            saveMyCommunities();

            renderServerList();
            renderSearchResults('');
            createCommunityForm.reset();
            createCommunitySection.classList.add('hidden');
            exploreSection.classList.remove('hidden');
        };

        if (iconFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                newCommunity.icon = event.target.result;
                processAndSave();
            };
            reader.readAsDataURL(iconFile);
        } else {
            processAndSave();
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        renderSearchResults(e.target.value);
    });

    searchResultsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('join-leave-btn')) {
            joinOrLeaveCommunity(e.target.dataset.id);
        }
    });

    loadAllData();
});