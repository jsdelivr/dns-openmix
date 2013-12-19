<?php
/**
 * Contains constants used to make requests for Newrelic properties
 *
 * Example::
 *
 *      public function service($request, $response, $utilities)
 *      {
 *          $cpu = $request->newrelic(NewrelicProperties::CPU);
 *      }
 */
class NewrelicProperties
{
    /**
     * (real) Apdex value returned from Newrelic
     */
    const APDEX                         = 'real:newrelic:apdex';
    
    /**
     * (real) CPU value returned from Newrelic
     */
    const CPU                  = 'real:newrelic:cpu';
    
    /**
     * (real) Memory value returned from Newrelic
     */
    const MEMORY                 = 'real:newrelic:memory';
    
    /**
     * (real) Errors value returned from Newrelic
     */
    const ERRORS                       = 'real:newrelic:errors';
    
    /**
     * (real) Response time returned from Newrelic
     */
    const RESPONSE_TIME                   = 'real:newrelic:response_time';
    
    /**
     * (real) Throughput value returned from Newrelic
     */
    const THROUGHPUT                  = 'real:newrelic:throughput';
    
    /**
     * (real) DB value returned from Newrelic
     */
    const DB                 = 'real:newrelic:db';
}
?>
