
/** @constructor */
function OpenmixConfiguration() {}

OpenmixConfiguration.prototype.requireProvider = function(alias) {};

/** @constructor */
function OpenmixRequest() {
    /** @type {string} */
    this.market = 'some market';
    /** @type {string} */
    this.country = 'some country';
}

OpenmixRequest.prototype.getProbe = function(probe_type) {};
OpenmixRequest.prototype.getData = function(feed_name) {};

/** @constructor */
function OpenmixResponse() {}

OpenmixResponse.prototype.respond = function(alias, cname) {};
OpenmixResponse.prototype.setTTL = function(value) {};
OpenmixResponse.prototype.setReasonCode = function(value) {};
