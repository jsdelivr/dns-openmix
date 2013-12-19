#!/usr/bin/env python3

"""
Produce a formatted list of country override lines suitable for copying
and pasting in the Openmix app.
"""

import os
import sys
import csv
import argparse
from pprint import pprint

import common
from common.errors import InputFileProblem

def make_record(raw):
    return {
        'created_at': raw[0],
        'country': raw[1],
        'provider_id': int(raw[2]),
        'measurements': int(raw[3]),
    }

def read_data(input_file, min_requests_per_minute, min_percent_of_minutes):
    """
    Returns something like::

        {
            'US': [ 7844, 7845, 8423, 8457 ],
            'GB': [ 8423, 8457, 8593 ]
        }

    where each provider listed had a minimum number of minutes per hour having
    at least 1 measurement from the given country.
    """

    # Filter input data by minimum desired measurements per minute
    with open(input_file) as fp:
        reader = csv.reader(fp)
        next(reader)

        # Assemble the data
        data = {}
        for i in [ make_record(i) for i in reader ]:
            minute_data = data[i['created_at']] = data.get(i['created_at'], {})
            country_data = minute_data[i['country']] = minute_data.get(i['country'], {})
            if not i['provider_id'] in country_data:
                country_data[i['provider_id']] = 0
            country_data[i['provider_id']] += i['measurements']

    # Eliminate the first and last 2 minutes, just to be safe
    ordered_keys = list(sorted(data))
    del data[ordered_keys[0]]
    del data[ordered_keys[1]]
    del data[ordered_keys[-1]]
    del data[ordered_keys[-2]]

    # Get the number of minutes for each country/provider that had at least one measurement
    country_minute_counts = {}
    for i in data:
        for j in data[i]:
            country_data = country_minute_counts[j] = country_minute_counts.get(j, {})
            for k in data[i][j]:
                #print(k, data[i][j][k])
                if not k in country_data:
                    country_data[k] = 0
                if min_requests_per_minute <= data[i][j][k]:
                    country_data[k] += 1
    #pprint(country_minute_counts)

    result = {}
    count_of_minutes = len(data)
    for country in country_minute_counts:
        for provider_id in country_minute_counts[country]:
            qualified = country_minute_counts[country][provider_id]
            percent = 100 * qualified / count_of_minutes
            #print(country, provider_id, qualified, percent)
            if percent >= min_percent_of_minutes:
                country_data = result[country] = result.get(country, set())
                country_data.add(provider_id)

    return result

def main():

    default_input_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data/jsdelivr-country-provider-minute.csv')

    parser = argparse.ArgumentParser()
    parser.add_argument('--min-percent', '-p', type=int, required=True, help='Minium percentage of minutes to qualify country/provider')
    parser.add_argument('--min-per-minute', '-m', type=int, required=True, help='Minium number of requests per minute to qualify for tally')
    parser.add_argument('--input', '-i', default=default_input_file, help='Input file path (optional)')
    args = parser.parse_args()
    print(args)

    data = read_data(args.input, args.min_per_minute, args.min_percent)
    #pprint(data)
    output = ''
    for country in data:
        output += "'{}' => array( ".format(country)
        output += ', '.join([ "'{}'".format(i) for i in common.default_providers + [ common.provider_aliases[i] for i in data[country] ] ])
        output += ' ),\n'

    print('\nPaste the following country overrides into the Openmix app:\n')
    print(output)

if __name__ == '__main__':
    print(sys.version)
    main()
