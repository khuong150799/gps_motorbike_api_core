const Device = function (device) {
    (this.userid = device.userid),
        (this.name = device.name),
        (this.imei = device.imei),
        (this.sim_card = device.sim_card),
        (this.expired_on = device.expired_on),
        (this.created_at = device.created_at),
        (this.updated_at = device.updated_at);
};

module.exports = Device;
