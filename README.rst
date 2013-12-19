========
jsdelivr
========

Repository containing the jsDelivr Openmix app and associated tools.

Country Overrides Script
========================

There's a script that can be used to generate suitable country overrides.

By default, it uses the data/jsdelivr-country-provider-minute.csv file as
input, but also accepts an optional input file path.

Usage::

    $ ./gen_country_overrides.py --help
    3.3.2+ (default, Oct  9 2013, 14:50:09) 
    [GCC 4.8.1]
    usage: gen_country_overrides.py [-h] --min-percent MIN_PERCENT
                                    --min-per-minute MIN_PER_MINUTE
                                    [--input INPUT]
    
    optional arguments:
      -h, --help            show this help message and exit
      --min-percent MIN_PERCENT, -p MIN_PERCENT
                            Minium percentage of minutes to qualify
                            country/provider
      --min-per-minute MIN_PER_MINUTE, -m MIN_PER_MINUTE
                            Minium number of requests per minute to qualify for
                            tally
      --input INPUT, -i INPUT
                            Input file path (optional)

**MIN_PER_MINUTE**: The number RTT measurements in a minute to qualify that
minute for inclusion in the tally.

**MIN_PERCENT**: The percentage of minutes having a qualifying number of RTT
measurements necessary for the provider to be included in the country list.

::

    $ ./gen_country_overrides.py --min-per-minute 2 --min-percent 50
    3.3.2+ (default, Oct  9 2013, 14:50:09) 
    [GCC 4.8.1]
    Namespace(input='/home/jacob/repos/cedexis/jsdelivr/data/jsdelivr-country-provider-minute.csv', min_per_minute=2, min_percent=50)
    
    Paste the following country overrides into the Openmix app:
    
    'US' => array( 'maxcdn', 'cdn_net', 'finn-fr', 'leap-ua', 'exvm-sg', 'alpine-ch', 'prome-it', 'leap-pt', 'knight-nl', 'jetdi-id' ),
    'IT' => array( 'maxcdn', 'cdn_net', 'finn-fr', 'leap-ua', 'alpine-ch', 'prome-it', 'leap-pt', 'knight-nl' ),
    'BR' => array( 'maxcdn', 'cdn_net', 'finn-fr', 'leap-ua', 'exvm-sg', 'alpine-ch', 'prome-it', 'leap-pt', 'knight-nl', 'jetdi-id' ),
    'DE' => array( 'maxcdn', 'cdn_net', 'alpine-ch', 'knight-nl', 'finn-fr', 'jetdi-id' ),
    'CA' => array( 'maxcdn', 'cdn_net', 'finn-fr', 'leap-ua', 'exvm-sg', 'alpine-ch', 'prome-it', 'leap-pt', 'knight-nl', 'jetdi-id' ),
    'AU' => array( 'maxcdn', 'cdn_net', 'finn-fr', 'leap-ua', 'exvm-sg', 'alpine-ch', 'prome-it', 'leap-pt', 'knight-nl', 'jetdi-id' ),
    'MX' => array( 'maxcdn', 'cdn_net', 'alpine-ch' ),
    'GB' => array( 'maxcdn', 'cdn_net', 'finn-fr', 'leap-ua', 'exvm-sg', 'alpine-ch', 'prome-it', 'leap-pt', 'knight-nl', 'jetdi-id' ),
