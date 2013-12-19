<?php

class GeoProperties
{
    /**
     * (string) A two-letter code identifying the geographic market where the
     * request's nameserver is located.
     *
     * +------+---------------+
     * | Code | Market        |
     * +======+===============+
     * | NA   | North America |
     * +------+---------------+
     * | OC   | Oceania       |
     * +------+---------------+
     * | EU   | Europe        |
     * +------+---------------+
     * | AS   | Asia          |
     * +------+---------------+
     * | AF   | Africa        |
     * +------+---------------+
     * | SA   | South America |
     * +------+---------------+
     *
     * Example::
     *
     *      $value = $request->geo(GeoProperties::MARKET);
     */
    const MARKET  = 'string:geo:market_iso';
    
    /**
     * (string) ISO 3166-1 alpha-2 code assigned to the country where the
     * request's nameserver is located.  See
     * `Wikipedia <http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements>`_.
     *
     * Example::
     *
     *      $value = $request->geo(GeoProperties::COUNTRY);
     */
    const COUNTRY = 'string:geo:country_iso';
    
    /**
     * (integer) ASN (Autonomous System Number) assigned to the network of the
     * request's origin.
     *
     * Example::
     *
     *      $value = $request->geo(GeoProperties::ASN);
     */
    const ASN     = 'integer:geo:asn';
}

?>
