class GithubUsers {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;
    return fetch(endpoint)
      .then(data => data.json())
      .then(({login, name, public_repos, followers}) => ({
          login, 
          name,
          public_repos,
          followers}));
  }
}

// classe para os dados e a lógica
class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }
  // salvar no localStorage
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }
  // adicionar novos usuários
  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username);
      if (userExists) {
        throw new Error('Usuário já existente!');
      }
      const user = await GithubUsers.search(username);
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!');
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch(e) {
      alert(e.message);
    }
  }
  // remoção novos usuários
  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login);
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}
// classe para visualização dos dados e eventos
class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = document.querySelector('table tbody');

    this.update();
    this.onadd();
  }

  // função onadd para adicionar evento ao butão de 'favoritar' 
  onadd() {
    const button = this.root.querySelector('.search button');
    button.onclick = () => {
      const {value} = this.root.querySelector('.search input');
      this.add(value);
    }
    
  }

  update() {
    this.removeAllTr();
    if (this.entries.length > 0) {
      this.tbody.querySelector('.no-content td').style.display = 'none';
    } else {
      this.tbody.querySelector('.no-content td').style.display = 'table-cell';
    }
    this.entries.forEach(user => {
      const row = this.createRow();
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${user.login}`;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      row.querySelector('.user a p').textContent = user.name;
      row.querySelector('.user a span').textContent = `/${user.login}`;
      row.querySelector('.repos').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?');
        if (isOk) {
          this.delete(user);
        }
      };
      this.tbody.append(row);
    })
    
  }

  createRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/Italo-Chiaradia.png" alt="Imagem de Italo-Chiaradia">
        <a href="https://github.com/Italo-Chiaradia" target="_blank">
          <p>Italo Chiaradia</p>
          <span>/Italo-Chiaradia</span>
        </a>
        </td>
        <td class="repos">
        28
        </td>
        <td class="followers">
        3
        </td>
        <td>
        <button class="remove">Remover</button>
      </td>`;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      console.log();
      if (!tr.classList.contains('no-content')) {
        tr.remove();
      }
      
    });
  }
}

const favorites = new FavoritesView("#app");