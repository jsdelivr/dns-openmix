<?php
/**
 * An object implementing the Utilities interface is passed to the
 * OpenmixApplication object's service method.
 */
interface Utilities
{
    /**
     * Choose a random provider from the set of all options.
     *
     * Example::
     *
     *      $utilities->selectRandom();
     */
    public function selectRandom();
}
?>
