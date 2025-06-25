document.addEventListener('DOMContentLoaded', () => {
    
    const communityNameHeader = document.getElementById('community-name-header');
    const feedContainer = document.getElementById('feed-posts-container');
    const postContentInput = document.getElementById('post-content-input');
    const submitPostButton = document.getElementById('submit-post-button');
    const deleteCommunityHeaderBtn = document.getElementById('delete-community-header-btn');
    const fileInput = document.getElementById('community-file-input'); // Para posts normais
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsForm = document.getElementById('community-settings-form');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    const settingsNameInput = document.getElementById('settings-name-input');
    const settingsDescInput = document.getElementById('settings-desc-input');
    
    // Novas referências para os elementos de Ícone e Banner
    const settingsIconInput = document.getElementById('settings-icon-input');
    const settingsIconUploadBtn = document.querySelector('label[for="settings-icon-input"]');
    const currentIconNameDisplay = document.getElementById('current-icon-name');

    const settingsBannerInput = document.getElementById('settings-banner-input');
    const settingsBannerUploadBtn = document.querySelector('label[for="settings-banner-input"]');
    const currentBannerNameDisplay = document.getElementById('current-banner-name');
    
    let allCommunities = [];
    let currentCommunity = null;
    let communityIndex = -1;
    let fileToUpload = null; // Para posts normais
    let iconFileToUpload = null; // Para upload de ícone
    let bannerFileToUpload = null; // Para upload de banner

    function getCommunityIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return Number(params.get('id'));
    }

    function loadData() {
        const stored = localStorage.getItem('gamezone_all_communities');
        allCommunities = stored ? JSON.parse(stored) : [];
        const communityId = getCommunityIdFromUrl();
        communityIndex = allCommunities.findIndex(c => c.id === communityId);

        if (communityIndex !== -1) {
            currentCommunity = allCommunities[communityIndex];
            setupPage();
        } else {
            document.body.innerHTML = '<h1>Comunidade não encontrada ou você não é um membro.</h1>';
        }
    }
    
    function saveAllCommunities() {
        if(communityIndex !== -1) {
            allCommunities[communityIndex] = currentCommunity;
        }
        localStorage.setItem('gamezone_all_communities', JSON.stringify(allCommunities));
    }

    function setupPage() {
        document.title = `${currentCommunity.name} - GameZone`;
        communityNameHeader.textContent = currentCommunity.name;
        postContentInput.placeholder = `Conversar em ${currentCommunity.name}`;
        renderFeed();
    }

    function renderFeed() {
        feedContainer.innerHTML = '';
        
        const bannerElement = document.createElement('div');
        bannerElement.className = 'community-banner-display';
        bannerElement.innerHTML = `
            <div class="banner-image" style="background-image: url('${currentCommunity.banner || './img/group-banner-default.jpg'}')"></div>
            <div class="banner-info">
                <h1>Bem-vindo a ${currentCommunity.name}</h1>
                <p>${currentCommunity.description}</p>
            </div>
        `;
        feedContainer.appendChild(bannerElement);

        if (currentCommunity.posts && currentCommunity.posts.length > 0) {
             currentCommunity.posts.forEach(post => { 
                const postElement = createPostElement(post);
                feedContainer.appendChild(postElement);
             });
        }
        
        setTimeout(() => {
             feedContainer.scrollTop = feedContainer.scrollHeight;
        }, 0);
    }

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileToUpload = fileInput.files[0];
            postContentInput.placeholder = `Anexando: ${fileToUpload.name}`;
        } else {
            fileToUpload = null;
            postContentInput.placeholder = `Conversar em ${currentCommunity.name}`;
        }
    });

    submitPostButton.addEventListener('click', () => {
        const content = postContentInput.value.trim();
        if (!content && !fileToUpload) {
            return;
        }
        if (!currentCommunity) {
            return;
        }

        const newPost = {
            id: Date.now(),
            authorName: localStorage.getItem('profileName') || 'Você',
            authorAvatar: localStorage.getItem('profilePic') || './img/unnamed.jpg',
            authorHandle: localStorage.getItem('userHandle') || 'username',
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0, likedByMe: false, comments: [],
            fileData: null, fileName: null, fileType: null
        };

        const processAndSave = () => {
            if (!currentCommunity.posts) currentCommunity.posts = [];
            currentCommunity.posts.push(newPost);
            saveAllCommunities();
            
            renderFeed();

            postContentInput.value = '';
            fileInput.value = '';
            fileToUpload = null;
            postContentInput.placeholder = `Conversar em ${currentCommunity.name}`;

            if (window.checkForMentionAndPlaySound) {
                window.checkForMentionAndPlaySound(newPost);
            }
            if (window.dispatchNotificationCheck) {
                window.dispatchNotificationCheck();
            }
        };

        if (fileToUpload) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPost.fileData = e.target.result;
                newPost.fileName = fileToUpload.name;
                newPost.fileType = fileToUpload.type;
                processAndSave();
            };
            reader.readAsDataURL(fileToUpload);
        } else {
            processAndSave();
        }
    });
    
    deleteCommunityHeaderBtn.addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja deletar a comunidade "${currentCommunity.name}"? Esta ação é irreversível.`)) {
            allCommunities.splice(communityIndex, 1);
            saveAllCommunities();
            
            const myIds = JSON.parse(localStorage.getItem('gamezone_my_communities') || '[]');
            const updatedMyIds = myIds.filter(id => id !== currentCommunity.id);
            localStorage.setItem('gamezone_my_communities', JSON.stringify(updatedMyIds));

            window.location.href = './comunidades.html'; 
        }
    });

    settingsBtn.addEventListener('click', () => {
        settingsNameInput.value = currentCommunity.name;
        settingsDescInput.value = currentCommunity.description;
        
        // Resetar os inputs de arquivo e seus displays ao abrir o modal
        settingsIconInput.value = '';
        currentIconNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        iconFileToUpload = null;

        settingsBannerInput.value = '';
        currentBannerNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        bannerFileToUpload = null;

        settingsModal.classList.remove('hidden');
    });

    cancelSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });
    
    // Listener para o input de Ícone
    settingsIconInput.addEventListener('change', () => {
        if (settingsIconInput.files.length > 0) {
            iconFileToUpload = settingsIconInput.files[0];
            currentIconNameDisplay.textContent = iconFileToUpload.name;
        } else {
            iconFileToUpload = null;
            currentIconNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        }
    });

    // Listener para o input de Banner
    settingsBannerInput.addEventListener('change', () => {
        if (settingsBannerInput.files.length > 0) {
            bannerFileToUpload = settingsBannerInput.files[0];
            currentBannerNameDisplay.textContent = bannerFileToUpload.name;
        } else {
            bannerFileToUpload = null;
            currentBannerNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        }
    });

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentCommunity.name = settingsNameInput.value.trim();
        currentCommunity.description = settingsDescInput.value.trim();

        let iconPromise = Promise.resolve();
        let bannerPromise = Promise.resolve();

        if (iconFileToUpload) {
            iconPromise = new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentCommunity.icon = event.target.result;
                    resolve();
                };
                reader.readAsDataURL(iconFileToUpload);
            });
        }

        if (bannerFileToUpload) {
            bannerPromise = new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentCommunity.banner = event.target.result;
                    resolve();
                };
                reader.readAsDataURL(bannerFileToUpload);
            });
        }

        Promise.all([iconPromise, bannerPromise]).then(() => {
            saveAllCommunities();
            loadData(); 
            settingsModal.classList.add('hidden');
        });
    });

    function createPostElement(postData) {
        const postElement = document.createElement('div');
        postElement.className = 'discord-style-post';
        postElement.id = `post-${postData.id}`;
        
        const timeAgo = moment(postData.timestamp).fromNow();

        let mediaHTML = '';
        if (postData.fileData) {
            if (postData.fileType.startsWith('image/')) {
                mediaHTML = `<div class="post-media"><img src="${postData.fileData}" alt="${postData.fileName}"></div>`;
            } else if (postData.fileType.startsWith('video/')) {
                mediaHTML = `<div class="post-media"><video src="${postData.fileData}" controls></video></div>`;
            }
        }
        
        postElement.innerHTML = `
            <img src="${postData.authorAvatar}" alt="Avatar" class="post-avatar">
            <div class="post-main-content">
                <div class="post-author-line">
                    <strong class="post-author-name">${postData.authorName}</strong>
                    <span class="post-time">${timeAgo}</span>
                </div>
                <div class="post-text">${postData.content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')}</div>
                ${mediaHTML}
            </div>
            <div class="post-actions-hover">
                <button class="post-action-button-icon reply-btn" title="Responder">💬</button>
            </div>
        `;
        
        const replyButton = postElement.querySelector('.reply-btn');
        if(replyButton) {
            replyButton.addEventListener('click', () => {
                const authorHandle = postData.authorHandle || postData.authorName.replace(/\s/g, '_');
                postContentInput.value = `@${authorHandle} `;
                postContentInput.focus();
            });
        }
        
        return postElement;
    }

    loadData();
    moment.locale('pt-br');

    const allUsers = JSON.parse(localStorage.getItem('gamezone_all_users')) || [];
    const mentionsPopup = document.getElementById('mentions-suggestions-community');
    if (postContentInput && mentionsPopup && typeof initializeMentions === 'function') {
        initializeMentions(postContentInput, mentionsPopup, allUsers);
    }
});