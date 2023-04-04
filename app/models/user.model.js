const User = function (user) {
    (this.parent_id = user.parent_id),
        (this.name = user.name),
        (this.account = user.account),
        (this.password = user.password),
        (this.email = user.email),
        (this.phone = user.phone),
        (this.address = user.address),
        (this.role_id = user.role_id),
        (this.web_page = user.web_page),
        (this.refresh_token = user.refresh_token),
        (this.active = user.active),
        (this.avatar = user.avatar),
        (this.thumb = user.thumb),
        (this.created_at = user.created_at),
        (this.updated_at = user.updated_at);
};

module.exports = User;
