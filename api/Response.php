<?php
/**
 * An object implementing the Response interface is passed to the
 * OpenmixApplication object's service method.
 */
interface Response
{
    /**
     * Called when you have a fixed response profile for a given provider.
     *
     * Example::
     *
     *      $response->selectProvider('provider_a');
     */
    public function selectProvider($provider);

    /**
     * Called when you want to respond with the provider and hostname - equivalent to return "host.name,provider"
     * Openmix now allows you to respond with an A record instead of CNAME only. To respond back with an A record,
     * call respond() and provide an IP Address instead of CNAME. 
     *
     * while $response->respond('example.com') will respond with a CNAME record.
     * 
     * IP Addresses can be in the form of 'a.b.c.d', 'a.b.c', 'a.b', 'a' where a,b,c,d are between  0 and 255 inclusive.
     *
     * Example::
     *
     *      $response->respond('provider_a', 'a.example.com');
     *      $response->respond('provider_a', '1.2.3.4'); will respond back with an A record
     */
    public function respond($provider,$cname);

    /**
     * Override the CNAME to return. This method is only effective if called **after**
     * `$utilities->selectRandom()` or `$response->selectProvider()` are called.
     *
     * Example::
     *
     *      $response->setCName('other.example.com');
     */
    public function setCName($cname);

    /**
     * Override the TTL to return.
     *
     * Example::
     *
     *      $response->setTTL(100);
     */
    public function setTTL($ttl);

    /**
     * Sets the reason code to one of the values defined by $config->declareReasonCode().
     *
     * Example::
     *
     *      $response->setReasonCode('A');
     */
    public function setReasonCode($code);

    /**
     * @param string $signal The name of a signal defined by $config->declareResponseSignal
     * @param mixed $value The value of the signal
     *
     * if location==null, the current request location is used
     */
    public function emitSignal($signal,$value,$location=null);
}
?>
