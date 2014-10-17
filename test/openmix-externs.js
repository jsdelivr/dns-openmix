
/**
 * @typedef {{requireProvider:function(string)}}
 */
var OpenmixConfiguration;

/**
 * @typedef {{
 *      market:string,
 *      country:string,
 *      asn:number,
 *      hostname_prefix:string,
 *      getProbe:function(string):!Object.<string,!Object.<string,number>>,
 *      getData:function(string):!Object.<string,string>
 *  }}
 */
var OpenmixRequest;

/**
 * @typedef {{
 *      addCName:function(string),
 *      respond:function(string,string),
 *      setTTL:function(number),
 *      setReasonCode:function(string)
 * }}
 */
var OpenmixResponse;
