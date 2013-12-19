<?php

class EDNSProperties
{
    /**
     * (string) A two-letter code identifying the geographic market where the
     * request's client is located.
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
     *      $value = $request->geo(EDNSProperties::MARKET);
     */
    const MARKET  = 'string:edns:market_iso';

    /**
     * (string) ISO 3166-1 alpha-2 code assigned to the country where the
     * request's client is located
     */
    const COUNTRY = 'string:edns:country_iso';

    /**
     * (integer) ASN (Autonomous System Number) assigned to the network of the
     * request's origin
     */
    const ASN     = 'integer:edns:asn';

    /**
     * DEPRECATED
     *
     * This setting was previously used for enabling EDNS support. However,
     * EDNS support is now enabled by default so this setting is replaced
     * with `DISABLE`.
     *
     * Returns true in the `service` function if EDNS is enabled and we
     * have an EDNS_IP set.
     */
    const ENABLE = 'integer:enable_edns:enable_edns';

    /**
     * Disables EDNS support for an application. This can be used in the
     * `init` method to disable the use of EDNS for the application.
     */
    const DISABLE = 'integer:disable_edns:disable_edns';
}

?>
