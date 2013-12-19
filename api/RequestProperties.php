<?php

class RequestProperties
{
    /**
     * (string) This is the "hostname" of the Openmix app that processed the
     * request.  This bears some explanation because it's a bit of a misnomer
     * that has persisted for historical reasons.  It is not necessarily
     * the hostname of the request, as you might think.  Rather it's the **optional**
     * leftmost portion of the Openmix app ID, which you can set to be anything
     * you want when creating CNAME records mapping your subdomain(s) to the
     * Openmix app.  In this way you can have a single Openmix app provide DNS
     * routing for multiple subdomains, and identify the subdomain of the
     * request from within the app.
     *
     * For example, to handle the subdomains www.example.com, video.example.com
     * and downloads.example.com with the Openmix app having an ID of
     * 2-01-29a4-0001.cdx.cedexis.net, you might create CNAME records like this::
     *
     *     www        IN  CNAME  www.2-01-29a4-0001.cdx.cedexis.net
     *     video      IN  CNAME  video.2-01-29a4-0001.cdx.cedexis.net
     *     downloads  IN  CNAME  downloads.2-01-29a4-0001.cdx.cedexis.net
     *
     * From within the app::
     *
     *     class OpenmixApplication implements Lifecycle
     *     {
     *         public function init($config)
     *         {
     *             $config->declareInput(RequestProperties::HOSTNAME);
     *         }
     *         
     *         public function service($request,$response,$utilities)
     *         {
     *             $hostname = $request->request(RequestProperties::HOSTNAME);
     *
     *             // Now $hostname is one of: www, video, downloads.
     *             // You can use this data in your app's business logic.
     *         }
     *     }
     */
    const HOSTNAME = 'string:request:hostname';
    
    /**
     * (string) The IP address of the user's nameserver
     *
     * Example::
     *
     *      $value = $request->request(RequestProperties::IP);
     */
    const IP = 'string:request:ip';

    /**
     * (string) The id of the worker processing the request
     *
     * Some worker ID examples:
     *
     *     * worker-opx1.jfk.hw.prod
     *     * worker-opx1.mia.hw.prod
     *     * worker-opx1.sin.edg.prod
     *     * worker-opx1.ord.edg.prod
     *
     * Customers will generally be interested in the second part of this value, which
     * represents the **location** of the worker handling the request.  Please
     * contact `Sales <mailto:sales@cedexis.com>`_ for a list of available locations.
     *
     * From within the app::
     *
     *     class OpenmixApplication implements Lifecycle
     *     {
     *         public function init($config)
     *         {
     *             $config->declareInput(RequestProperties::WORKERID);
     *         }
     *         
     *         public function service($request,$response,$utilities)
     *         {
     *             $worker_id = $request->request(RequestProperties::WORKERID);
     *
     *             // $worker_id is now something like: worker-opx1.ord.edg.prod
     *             $location = explode('.', $worker_id)[1];
     *             
     *             // Now you can use the location in your app's business logic.
     *             
     *         }
     *     }
     *
     *       
     */
    const WORKERID = 'string:request:workerid';
}

?>
