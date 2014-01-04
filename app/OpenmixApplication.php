<?php

/**
 * For information on writing Openmix applications, check out
 * https://github.com/cedexis/openmixapplib/wiki
 */
class OpenmixApplication implements Lifecycle
{
    // Map provider aliases to cnames
    public $cnames = array(
        'cdn_net' => '531151672.r.worldcdn.net',
        'maxcdn' => 'jsdelivr3.dak.netdna-cdn.com',
        'leap-pt' => 'leap-pt.jsdelivr.net',
        'leap-ua' => 'leap-ua.jsdelivr.net',
        'prome-it' => 'prome-it.jsdelivr.net',
        'exvm-sg' => 'exvm-sg.jsdelivr.net',
        'knight-nl' => 'knight-nl.jsdelivr.net',
        'alpine-ch' => 'alpine-ch.jsdelivr.net',
        'jetdi-id' => 'jetdi-id.jsdelivr.net',
        'finn-fr' => 'finn-fr.jsdelivr.net',
    );

    // If you add or subtract any public providers, update these!
    public $default_providers = array( 'maxcdn', 'cdn_net' );

    // The most likely to be available; selected as a last resort only
    public $last_resort_provider = 'maxcdn';

    // ASNs mapped to an array of one or more provider aliases.
    //
    // ASN overrides should only be necessary if you want a different subpopulation
    // of providers to be considered than those specified by $default_providers or
    // in $country_overrides.
    //
    // It should do no harm to include the public providers for consideration,
    // so these overrides should generally be used to create supersets that include
    // the default providers.
    //
    // For the most part, we'll only put ASNs in here where Radar data has problems
    // and needs research.
    public $asn_overrides = array(
        '36114' => array( 'maxcdn' ), // Las Vegas 2
        '36351' => array( 'maxcdn' ), // San Jose + Washington
        '15003' => array( 'maxcdn' ), // Chicago
        '8972' => array( 'maxcdn' ), // Strasbourg 
        '42473' => array( 'prome-it' ), // Milan 
        '32489' => array( 'maxcdn' ), // Canada 
        '25137' => array( 'leap-pt' ), // Portugal 
        '16265' => array( 'maxcdn' ), // Amsterdam 
        '30736' => array( 'cdn_net' ), // Denmark 
    );

    // country codes mapped to an array of one or more provider aliases
    //
    // ref: http://en.wikipedia.org/wiki/ISO_3166-1
    //
    // It should do no harm to include the public providers for consideration,
    // so these overrides should generally be used to create supersets that include
    // the default providers
    public $country_overrides = array(
        'CH' => array( 'alpine-ch', 'maxcdn', 'cdn_net' ),
        'CN' => array( 'exvm-sg', 'jetdi-id' ),
        'NL' => array( 'knight-nl', 'maxcdn', 'cdn_net' ),
        'HK' => array( 'exvm-sg', 'jetdi-id' ),
        'ID' => array( 'jetdi-id', 'exvm-sg' ),
        'IT' => array( 'prome-it', 'maxcdn', 'cdn_net' ),
        'IN' => array( 'exvm-sg', 'jetdi-id' ),
        'KR' => array( 'exvm-sg', 'jetdi-id' ),
        'MY' => array( 'exvm-sg', 'jetdi-id' ),
        'SG' => array( 'exvm-sg', 'jetdi-id' ),
        'TH' => array( 'exvm-sg', 'jetdi-id' ),
        'JP' => array( 'exvm-sg', 'jetdi-id', 'cdn_net', 'maxcdn' ),
        'UA' => array( 'knight-nl', 'leap-ua', 'maxcdn' ),
        'RU' => array( 'knight-nl', 'leap-ua', 'maxcdn', 'cdn_net' ),
        'GR' => array( 'knight-nl', 'finn-fr', 'maxcdn', 'cdn_net' ),
        'VN' => array( 'exvm-sg', 'jetdi-id' ),
        'RO' => array( 'knight-nl', 'maxcdn', 'cdn_net' ),
        'PT' => array( 'leap-pt', 'maxcdn', 'cdn_net' ),
        'DE' => array( 'knight-nl', 'maxcdn', 'cdn_net' ),
        'NO' => array( 'knight-nl', 'maxcdn', 'cdn_net' ),
        'RS' => array( 'knight-nl', 'maxcdn', 'cdn_net' ),
        'DK' => array( 'maxcdn', 'cdn_net' ),
        'AT' => array( 'knight-nl', 'maxcdn', 'cdn_net' ),
        'FI' => array( 'finn-fr', 'knight-nl', 'maxcdn'),
        'FR' => array( 'finn-fr', 'knight-nl', 'maxcdn', 'cdn_net' ),
        'MA' => array( 'finn-fr', 'knight-nl', 'maxcdn', 'cdn_net' ),
    );

    // The thresholds (%) below which we consider a CDN unavailable
    public $normal_availability_threshold = 90;
    public $pingdom_availability_threshold = 50;
    public $sonar_threshold = 95;
    public $min_valid_rtt = 5;
    public $ttl = 20;
    
    public $reasons = array(
        'A', // RTT
        //'B', // reserved
        //'C', // reserved
        'D', // Single available candidate
        'E', // None available
        'F', // No RTT data for available candidates
    );
    
    /**
     * @param Configuration $config
     **/
    public function init($config)
    {
        foreach ($this->cnames as $alias => $cname) {
            $config->declareResponseOption($alias, $cname, $this->ttl);
        }

        foreach ($this->reasons as $code) {
            $config->declareReasonCode($code);
        }

        // Only consider availability data for public providers
        $config->declareInput(RadarProbeTypes::AVAILABILITY, implode(',', $this->default_providers));

        $config->declareInput(RadarProbeTypes::HTTP_RTT, implode(',', array_keys($this->cnames)));
        $config->declareInput(PulseProperties::SONAR, implode(',', array_keys($this->cnames)));
        $config->declareInput(GeoProperties::COUNTRY);
        $config->declareInput(GeoProperties::ASN);
        $config->declareInput(EDNSProperties::ENABLE);
        $config->declareInput(EDNSProperties::COUNTRY);
        $config->declareInput(EDNSProperties::ASN);
    }
    
    /**
     * @param Request $request
     * @param Response $response
     * @param Utilities $utilities
     **/
    public function service($request, $response, $utilities)
    {
        $edns_enabled = $request->geo(EDNSProperties::ENABLE);
        $asn = $request->geo($edns_enabled ? EDNSProperties::ASN : GeoProperties::ASN);
        $country = $request->geo($edns_enabled ? EDNSProperties::COUNTRY : GeoProperties::COUNTRY);
        //print("\nASN: $asn");
        //print("\nCountry: $country");
        
        $avail = $request->radar(RadarProbeTypes::AVAILABILITY);
        $sonar = $request->pulse(PulseProperties::SONAR);
        //print("\nAvail:" . print_r($avail, true));
        //print("\nSonar:" . print_r($sonar, true));

        // Identify subpopulation
        $avalability_threshold = $this->normal_availability_threshold;
        $subpopulation = $this->default_providers;
        if (array_key_exists($asn, $this->asn_overrides)) {
            //print("\nASN override!");
            $subpopulation = $this->asn_overrides[$asn];
            $avalability_threshold = $this->pingdom_availability_threshold;
        }
        elseif (array_key_exists($country, $this->country_overrides)) {
            //print("\nCountry override!");
            $subpopulation = $this->country_overrides[$country];
        }
        //print("\nSubpopulation:" . print_r($subpopulation, true));

        $candidates = array();
        foreach ($subpopulation as $alias) {
            $good = true;
            if (array_key_exists($alias, $avail)) {
                $value = $avail[$alias];
                if ($value < $avalability_threshold) {
                    $good = false;
                }
            }
            
            if ($good && array_key_exists($alias, $sonar)) {
                $value = $sonar[$alias];
                if ($value < $this->sonar_threshold) {
                    $good = false;
                }
            }
            
            if ($good) {
                array_push($candidates, $alias);
            }
        }
        //print("\nCandidates:" . print_r($candidates, true));

        // If there's only one available candidate, just select it
        if (1 == count($candidates)) {
            $response->selectProvider($candidates[0]);
            $response->setReasonCode('D');
            return;
        }
        elseif (0 == count($candidates)) {
            // No providers available -- this should be rare
            $response->selectProvider($this->last_resort_provider);
            $response->setReasonCode('E');
            return;
        }
        
        // We should get to this point most of the time
        $rtt = $request->radar(RadarProbeTypes::HTTP_RTT);
        //print("\nRTT:" . print_r($rtt, true));
        $rtt = array_filter($rtt, array($this, 'got_rtt'));
        //print("\nRTT (filtered on got_rtt):" . print_r($rtt, true));
        $rtt = array_intersect_key($rtt, array_flip($candidates));
        //print("\nRTT (for candidates):" . print_r($rtt, true));

        if (0 == count($rtt)) {
            // No valid RTT data -- this should be rare
            $response->selectProvider($this->last_resort_provider);
            $response->setReasonCode('F');
            return;
        }

        asort($rtt);
        //print("\nRTT (sorted):" . print_r($rtt, true));
        $response->selectProvider(key($rtt));
        $response->setReasonCode('A');
    }

    public function got_rtt($score) {
        //print("\nScore: $score");
        return $score >= $this->min_valid_rtt;
    }
}

?>
