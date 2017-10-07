class Users {
  constructor() {
    this.users = [];
  }

  addUser(id) {
    const user = {id}
    this.users.push(user);
    return user;
  }

  updateUserHashtag(id, hashtag) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id ) {
        this.users[i]['hashtag'] = hashtag;
      }
    }
  }

  removeUser(id) {
    const user = this.getUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== id );
    }
    return user;
  }

  getHashtagList() {
    let hashtagList = [];
    this.users.forEach((user) => hashtagList.push(user.hashtag));
    return hashtagList;
  }

  getUser(id) {
    return this.users.filter((user) => user.id === id)[0]
  }

  getUserQTY() {
    return this.users.length;
  }
}

module.exports = { Users };
