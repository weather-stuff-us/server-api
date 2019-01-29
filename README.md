@weather-stuff-us/server-api - server api for weather-stuff-us
================================================================================

APIs providing access to weather data via the [National Weather Service][].

Weather data is only available for locations in the United States.

[National Weather Service]: https://forecast-v3.weather.gov/documentation


api
================================================================================

This package exports the following functions:

## `forecastSummary (lat, lon)`

Returns a forecast summary for the specified latitude / longitude.

## `forecastTimeSeries (lat, lon)`

Returns forecast data for the specified latitude / longitude as a series
of data over time.

## `locationInfo (lat, lon)`

Returns information about the location at the specified latitude / longitude.

## `astroInfo (lat, lon, startDate, endDate)`

Returns astronimicon data for the location at the specified latitude / longitude.
Specifically, sun rise, sun set, moon rise, and moon set times, as well as
the phase of the moon.


Some example links if you happen to be running the server, for Apex, NC:

- http://localhost:3000/api/v1/astro/info?location=35.70539,-78.7963
- http://localhost:3000/api/v1/forecast/summary?location=35.70539,-78.7963
- http://localhost:3000/api/v1/forecast/time-series?location=35.70539,-78.7963
- http://localhost:3000/api/v1/location/info?location=35.70539,-78.7963


The source of most of the data is linked to from the following site
(again, for Apex, NC):

- https://api.weather.gov/points/35.70539,-78.7963

Documentation on the weather.gov APIs is available here:

- https://forecast-v3.weather.gov/documentation


install
================================================================================

This package is not available on `npm`, but can be installed from GitHub:

    npm install github:weather-stuff-us/server-api


license
================================================================================

This package is licensed under the MIT license.  See the [LICENSE.md][] file
for more information.


contributing
================================================================================

Awesome!  We're happy that you want to contribute.

Please read the [CONTRIBUTING.md][] file for more information.


[LICENSE.md]: LICENSE.md
[CONTRIBUTING.md]: CONTRIBUTING.md