document.addEventListener('DOMContentLoaded', () => {
    const viewMode = document.getElementById('view-mode');
    const editMode = document.getElementById('edit-mode');
    const nameInput = document.getElementById('name-input');
    const handleInput = document.getElementById('handle-input');
    const bioInput = document.getElementById('bio-input');
    const profilePicInput = document.getElementById('profile-pic-input');
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const themeToggle = document.getElementById('theme-toggle');
    const profilePictureContainer = document.getElementById('profile-picture-container');
    const displayName = document.getElementById('display-name');
    const displayHandle = document.getElementById('display-handle');
    const displayBio = document.getElementById('display-bio');
    const profilePicDisplay = document.getElementById('profile-pic-display');

    function loadProfile() {
        displayName.textContent = localStorage.getItem('profileName') || 'Nome do Usuário';
        displayHandle.textContent = `@${localStorage.getItem('userHandle') || 'username'}`;
        displayBio.textContent = localStorage.getItem('profileBio') || 'Edite sua bio!';
        profilePicDisplay.src = localStorage.getItem('profilePic') || './img/unnamed.jpg';
    }

    function enterEditMode() {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        nameInput.value = localStorage.getItem('profileName') || '';
        handleInput.value = localStorage.getItem('userHandle') || '';
        bioInput.value = localStorage.getItem('profileBio') || '';
        editButton.classList.add('hidden');
        saveButton.classList.remove('hidden');
        cancelButton.classList.remove('hidden');
        profilePictureContainer.classList.add('is-editable');
        profilePictureContainer.onclick = () => profilePicInput.click();
    }

    function exitEditMode() {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
        editButton.classList.remove('hidden');
        saveButton.classList.add('hidden');
        cancelButton.classList.add('hidden');
        profilePictureContainer.classList.remove('is-editable');
        profilePictureContainer.onclick = null;
    }

    async function updateOldContent(oldHandle, newName) {
        if (!oldHandle || oldHandle === 'username') return;

        // Atualiza posts do feed principal
        let posts = JSON.parse(localStorage.getItem('gamezone_posts') || '[]');
        posts.forEach(post => {
            if (post.authorHandle === oldHandle) {
                post.authorName = newName;
            }
        });
        localStorage.setItem('gamezone_posts', JSON.stringify(posts));

        // Atualiza posts das comunidades
        let communities = JSON.parse(localStorage.getItem('gamezone_all_communities') || '[]');
        communities.forEach(community => {
            if (community.posts && community.posts.length > 0) {
                community.posts.forEach(post => {
                    if (post.authorHandle === oldHandle) {
                        post.authorName = newName;
                    }
                });
            }
        });
        localStorage.setItem('gamezone_all_communities', JSON.stringify(communities));
    }

    editButton.addEventListener('click', enterEditMode);
    cancelButton.addEventListener('click', exitEditMode);
    
    saveButton.addEventListener('click', async () => {
        const oldHandle = localStorage.getItem('userHandle');
        const newName = nameInput.value.trim();
        const newHandle = handleInput.value.trim().replace(/@/g, '');
        const newBio = bioInput.value.trim();

        if (newName) localStorage.setItem('profileName', newName);
        if (newHandle) localStorage.setItem('userHandle', newHandle);
        if (newBio) localStorage.setItem('profileBio', newBio);
        
        await updateOldContent(oldHandle, newName);

        if (profilePicInput.files && profilePicInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPicData = e.target.result;
                localStorage.setItem('profilePic', newPicData);
                loadProfile();
                if (window.loadProfileData) window.loadProfileData();
            };
            reader.readAsDataURL(profilePicInput.files[0]);
        } else {
            loadProfile();
            if (window.loadProfileData) window.loadProfileData();
        }
        
        exitEditMode();
    });

    function applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        themeToggle.checked = (theme === 'dark');
    }

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    loadProfile();
});