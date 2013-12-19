<?php
/**
 * The Lifecycle interface must be implemented by the OpenmixApplication class.
 */
interface Lifecycle
{
    /**
     * This is called by the system to declare the input requirements for the
     * application and to define the response profiles produced by the application.
     *
     * The function is called once, and can also be used to initialize internal
     * data structures and variables for the application.
     */
    public function init($config);

    /**
     * This function is called to handle each request.
     */
    public function service($request,$response,$utilities);
}
?>
