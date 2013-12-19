<?php

class RadarProbeTypes
{
    /**
     * (real) Percentage of successful visits; returns a number from 0-100
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::AVAILABILITY);
     */
    const AVAILABILITY= 'real:score:avail';
    
    /**
     * (real) Response time
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::HTTP_RTT);
     */
    const HTTP_RTT    = 'real:score:http_rtt';
    
    /**
     * (real) Time to load a custom probe
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::HTTP_CUSTOM);
     */
    const HTTP_CUSTOM = 'real:score:http_custom';
    
    /**
     * Not used.
     */
    const HTTP_XL     = 'real:score:http_xl';
    
    /**
     * (real) Measures throughput time for large objects, generally 100KB
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::HTTP_KBPS);
     */
    const HTTP_KBPS   = 'real:score:http_kbps';
    
    /**
     * (real) Internet streaming connect time
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::RTMP_CONNECT);
     */
    const RTMP_CONNECT= 'real:score:rtmp_connect';
    
    /**
     * (real) Internet streaming time to buffer
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::RTMP_BUFFER);
     */
    const RTMP_BUFFER = 'real:score:rtmp_buffer';
    
    /**
     * (real) Internet streaming throughput
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::RTMP_KBPS);
     */
    const RTMP_KBPS   = 'real:score:rtmp_kbps';
    
    /**
     * (real) Response time for secure requests
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::SSL_RTT);
     */
    const SSL_RTT     = 'real:score:ssl_rtt';
    
    /**
     * (real) Time to load a custom probe over a secure connection.
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::SSL_CUSTOM);
     */
    const SSL_CUSTOM  = 'real:score:ssl_custom';
    
    /**
     * (real) Measures throughput time for large objects served over a secure connection,
     * generally 100KB
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::SSL_KBPS);
     */
    const SSL_KBPS    = 'real:score:ssl_kbps';
}

?>
