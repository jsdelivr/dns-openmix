<?php
/**
 * Contains constants used to query Fusion reporting data.
 */
class FusionProperties
{
    /**
     * (real) The mount of content delivered by this provider since the beginning
     * of the month.
     *
     * Example::
     *
     *      $value = $request->fusion(FusionProperties::GB);
     */
    const GB  ='real:fusion:gb';
    
    /**
     * (real) The rate of content being delivered by this provider right now.
     *
     * Example::
     *
     *      $value = $request->fusion(FusionProperties::MBPS);
     */
    const MBPS='real:fusion:mbps';
}

?>
