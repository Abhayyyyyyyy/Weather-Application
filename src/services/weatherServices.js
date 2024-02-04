import { DateTime } from "luxon";

const API_KEY = "1415ce806a8c089a3620570277973db8";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const getWeatherData = (infoType, searchParams) => {
    const url = new URL(BASE_URL + "/" + infoType);
    url.search = new URLSearchParams({...searchParams, appid : API_KEY});
    return fetch(url)
    .then((res) => res.json())
};

const formatCurrentWeather = (data) => {
    const{
        coord : {lat , lon},
        main : {temp, feels_like, temp_max, temp_min, humidity},
        name,
        dt,
        sys : {country , sunrise, sunset},
        weather ,
        wind : {speed}
    } = data

    const{main: details, icon} = weather[0]

    return {lat , lon, temp, feels_like, temp_max, temp_min, humidity, name, dt, country , sunrise, sunset, details, icon, speed};
};

const formatForecastWeather = (data) => {
    let {timezone, list} = data;
    let list_copy = [];
    for (let i = 1; i < 42; i += 9) {
        list_copy.push(list[i]);
    }
    list = list_copy.map(d => {
        return {
            title: formatToLocalTime(d.dt, timezone, 'ccc'),
            temp: d.main.temp,
            icon: d.weather[0].icon
        }
    }); 

    return {timezone, list};    
};

const getFormattedWeatherData = async (searchParams) => {
    const formattedCurrentWeather = await getWeatherData('weather', searchParams).then(formatCurrentWeather);

    const {lat, lon} = formattedCurrentWeather; 

    const formattedForecastWeather = await getWeatherData('forecast', {
        lat, lon, exclude: 'current ,minutely ,alerts', units : searchParams.units
    }).then(formatForecastWeather);

    return {...formattedCurrentWeather, ...formattedForecastWeather};
};

const formatToLocalTime = (secs, zone, format = "cccc,dd,LLL, yyyy' | Local time: 'hh:mm a") => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const iconUrlFromCode = (code) => `http://openweathermap.org/img/wn/${code}@2x.png`

// export default getFormattedWeatherData;

export default getFormattedWeatherData;

export {formatToLocalTime, iconUrlFromCode};