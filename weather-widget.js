//########################
//    WEATHER WIDGET JS
//########################


// forecast string parsing rules
// "Chance of precipitation is [0-9]*%" = precip pct
// if "Chance" or "Slight Chance" -> "%FORECAST%, with a [high near| low around] %TEMPERATURE%"
// FORECAST == "Cloudy" "Mostly Cloudy" "Partly Cloudy" "Partly Sunny"
// if precipitation chance greater than 30%, show rain symbol
// cloudy / sunny low priority
// :droplet: for precipitation

const weekdays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// both of these come from
// https://github.com/albertyw/codemancer/blob/master/codemancer/js/weather.js#L10-L42
const fallbackForecastEmoji = {
  "Drizzle": ":cloud:",
  "Light Rain": ":cloud:",
  "Rain": ":white_sun_rain_cloud:",
  "Heavy Rain": "white_sun_rain_cloud:",
  "Rain Showers": ":white_sun_rain_cloud:",

  "Rain and Snow Showers": ":cloud_snow:",
  "Snow Showers": ":cloud_snow:",
  "Snow": ":cloud_snow:",

  "Showers And Thunderstorms": ":cloud_rain:",
  "T-Storms": ":cloud_rain:",
};

const forecastEmoji = {
  "Sunny": ":sunny:",
  "Mostly Sunny": ":sunny:",
  "Partly Sunny": ":partly_sunny:",
  "Mostly Cloudy": ":cloud:",
  "Cloudy": ":cloud:",
  "Clear": ":first_quarter_moon_with_face:",
  "Mostly Clear": ":first_quarter_moon_with_face:",
  "Partly Cloudy": ":first_quarter_moon_with_face:",
  "Drizzle": ":white_sun_rain_cloud:",
  "Light Rain": ":white_sun_rain_cloud:",
  "Rain": ":cloud_rain:",
  "Heavy Rain": "cloud_rain:",
  "Rain Showers": ":cloud_rain:",
  "Rain and Snow Showers": ":snowflake:",
  "Snow Showers": ":snowflake:",
  "Snow": ":snowflake:",
  "Showers And Thunderstorms": ":thunder_cloud_rain:",
  "T-Storms": ":thunder_cloud_rain:",
  "Fog": ":fog:",
  "Areas of Fog": ":fog:"
};

const fallbackDescriptors = [
  "Slight Chance",
  "Isolated",
  "Scattered",
];

const importantDescriptors = [
  "Likely",
  'Very',
];

const importantWeatherTerms = [
  "Rain",
  "Snow",
  "Drizzle",
  "Showers",
  "Thunderstorms",
  "T-Storms",
  "Fog"
];

function getPrecipitation(detailedForecast) {
  let precipPct = 0;
  const precipMatch = detailedForecast.match(/Chance of precipitation is ([0-9]*)%/);
  if (precipMatch) {
    precipPct = Number(precipMatch[1]);
  }
}

function shaveForecastStr(forecast) {
  const inForecast = w => forecast.includes(w);

  // get all the forecast keys which match an emoji string
  const possibleForecastStrings = Object.keys(forecastEmoji).filter(inForecast);

  // use the longest string (so Light Rain, instead of Rain)
  // this is only one forecast, so we aren't missing out by
  // taking longest string, just preserving info
  let forecastStr = possibleForecastStrings[0];
  if (possibleForecastStrings.length > 1) {
    forecastStr = possibleForecastStrings.sort((a,b) => b.length - a.length)[0]
  }
  return forecastStr;
}

// Precip / Interesting event == 3
// others == 1
function getPriority(forecast) {
  let score = 1;
  const inForecast = w => forecast.includes(w);
  if (importantWeatherTerms.some(inForecast)) {
    score += 2;
    if (fallbackDescriptors.some(inForecast)) {
      score -= 1;
    } else if (importantDescriptors.some(inForecast)) {
      score += 1;
    }
  }
  return score;
}

function getForecastStr(forecast) {
  // split the forecast
  const [f1, f2] = forecast.split('then');

  // get priority of each forecast
  const p1 = getPriority(f1);
  const p2 = f2 ? getPriority(f2) : 0;

  // get forecast of higher priority
  const forecastStr = p1 >= p2 ? f1 : f2;

  return forecastStr;
}

function getEmoji(forecast) {
  const inForecast = w => forecast.includes(w);
  if (fallbackDescriptors.some(inForecast)) {
    return fallbackForecastEmoji[shaveForecastStr(forecast)];
  } else {
    return forecastEmoji[shaveForecastStr(forecast)];
  }
}

// Takes in a Date object and returns the day of the week in a text format.
function getNextWeekDay(){
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Create an array containing each day, starting with Sunday.
  // Use the getDay() method to get the day.
  const day = tomorrow.getDay();
  // Return the element that corresponds to that index.
  return weekdays[day];
}

function addHourlyWeather(data) {
  if (!data) return;
  $("#nowTemp").text(`${data.temp}°`);
  $("#nowTempUnit").text("F"); // we always use Fahrenheit
  $("#nowForecast").text(data.forecast);
  $("#nowEmoji").attr('data-emoji', data.emoji);
}

function getHourlyWeather(forecastURL) {
  $.getJSON(forecastURL, function(data) {
    const thisHourData = data.properties.periods[0];
    const forecast = getForecastStr(thisHourData.shortForecast);
    const info = {
      temp: thisHourData.temperature,
      forecast: shaveForecastStr(forecast),
      emoji: getEmoji(forecast)
    }
    addHourlyWeather(info);
  });
};

function addWeeklyWeather(data) {
  if (!data) return;
  for (let i=0, len=data.length; i<len; i++) {
    let d = data[i];
    $(`#day${i}Name`).text(d.name.substr(0,3));
    $(`#day${i}Emoji`).attr('data-emoji', d.emoji);
    $(`#day${i}HighTemp`).text(`${d.highTemp}°F`);
    $(`#day${i}LowTemp`).text(`${d.lowTemp}°F`);
  }
}

function getWeeklyWeather(forecastURL) {
  $.getJSON(forecastURL)
    .done(function(data) {
      const periods = data.properties.periods;
      const eachDayInfo = [];
      for (let i=0, len=periods.length; i<len; i++) {
	const p = periods[i];
	// below we skip the daily forecast if it's for today/tonight/etc.
	if (!weekdays.some(day => p.name.includes(day))) continue;

	if (!p.isDaytime) {
	  const currDay = eachDayInfo.pop();
	  currDay.lowTemp = p.temperature;
	  eachDayInfo.push(currDay);
	} else if (p.isDaytime) {
	  let forecast = getForecastStr(p.shortForecast);
	  eachDayInfo.push({
	    name: p.name,
	    highTemp: p.temperature,
	    forecast: shaveForecastStr(forecast),
	    emoji: getEmoji(forecast)
	  });
	}
      }
      addWeeklyWeather(eachDayInfo);
    })
    .fail(function( jqxhr, textStatus, error ) {
      var err = `${textStatus}, ${error}`;
      console.log(`Request Failed: ${err}`);
    });
}

//######################
//    END WEATHER JS
//######################

// inject all the HTML into the correct tag
// (I hate this, but is there a better way?)
$(`#${fkweatherwidget.elemId}`).html(`
<div id="mainelem" style="max-height: 450px; max-width: 400px;">
    <div class="ui raised segment">
	<div class="ui blue right ribbon label">Weather</div>
	<div class="ui stackable padded grid">
	    <div class="row">
		<div class="five wide column">
		    <div class="content">
			<div class="header">
			    <div class="ui horizontal statistic">
				<div class="value" id="nowTemp"></div>
				<div class="label" id="nowTempUnit"></div>
			    </div>
			</div>
			<div class="meta" style="margin-top: 15px">
			    <span class="ui black large text" id="nowForecast"></span>
			</div>
		    </div>
		</div>
		<div class="five wide column"></div>
		<div class="six wide column">
		    <em class="large" id="nowEmoji"></em>
		</div>
	    </div>
	    <div class="equal width divided row">
		<div class="column">
		    <h3 class="ui center aligned header" id="day0Name"></h3>
		    <h4 class="ui center aligned header">
			<em class="small" id="day0Emoji"></em>
			<div class="content">
			    <span id="day0HighTemp"></span>
			    <div class="sub header" id="day0LowTemp"></div>
			</div>
		    </h4>
		</div>
		<div class="column">
		    <h3 class="ui center aligned header" id="day1Name"></h3>
		    <h4 class="ui center aligned header">
			<em class="small" id="day1Emoji"></em>
			<div class="content">
			    <span id="day1HighTemp"></span>
			    <div class="sub header" id="day1LowTemp"></div>
			</div>
		    </h4>
		</div>
		<div class="column">
		    <h3 class="ui center aligned header" id="day2Name"></h3>
		    <h4 class="ui center aligned header">
			<em class="small" id="day2Emoji"></em>
			<div class="content">
			    <span id="day2HighTemp"></span>
			    <div class="sub header" id="day2LowTemp"></div>
			</div>
		    </h4>
		</div>
		<div class="column">
		    <h3 class="ui center aligned header" id="day3Name"></h3>
		    <h4 class="ui center aligned header">
			<em class="small" id="day3Emoji"></em>
			<div class="content">
			    <span id="day3HighTemp"></span>
			    <div class="sub header" id="day3LowTemp"></div>
			</div>
		    </h4>
		</div>
		<div class="column">
		    <h3 class="ui center aligned header" id="day4Name"></h3>
		    <h4 class="ui center aligned header">
			<em class="small" id="day4Emoji"></em>
			<div class="content">
			    <span id="day4HighTemp"></span>
			    <div class="sub header" id="day4LowTemp"></div>
			</div>
		    </h4>
		</div>
	    </div>
	</div>
    </div>
</div>
`);

// get the gridpoints for forecast urls
$.getJSON(`https://api.weather.gov/points/${fkweatherwidget.lat},${fkweatherwidget.lng}`).done(data => {
  const {forecast, forecastHourly} = data.properties;
  getHourlyWeather(forecastHourly);
  getWeeklyWeather(forecast);
  setInterval(getHourlyWeather, 1000 * fkweatherwidget.hourlyRefreshSeconds);
  setInterval(getWeeklyWeather, 1000 * fkweatherwidget.weeklyRefreshSeconds);
});
