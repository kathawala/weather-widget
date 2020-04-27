# weather-widget

A clean, attractive, simple weather widget, all in one `<script>` tag.
Made with [Fomantic-UI](https://github.com/fomantic/Fomantic-UI)
-- a community fork of [Semantic-UI](https://github.com/Semantic-Org/Semantic-UI).
Provides current weather and a 5 day forecast. Can be set to refresh as often as
desired. Specify a different latitude and longitude to get a different forecast.

## Check It Out

[link]()

## Usage

Fomantic UI and JQuery are required. You *must* include JQuery *before*
the Fomantic UI Javascript. You can use the jsDelivr links in the example below,
otherwise you'll need to download [Fomantic-UI](https://github.com/fomantic/Fomantic-UI)
and [JQuery](https://jquery.com/) from their respective sites and then
download and use `weather-widget.js` from this repo. (**ONLY** `weather-widget.js`
is needed from this repo. Other files in this repo are for the live example)

In a script tag (before the `<script>` tag containing `weather-widget.js`),
declare the configuration variables as a variable named `fkweatherwidget`.

Configuration variables include:
* `elemId`: the id of the HTML element you are injecting the weather widget into
* `hourlyRefreshSeconds`: the amount of time in seconds to wait before refreshing the hourly forecast
* `weeklyRefreshSeconds`: the amount of time in seconds to wait before refreshing the weekly forecast
* `lat`: Latitude of the area to get a forecast for
* `lng`: Longitude of the area to get a forecast for

```html
<!doctype html>

<html lang="en">
    <head>
	...
	<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.4/dist/semantic.min.css">
    </head>
    <body>

	...

	<div id="mywidget"></div>

	...

	<script src="https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.4/dist/semantic.min.js"></script>
	<script>
	 const fkweatherwidget = {
	     elemId: 'mywidget',
	     hourlyRefreshSeconds: 60 * 60,
	     weeklyRefreshSeconds: 60 * 60,
	     lat: 35.1056,
	     lng: -90.007,
	 }
	</script>
	<script src="https://cdn.jsdelivr.net/gh/kathawala/weather-widget@1.0.0/weather-widget.min.js"></script>
    </body>
</html>
```
