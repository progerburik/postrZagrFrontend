const baseUrl = 'https://progerburik-postr-zagr-backend.herokuapp.com';

let lastSeenId = 0;
let firstSeenId = 0;
let lastPosts = [];

const rootEl = document.getElementById('root');
const formEl = document.createElement('form');
formEl.className = 'form-inline';

formEl.innerHTML = `
<input type="text" class="form-control mb-2 mr-sm-2" data-id="url">
<select class="form-control mb-2 mr-sm-2" data-id="name">
    <option value="img">Картинка</option>
    <option value="video">Видео</option>
    <option value="audio">Аудио</option>
    <option value="regular">Обычный</option>
</select>
<button class="btn btn-info mb-2" data-action="add">Добавить посты</button>
`;
rootEl.appendChild(formEl);

const urlEl = formEl.querySelector('[data-id=url]');
const nameEl = formEl.querySelector('[data-id=name]');
urlEl.value = localStorage.getItem('added');
urlEl.addEventListener('input', (evt) => {
    localStorage.setItem('added', evt.currentTarget.value);
});
if (localStorage.getItem('name') !== null) {
    nameEl.value = localStorage.getItem('name');
}
nameEl.addEventListener('input', (evt) => {
    localStorage.setItem('name', evt.currentTarget.value);
});

formEl.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const post = {
        name: nameEl.value,
        content: urlEl.value,
        id: 0,
    };
    fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }).then(data => {
        urlEl.value = '';
        nameEl.value = 'img';
        localStorage.clear();
        lastPosts.unshift(data);
        firstSeenId = data.id;
        rebuildList(postsEl, lastPosts);
    }).catch(error => {
        console.log(error)
    });
});

const postsEl = document.createElement('ul');
postsEl.className = 'list-group';
rootEl.appendChild(postsEl);

const receivePosts = fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
receivePosts.then(response => {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then(function (data) {
    if (data.length !== 0) {
        if (data.length < 5) {
            lastPosts.push(...data.reverse());
        } else {
            lastSeenId = data[data.length - 5].id;
            lastPosts.push(...data.reverse());
            butEl.style.display = "block";
        }
        rebuildList(postsEl, lastPosts)
        console.log(lastPosts.length)
    }
}).catch(error => {
    console.log(error);
});

function rebuildList(containerEl, items) {
    containerEl.innerHTML = '';
    for (const item of items) {
        const el = document.createElement('li');
        el.className = 'list-group-item';
        if (item.name === 'img') {
            el.innerHTML = `
                <img src="${item.url}" class="card">
                ${item.name}
                <span class="badge badge-warning">likes: ${item.likes}</span>
                <button type="button" class="btn btn-success btn-sm" data-action="like">like</button>
                <button type="button" class="btn btn-danger btn-sm" data-action="dislike">dislike</button>
                <button type="button" class="btn btn-secondary btn-sm" data-action="remove">remove</button>
                <span class="badge badge-info">id: ${item.id}</span>    
            `;
        } else if (item.name === 'audio') {
            el.innerHTML = `
                <audio src="${item.url}" controls="controls" class="card"></audio>
                ${item.name}
                <span class="badge badge-warning">likes: ${item.likes}</span>
                <button type="button" class="btn btn-success btn-sm" data-action="like">like</button>
                <button type="button" class="btn btn-danger btn-sm" data-action="dislike">dislike</button>
                <button type="button" class="btn btn-secondary btn-sm" data-action="remove">remove</button>
                <span class="badge badge-info">id: ${item.id}</span>    
            `;
        } else if (item.name === 'video') {
            el.innerHTML = `
                <video src="${item.url}" controls="controls" class="card"></video>
                ${item.name}
                <span class="badge badge-warning">likes: ${item.likes}</span>
                <button type="button" class="btn btn-success btn-sm" data-action="like">like</button>
                <button type="button" class="btn btn-danger btn-sm" data-action="dislike">dislike</button>
                <button type="button" class="btn btn-secondary btn-sm" data-action="remove">remove</button>
                <span class="badge badge-info">id: ${item.id}</span>    
            `;
        } else if (item.name === 'regular') {
            el.innerHTML = `
                ${item.name}
                <span class="badge badge-warning">likes: ${item.likes}</span>
                <button type="button" class="btn btn-success btn-sm" data-action="like">like</button>
                <button type="button" class="btn btn-danger btn-sm" data-action="dislike">dislike</button>
                <button type="button" class="btn btn-secondary btn-sm" data-action="remove">remove</button>
                <span class="badge badge-info">id: ${item.id}</span>    
            `;
        };

        el.querySelector('[data-action=like]').addEventListener('click', () => {
            fetch(`${baseUrl}/posts/${item.id}/likes`, {
                method: 'POST',
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                const index = lastPosts.findIndex((post) => {
                    return post.id === item.id
                })
                lastPosts[index].likes++;
                rebuildList(postsEl, lastPosts);
            }).catch(error => {
                console.log(error)
            });
        });

        el.querySelector('[data-action=dislike]').addEventListener('click', () => {
            fetch(`${baseUrl}/posts/${item.id}/likes`, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                const index = lastPosts.findIndex((post) => {
                    return post.id === item.id
                })
                lastPosts[index].likes--;
                rebuildList(postsEl, lastPosts);
            }).catch(error => {
                console.log(error)
            });
        });

        el.querySelector('[data-action=remove]').addEventListener('click', () => {
            fetch(`${baseUrl}/posts/${item.id}`, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                const index = lastPosts.findIndex((post) => {
                    return post.id === item.id
                });
                lastPosts.splice(index, 1)
                rebuildList(postsEl, lastPosts);
            }).catch(error => {
                console.log(error)
            });
        });
        containerEl.appendChild(el);
    }
};

const butEl = document.createElement('button');
butEl.className = "btn btn-info mb-2";
butEl.textContent = 'Загрузить еще';

rootEl.appendChild(butEl);

butEl.addEventListener('click', function () {
    fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }).then(function (data) {
            if (data.length === 0) {
                butEl.style.display = "none";
            }
            else {
                if (data.length < 5) {
                    lastSeenId = data[data.length - 1].id;
                    lastPosts.push(...data.reverse());
                    butEl.style.display = "none";
                } else {
                    lastSeenId = data[data.length - 5].id;
                    lastPosts.push(...data.reverse());
                    butEl.style.display = "block";

                }
                rebuildList(postsEl, lastPosts);
            }
        }).catch(error => {
            console.log(error);
        });
})