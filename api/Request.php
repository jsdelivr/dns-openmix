<?php
/**
 * An object implementing the Request interface is passed to the
 * OpenmixApplication object's service method.
 */
interface Request
{
    /**
     * @param string $requestProperty One of the constants defined in RequestProperties
     *
     * Example::
     *
     *      $value = $request->request(RequestProperties::HOSTNAME);
     */
    public function request($requestProperty);

    /**
     * @param string $radarProbeType One of the constants defined in RadarProbeTypes
     *
     * Example::
     *
     *      $value = $request->radar(RadarProbeTypes::HTTP_RTT);
     */
    public function radar($radarProbeType);
    
    /**
     * @param string $geoProperty One of the constants defined in GeoProperties
     *
     * Examples::
     *
     *      $country = $request->geo(GeoProperties::COUNTRY);
     *      $market = $request->geo(GeoProperties::MARKET);
     *      $asn = $request->geo(GeoProperties::ASN);
     */
    public function geo($geoProperty);
    
    /**
     *
     * @param string $pulseProperty One of the constants defined in PulseProperties or RadarProbeTypes
     *
     * Examples::
     *
     *      $dataArray = $request->pulse(PulseProperties::LOAD);
     */
    public function pulse($pulseProperty);
    
    /**
     * @param string $fusionProperty One of the constants defined in FusionProperties
     *
     * Examples::
     *
     *      $dataArray = $request->fusion(FusionProperties::GB);
     */
    public function fusion($fusionProperty);
    
    /**
     * @param string $newrelicProperty One of the constants defined in NewrelicProperties
     *
     */
    public function newrelic($newrelicProperty);
    
}
?>
