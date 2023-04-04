const Admin = function (admin) {
    (this.name = admin.name),
        (this.account = admin.account),
        (this.password = admin.password),
        (this.email = admin.email),
        (this.phone = admin.phone),
        (this.address = admin.address),
        (this.role_id = admin.role_id),
        (this.refresh_token = admin.refresh_token),
        (this.active = admin.active),
        (this.created_at = admin.created_at),
        (this.updated_at = admin.updated_at);
};

module.exports = Admin;
