var handler = new OpenmixApplication({
    providers: {
        'cloudflare': 'cdn.jsdelivr.net.cdn.cloudflare.net',
        'maxcdn': 'jsdelivr3.dak.netdna-cdn.com',
        'tm-mg': 'tm-mg.jsdelivr.net',
        'keycdn': 'jsdelivr-cb7.kxcdn.com',
        'quantil': 'cdn.jsdelivr.net.mwcloudcdn.com'
    },
    // Use countryMapping to give consideration to additional providers for
    // specific countries:
    countryMapping: {
        'MG': [ 'tm-mg', 'maxcdn', 'cloudflare', 'keycdn' ],
        'CN': [ 'quantil'],
        'TH': [ 'maxcdn', 'cloudflare', 'keycdn', 'quantil'],
        'BR': [ 'cloudflare']
    },
    defaultProviders: [ 'maxcdn', 'cloudflare', 'keycdn' ],
    lastResortProvider: 'maxcdn',
    defaultTtl: 20,
    availabilityThresholds: {
        normal: 95
    },
    //Set Fusion Sonar threshold for availability for the platform to be included.
    // sonar values are between 0 - 5
    fusionSonarThreshold: 2
});

function init(config) {
    'use strict';
    handler.doInit(config);
}

function onRequest(request, response) {
    'use strict';
    handler.handleRequest(request, response);
}

/**
 * @constructor
 * @param {{
 *      providers:!Object.<string,string>
 * }} settings
 */
function OpenmixApplication(settings) {
    'use strict';

    var aliases = Object.keys(settings.providers);

    /** @param {OpenmixConfiguration} config */
    this.doInit = function(config) {
        var i = aliases.length;
        while (i--) {
            config.requireProvider(aliases[i]);
        }
    };

    /**
     * @param {OpenmixRequest} request
     * @param {OpenmixResponse} response
     */
    this.handleRequest = function(request, response) {

        var reasons,
            candidates,
            candidateAliases,
            dataFusionAliases,
            dataAvail = request.getProbe('avail'),
            dataRtt = request.getProbe('http_rtt'),
            /** @type { !Object.<string, { health_score: { value:string }, availability_override:string}> } */
            dataFusion = parseFusionData(request.getData('fusion')),
            subpopulation = settings.defaultProviders,
            availabilityThreshold = settings.availabilityThresholds.normal,
            country = request.country,
            decisionAlias,
            decisionReasons = [],
            decisionTtl;

        /**
         * @param {{avail:number}} candidate
         * @param {string} alias
         */
        function filterAvailCandidates(candidate, alias) {
            return (-1 < subpopulation.indexOf(alias))
                && (candidate.avail !== undefined)
                && (candidate.avail >= availabilityThreshold);
        }

        /**
         * @param {{avail:number}} candidate
         * @param {string} alias
         */
        function filterAvailAndFusionSonarCandidates(candidate, alias) {
            return (-1 < subpopulation.indexOf(alias))
                && (candidate.avail !== undefined)
                && (candidate.avail >= availabilityThreshold)
                && (dataFusion[alias] !== undefined)
                && (dataFusion[alias].health_score.value > settings.fusionSonarThreshold);
        }

        // Application logic here
        reasons = {
            rtt: 'A',
            singleAvailableCandidate: 'D',
            noneAvailableOrNoRtt: 'E'
        };

        if (settings.countryMapping) {
            if (settings.countryMapping[country] !== undefined) {
                subpopulation = settings.countryMapping[country];
            }
        }

        if (Object.keys(dataAvail).length > 0 && Object.keys(dataRtt).length > 0) {
            if (Object.keys(dataFusion).length > 0) {
                dataFusionAliases = Object.keys(dataFusion);
                //check if "Big Red Button" isn't activated
                if (dataFusion[dataFusionAliases[0]].availability_override === undefined) {
                    // remove any that don't meet the Fusion Sonar threshold
                    candidates = filterObject(dataAvail, filterAvailAndFusionSonarCandidates);
                }
            }
            if (candidates === undefined) {
                candidates = filterObject(dataAvail, filterAvailCandidates);
            }

            //console.log('candidates: ' + JSON.stringify(candidates));
            candidates = joinObjects(candidates, dataRtt, 'http_rtt');
            //console.log('candidates (with rtt): ' + JSON.stringify(candidates));
            candidateAliases = Object.keys(candidates);

            if (1 === candidateAliases.length) {
                decisionAlias = candidateAliases[0];
                decisionReasons.push(reasons.singleAvailableCandidate);
                decisionTtl = decisionTtl || settings.defaultTtl;
            } else if (0 === candidateAliases.length) {
                decisionAlias = settings.lastResortProvider;
                decisionReasons.push(reasons.noneAvailableOrNoRtt);
                decisionTtl = decisionTtl || settings.defaultTtl;
            } else {
                decisionAlias = getLowest(candidates, 'http_rtt');
                decisionReasons.push(reasons.rtt);
                decisionTtl = decisionTtl || settings.defaultTtl;
            }
        }
        else {
            decisionAlias = settings.lastResortProvider;
            decisionReasons.push(reasons.noneAvailableOrNoRtt);
            decisionTtl = decisionTtl || settings.defaultTtl;
        }

        response.respond(decisionAlias, settings.providers[decisionAlias]);
        response.setReasonCode(decisionReasons.join(''));
        response.setTTL(decisionTtl);
    };

    /**
     * @param {!Object} object
     * @param {Function} filter
     */
    function filterObject(object, filter) {
        var keys = Object.keys(object),
            i = keys.length,
            key;

        while (i --) {
            key = keys[i];

            if (!filter(object[key], key)) {
                delete object[key];
            }
        }

        return object;
    }

    /**
     * @param {!Object} target
     * @param {Object} source
     * @param {string} property
     */
    function joinObjects(target, source, property) {
        var keys = Object.keys(target),
            i = keys.length,
            key;

        while (i --) {
            key = keys[i];

            if (typeof source[key] !== 'undefined' && typeof source[key][property] !== 'undefined') {
                target[key][property] = source[key][property];
            }
            else {
                delete target[key];
            }
        }

        return target;
    }

    /**
     * @param {!Object} source
     * @param {string} property
     */
    function getLowest(source, property) {
        var keys = Object.keys(source),
            i = keys.length,
            key,
            candidate,
            min = Infinity,
            value;

        while (i --) {
            key = keys[i];
            value = source[key][property];

            if (value < min) {
                candidate = key;
                min = value;
            }
        }

        return candidate;
    }

    /**
     * @param {!Object} data
     */
    function parseFusionData(data) {
        var keys = Object.keys(data),
            i = keys.length,
            key;
        while (i --) {
            key = keys[i];
            try {
                data[key] = JSON.parse(data[key]);
            }
            catch (e) {
                delete data[key];
            }
        }
        return data;
    }

}
