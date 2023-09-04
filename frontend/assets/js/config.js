let production = "https://sisper.contactadigital.com:9003";
let devevelopment = "https://127.0.0.1:9003";

let config = {};

switch (window.location.hostname) {
  case "sisper.contactadigital.com":
    config.API_URL = production;
    break;
  case "http://127.0.0.1":
    config.API_URL = devevelopment;
    break;
  default:
    config.API_URL = devevelopment;
}