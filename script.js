let posts = [];
let openComments = new Set(); 
function loadPosts() {
    const postsFromStorage = localStorage.getItem('gamezone_posts');
    posts = postsFromStorage ? JSON.parse(postsFromStorage) : [];
 
    if (posts.length === 0) {
        posts.push({
            id: Date.now(),
            authorName: "Admin", 
            authorAvatar: "./img/unnamed.jpg",
            content: "Bem-vindo à GameZone! Crie seu primeiro post acima e comece a interagir. Você pode anexar imagens e vídeos!", 
            timestamp: new Date().toISOString(),
            likes: 0, likedByMe: false, comments: [],
            fileData: null, fileName: null, fileType: null
        });
    }
    window.renderPosts(); 
}

function savePosts() {
    localStorage.setItem('gamezone_posts', JSON.stringify(posts));
}

// Nova função auxiliar para renderizar a lista de comentários de um post específico
function renderCommentsForPost(postElement, postData) {
    const commentsList = postElement.querySelector('.comments-list');
    if (!commentsList) return;

    commentsList.innerHTML = ''; // Limpa a lista existente

    // Reconstrói a lista de comentários
    (postData.comments || []).forEach(comment => {
        const commentElement = document.createElement('li');
        commentElement.className = 'comment-item';
        // AQUI ESTÁ A MUDANÇA: Aplica a substituição de @ para a classe mention no texto do comentário
        const formattedCommentText = comment.text.replace(/\n/g, '<br>').replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        commentElement.innerHTML = `
            <img src="${comment.authorAvatar}" alt="Avatar de ${comment.authorName}" class="comment-avatar">
            <div>
                <strong>${comment.authorName}</strong>
                <p>${formattedCommentText}</p>
            </div>
        `;
        commentsList.appendChild(commentElement);
    });

    // Rola para o último comentário após adicionar
    commentsList.scrollTop = commentsList.scrollHeight;
}


window.renderPosts = function() {
    const feedContainer = document.getElementById('feed-posts-container');
    if (!feedContainer) return;
    feedContainer.innerHTML = ''; 
    posts.slice().reverse().forEach(post => {
        const postElement = createPostElement(post);
        feedContainer.appendChild(postElement);
    });
}

function createPostElement(postData) {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.dataset.postId = postData.id;
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

    const headerElement = document.createElement('div');
    headerElement.className = 'post-header';
    headerElement.innerHTML = `
        <img src="${postData.authorAvatar}" alt="Avatar de ${postData.authorName}" class="post-avatar">
        <div>
            <strong>${postData.authorName}</strong>
            <span class="post-time">${timeAgo}</span>
        </div>
        <button class="delete-post-button" title="Excluir post">✖</button>
    `;

    const contentElement = document.createElement('div');
    contentElement.className = 'post-content';
    // Substituição para exibir o @handle com a classe mention
    contentElement.innerHTML = `
        <p>${postData.content.replace(/\n/g, '<br>').replace(/@(\w+)/g, '<span class="mention">@$1</span>')}</p>
        ${mediaHTML}
    `;
    
    const postStatsElement = document.createElement('div');
    postStatsElement.className = 'post-stats';
    const likesText = postData.likes === 1 ? 'curtida' : 'curtidas';
    postStatsElement.innerHTML = `<span class="like-count">${postData.likes || 0} ${likesText}</span>`; 

    const actionsElement = document.createElement('div');
    actionsElement.className = 'post-actions';
    actionsElement.innerHTML = `
        <button class="post-action-button like-button ${postData.likedByMe ? 'liked' : ''}"><span class="icon">👍</span> <span class="action-text">Curtir</span></button>
        <button class="post-action-button comment-toggle-button"><span class="icon">💬</span> <span class="action-text">Comentar</span></button>
        <button class="post-action-button share-button"><span class="icon">🔗</span> <span class="action-text">Compartilhar</span></button>
    `;

    const commentsElement = document.createElement('div');
    commentsElement.className = 'post-comments';
    if (openComments.has(postData.id)) {
        commentsElement.classList.add('active');
    }
    
    commentsElement.innerHTML = `
        <ul class="comments-list">
            </ul>
        <div class="add-comment">
            <img src="${localStorage.getItem('profilePic') || './img/unnamed.jpg'}" alt="Seu Avatar" class="comment-avatar">
            <div class="comment-input-container">
                <div class="comment-input-wrapper">
                    <input type="text" class="comment-input" placeholder="Escreva um comentário...">
                    <button class="comment-submit-button">Comentar</button>
                </div>
            </div>
        </div>
    `;
    
    postElement.appendChild(headerElement);
    postElement.appendChild(contentElement);    
    postElement.appendChild(postStatsElement);  
    postElement.appendChild(actionsElement);
    postElement.appendChild(commentsElement);

    // --- Event Listeners para botões do post ---
    const deletePostButton = headerElement.querySelector('.delete-post-button');
    if (deletePostButton) { 
        deletePostButton.addEventListener('click', () => {
            if(confirm('Tem certeza que deseja apagar este post?')) {
                posts = posts.filter(p => p.id !== postData.id);
                openComments.delete(postData.id); 
                savePosts();
                window.renderPosts(); 
            }
        });
    }

    const likeButton = actionsElement.querySelector('.like-button');
    if (likeButton) { 
        likeButton.addEventListener('click', () => {
            const postIndex = posts.findIndex(p => p.id === postData.id);
            if (postIndex > -1) {
                const currentPost = posts[postIndex];
                currentPost.likedByMe = !currentPost.likedByMe;
                currentPost.likes += currentPost.likedByMe ? 1 : -1;
                
                if (currentPost.likes < 0) currentPost.likes = 0; 

                savePosts();
                window.renderPosts(); 
            }
        });
    }

    const commentToggleButton = actionsElement.querySelector('.comment-toggle-button');
    if (commentToggleButton) {
        commentToggleButton.addEventListener('click', () => {
            commentsElement.classList.toggle('active');
            if (commentsElement.classList.contains('active')) {
                openComments.add(postData.id); 
                // Garante que os comentários sejam renderizados ao abrir
                renderCommentsForPost(postElement, postData);
            } else {
                openComments.delete(postData.id); 
            }
        });
    }

    const commentSubmitButton = commentsElement.querySelector('.comment-submit-button');
    const commentInput = commentsElement.querySelector('.comment-input');
    if (commentSubmitButton && commentInput) {
        commentSubmitButton.addEventListener('click', () => {
            const text = commentInput.value.trim();
            if (text) {
                const newComment = {
                    authorName: localStorage.getItem('profileName') || 'Você', 
                    authorAvatar: localStorage.getItem('profilePic') || './img/unnamed.jpg',
                    text: text
                };
                const postIndex = posts.findIndex(p => p.id === postData.id);
                if (postIndex > -1) {
                    if (!posts[postIndex].comments) posts[postIndex].comments = [];
                    posts[postIndex].comments.push(newComment);
                    savePosts();
                    
                    renderCommentsForPost(postElement, posts[postIndex]);
                    commentInput.value = ''; // Limpa o campo de input

                    // NOVO: Chama as funções de menção e notificação para comentários
                    if (window.checkForMentionAndPlaySound) {
                        // Passa o texto do comentário, o nome do autor do comentário e o ID do post pai
                        // para que a notificação possa ser mais específica e, opcionalmente, linkável.
                        window.checkForMentionAndPlaySound({ 
                            text: newComment.text, 
                            authorName: newComment.authorName, // Nome do autor do comentário
                            id: postData.id // ID do post ao qual o comentário pertence
                        });
                    }
                    if (window.dispatchNotificationCheck) {
                        window.dispatchNotificationCheck();
                    }
                }
            }
        });
    }

    const shareButton = actionsElement.querySelector('.share-button');
    if (shareButton) {
        shareButton.addEventListener('click', () => {
            try {
                navigator.clipboard.writeText(window.location.href);
                shareButton.querySelector('.action-text').textContent = 'Link Copiado!';
                setTimeout(() => {
                    shareButton.querySelector('.action-text').textContent = 'Compartilhar';
                }, 2000); 
            } catch (err) {
                alert('Falha ao copiar. Seu navegador pode não suportar esta funcionalidade ou não estar em um ambiente seguro (HTTPS).');
            }
        });
    }

    // Renderiza os comentários inicialmente se eles estiverem abertos
    if (openComments.has(postData.id)) {
        renderCommentsForPost(postElement, postData);
    }

    return postElement;
}


document.addEventListener('DOMContentLoaded', () => {
    const feedPostsContainer = document.getElementById('feed-posts-container');
    const postContentInput = document.getElementById('post-content-input');
    const submitPostButton = document.getElementById('submit-post-button');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    
    let fileToUpload = null; 

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileToUpload = fileInput.files[0];
            fileNameDisplay.textContent = fileToUpload.name;
        } else {
            fileToUpload = null;
            fileNameDisplay.textContent = '';
        }
    });

    submitPostButton.addEventListener('click', () => {
        const content = postContentInput.value.trim();
        if (!content && !fileToUpload) return; 

        const newPost = {
            id: Date.now(),
            authorName: localStorage.getItem('profileName') || 'Você', 
            authorAvatar: localStorage.getItem('profilePic') || './img/unnamed.jpg',
            authorHandle: localStorage.getItem('userHandle') || 'username', // Garante que o handle do autor está no post
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0, likedByMe: false, comments: [],
            fileData: null, fileName: null, fileType: null
        };

        const processAndSave = () => {
            console.log('Novo post sendo criado:', newPost); // Log de depuração
            posts.push(newPost);
            savePosts();
            window.renderPosts(); 

            // NOVO: Chama a função de verificação de menção após salvar o post
            // Verifica se a função existe para evitar erros
            if (window.checkForMentionAndPlaySound) {
                console.log('Chamando checkForMentionAndPlaySound com:', newPost); // Log de depuração
                // Passa o objeto newPost completo para checkForMentionAndPlaySound
                window.checkForMentionAndPlaySound(newPost);
                console.log('checkForMentionAndPlaySound chamado.'); // Log de depuração
            }
            // A chamada para dispatchNotificationCheck pode ser removida se não houver outras notificações globais
            // Ou mantida para futuras expansões. Por enquanto, não causará problemas.
            if (window.dispatchNotificationCheck) {
                console.log('Verificando se dispatchNotificationCheck existe e chamando-o.'); // Log de depuração
                window.dispatchNotificationCheck();
            }

            postContentInput.value = '';
            fileInput.value = '';
            fileToUpload = null;
            fileNameDisplay.textContent = '';
            console.log('Post processado e salvo. Campos resetados.'); // Log de depuração
        };

        if (fileToUpload) {
            console.log('Anexando arquivo:', fileToUpload.name, 'Tipo:', fileToUpload.type); // Log de depuração
            const reader = new FileReader();
            reader.onload = (e) => {
                newPost.fileData = e.target.result;
                newPost.fileName = fileToUpload.name;
                newPost.fileType = fileToUpload.type;
                processAndSave();
            };
            reader.readAsDataURL(fileToUpload);
        } else {
            console.log('Nenhum arquivo para anexar, processando post diretamente.'); // Log de depuração
            processAndSave();
        }
    });
    
    loadPosts(); 
    moment.locale('pt-br'); 
});