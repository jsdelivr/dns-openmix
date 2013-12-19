<?php
/**
 * An object implementing the Configuration interface is passed to the
 * OpenmixApplication object's init method.
 *
 * The object is used to define the input requirements of the application
 * and to define the response profiles.  This information is used by the
 * worker during initialization.  The worker will place an application in
 * fallback mode if it cannot provide the input required by the application,
 * and it will map unknown responses to a special reporting customer.
 */
interface Configuration
{
    /**
     * $what -> a property from one of the properties API objects
     * $who -> a comma separated list of providers of interest for this type
     *
     * If $what is from RequestProperties or GeoProperties
     * then it is about the current request and needs no qualifiers.  If it
     * is from another properties object, then it needs a qualifier to indicate
     * which providers it applies to.
     *
     * Example::
     *
     *      $config->declareInput(RadarProbeTypes::HTTP_RTT, 'provider_a,provider_b, provider_c');
     *
     */
    public function declareInput($what,$who=null);

    /**
     * This lets us know about a response option.  You select
     * these via the $Response->selectProvider($nickname) - then you
     * can override or update the specific properties on a per
     * response basis.
     *
     * Example::
     *
     *      $config->declareResponseOption('provider_a', 'a.example.com', 60);
     */
    public function declareResponseOption($nickname,$cname,$ttl);

    /**
     * Declare a reason code to return via setReasonCode
     *
     * Example::
     *
     *      $config->declareReasonCode('A');
     */
    public function declareReasonCode($code);

    /**
     * Name a signal that you want to return via response->emitSignal
     */
    public function declareResponseSignal($signal);
}
?>
