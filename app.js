
var handler;

/** @constructor */
function OpenmixApplication(settings) {
    'use strict';

    /** @param {OpenmixConfiguration} config */
    this.do_init = function(config) {
        var i;
        if (settings.providers) {
            for (i = 0; i < settings.providers.length; i += 1) {
                config.requireProvider(settings.providers[i].alias);
            }
        }
    };

    /**
     * @param {OpenmixRequest} request
     * @param {OpenmixResponse} response
     */
    this.handle_request = function(request, response) {

        var reasons,
            data,
            subpopulation,
            candidates,
            availability_threshold = settings.normal_availability_threshold,
            rtt_filtered,
            provider,
            reason_code;

        function flatten(obj, property) {
            var result = {}, i;
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (obj[i].hasOwnProperty(property) && obj[i][property]) {
                        result[i] = obj[i][property];
                    }
                }
            }
            return result;
        }

        function provider_from_alias(alias) {
            var i;
            for (i = 0; i < settings.providers.length; i += 1) {
                if (alias === settings.providers[i].alias) {
                    return settings.providers[i];
                }
            }
            return null;
        }

        function to_numeric_sonar_data(obj) {
            var i, result = {}, temp;
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    temp = parseFloat(obj[i]);
                    //console.log(temp);
                    if (!isNaN(temp)) {
                        result[i] = 100 * temp;
                    }
                }
            }
            return result;
        }

        function filter_rtt(obj) {
            var i, result = {};
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    //console.log('current alias: ' + i);
                    if (-1 < candidates.indexOf(i)) {
                        if (obj[i] >= settings.min_valid_rtt) {
                            result[i] = obj[i];
                        }
                    }
                }
            }
            return result;
        }

        function as_tuples(obj) {
            var i, result = [];
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    result.push([i, obj[i]]);
                }
            }
            return result;
        }

        // Application logic here
        reasons = {
            rtt: 'A',
            single_available_candidate: 'D',
            none_available: 'E',
            missing_rtt_for_available_candidates: 'F'
        };

        data = {
            avail: flatten(request.getProbe('avail'), 'avail'),
            rtt: flatten(request.getProbe('http_rtt'), 'http_rtt'),
            sonar: to_numeric_sonar_data(request.getData('sonar'))
        };
        //console.log('avail: ' + JSON.stringify(data.avail));
        //console.log('sonar: ' + JSON.stringify(data.sonar));
        //console.log('rtt: ' + JSON.stringify(data.rtt));

        subpopulation = settings.country_mapping[request.country] || settings.default_providers;
        if (request.asn) {
            if (settings.asn_mapping[request.asn.toString()]) {
                subpopulation = settings.asn_mapping[request.asn.toString()];
                availability_threshold = settings.pingdom_availability_threshold;
            }
        }
        //console.log('subpop: ' + JSON.stringify(subpopulation));

        candidates = subpopulation.reduce(
            function(current, alias) {
                // Check Radar availability
                if (undefined !== data.avail[alias]) {
                    if (data.avail[alias] < availability_threshold) {
                        return current;
                    }
                }

                // Check Sonar availability
                if (undefined !== data.sonar[alias]) {
                    if (data.sonar[alias] < settings.sonar_threshold) {
                        return current;
                    }
                }

                current.push(alias);
                return current;
            },
            []
        );
        //console.log('candidates: ' + JSON.stringify(candidates));

        if (1 === candidates.length) {
            provider = provider_from_alias(candidates[0]);
            reason_code = reasons.single_available_candidate;
        } else if (0 === candidates.length) {
            provider = provider_from_alias(settings.last_resort_provider);
            reason_code = reasons.none_available;
        } else {
            rtt_filtered = as_tuples(filter_rtt(data.rtt))
                .sort(
                    function(left, right) {
                        if (left[1] < right[1]) {
                            return -1;
                        }
                        if (left[1] > right[1]) {
                            return 1;
                        }
                        return 0;
                    }
                );
            //console.log('rtt (filtered; as tuples; sorted): ' + JSON.stringify(rtt_filtered));
            if (1 > rtt_filtered.length) {
                provider = provider_from_alias(settings.last_resort_provider);
                reason_code = reasons.missing_rtt_for_available_candidates;
            } else {
                provider = provider_from_alias(rtt_filtered[0][0]);
                reason_code = reasons.rtt;
            }
        }

        response.respond(provider.alias, provider.cname);
        response.setReasonCode(reason_code);
        response.setTTL(settings.default_ttl);
    };

}

handler = new OpenmixApplication({
    providers: [
        { alias: 'cloudflare', cname: 'cdn.jsdelivr.net.cdn.cloudflare.net' },
        { alias: 'maxcdn', cname: 'jsdelivr3.dak.netdna-cdn.com' },
        { alias: 'leap-pt', cname: 'leap-pt.jsdelivr.net' },
        { alias: 'leap-ua', cname: 'leap-ua.jsdelivr.net' },
        { alias: 'prome-it', cname: 'prome-it.jsdelivr.net' },
        { alias: 'exvm-sg', cname: 'exvm-sg.jsdelivr.net' }
    ],
    country_mapping: {
        'CN': [ 'exvm-sg', 'cloudflare' ],
        'HK': [ 'exvm-sg', 'cloudflare' ],
        'ID': [ 'exvm-sg', 'cloudflare' ],
        'IT': [ 'prome-it', 'maxcdn', 'cloudflare' ],
        'IN': [ 'exvm-sg', 'cloudflare' ],
        'KR': [ 'exvm-sg', 'cloudflare' ],
        'MY': [ 'exvm-sg', 'cloudflare' ],
        'SG': [ 'exvm-sg', 'cloudflare' ],
        'TH': [ 'exvm-sg', 'cloudflare' ],
        'JP': [ 'exvm-sg', 'cloudflare', 'maxcdn' ],
        'UA': [ 'leap-ua', 'maxcdn', 'cloudflare' ],
        'RU': [ 'leap-ua', 'maxcdn' ],
        'VN': [ 'exvm-sg', 'cloudflare' ],
        'PT': [ 'leap-pt', 'maxcdn', 'cloudflare' ],
        'MA': [ 'leap-pt', 'prome-it', 'maxcdn', 'cloudflare' ]
    },
    asn_mapping: {
        '36114': [ 'maxcdn' ], // Las Vegas 2
        '36351': [ 'maxcdn' ], // San Jose + Washington
        '15003': [ 'maxcdn' ], // Chicago
        '8972': [ 'maxcdn' ], // Strasbourg
        '42473': [ 'prome-it' ], // Milan
        '32489': [ 'cloudflare' ], // Canada
        '32613': [ 'cloudflare' ], // Canada
        '25137': [ 'leap-pt' ], // Portugal
        '58206': [ 'leap-pt' ], // Portugal
        '16265': [ 'maxcdn' ], // Amsterdam
        '30736': [ 'maxcdn' ] // Denmark
    },
    default_providers: [ 'maxcdn', 'cloudflare' ],
    last_resort_provider: 'maxcdn',
    default_ttl: 20,
    normal_availability_threshold: 92,
    pingdom_availability_threshold: 50,
    sonar_threshold: 95,
    min_valid_rtt: 5
});

function init(config) {
    'use strict';
    handler.do_init(config);
}

function onRequest(request, response) {
    'use strict';
    handler.handle_request(request, response);
}
