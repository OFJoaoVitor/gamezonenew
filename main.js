document.addEventListener('DOMContentLoaded', () => {

    // As funções initializeUserData e window.getAllUsersForMentions foram removidas
    // pois não são mais necessárias para o sistema de menções.

    window.loadProfileData = function() {
        const profileName = localStorage.getItem('profileName') || 'Nome do Usuário';
        const profileHandle = localStorage.getItem('userHandle') || 'username'; // Pode ser mantido para outras finalidades, mas não usado para menções automáticas.
        const profileBio = localStorage.getItem('profileBio') || 'Edite seu perfil para mudar a bio!';
        const profilePic = localStorage.getItem('profilePic') || './img/unnamed.jpg';

        // Atualiza a barra lateral
        const sidebarProfilePic = document.getElementById('sidebar-profile-pic');
        const sidebarProfileName = document.getElementById('sidebar-profile-name');
        const sidebarProfileBio = document.getElementById('sidebar-profile-bio');

        if (sidebarProfilePic) sidebarProfilePic.src = profilePic;
        if (sidebarProfileName) sidebarProfileName.textContent = profileName;
        if (sidebarProfileBio) sidebarProfileBio.textContent = profileBio;
    };

    function applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
    }

    function scrollToAnchor() {
        if (window.location.hash) {
            const elementId = window.location.hash.substring(1);
            const element = document.getElementById(elementId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight');
                    setTimeout(() => element.classList.remove('highlight'), 2000);
                }, 500);
            }
        }
    }

    // Inicialização
    // initializeUserData() foi removido daqui.
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    window.loadProfileData();

    // Lógica do Preloader para removê-lo após o carregamento
    const preloader = document.getElementById('preloader');
    if(preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('fade-out');
            scrollToAnchor();
        });
    } else {
        scrollToAnchor();
    }
    
});