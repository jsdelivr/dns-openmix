<?php

/**
 * These properties allow access to the data provided by the Pulse and Sonar.
 */
class PulseProperties
{
    /**
     * (string) Contains the contents of a file that the provider loads
     * periodically.  This may be used for dynamic configuration of an
     * Openmix application.
     *
     * Example::
     *
     *      $data = $request->pulse(PulseProperties::LOAD);
     */
    const LOAD = 'longstring:pload:load';
    
    /**
     * (real) A percentage of the number of Sonar pings that are positive.
     *
     * Example::
     *
     *      $data = $request->pulse(PulseProperties::SONAR);
     */
    const LIVE = 'real:plive:live';

    const SONAR = 'real:plive:live';
}

?>
