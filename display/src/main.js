
const FORMAT_HIERARCHY = ['.m4a', '.mp3', '.opus', '.ape', '.wav', '.flac']; // rank your own formats here, i prefer it that way. Sue me (please don't)
const STRING_SORTS = ["artist", "album", "title"]; // attributes that are sorted using the method provided with strings

// format values for sorting and display
// these are upper limits
const FORMAT_LOW = FORMAT_HIERARCHY.indexOf('.opus'); // "low value" format. shows up in red. for me, everything lossy
const FORMAT_MEDIUM = FORMAT_HIERARCHY.indexOf('.wav'); // "median value" formet. show up in orange. for me, everything lossless that isn't flac
// everything above that, ie flac will show up in green

// bitrate values for sorting and display
// these are upper limits
const BITRATE_LOW = 192; // "low value" bitrate. shows up in red. set at 192 because that is supposed to be "transaprent" starting there
const BITRATE_MEDIUM = 320; // "medium value" bitrate, shows up in orange. set at 320 because that is the usual upper limit for mp3

// color codes for the low, medium and high values (name of the css classes)
const COLOR_LOW = "red";
const COLOR_MEDIUM = "orange";
const COLOR_HIGH = "green";

document.getElementById('parse').addEventListener("click", function(){
  init();
}); // when the button is clicked, start running the spaghetti code

/**
 * Get the content of the textbox that receives the json string, hide the box and rename the button
 * calls the sort function
 */
function init(){
  // hiding the textbox
  document.getElementById('library-data').style.display = "none";
  //changing the name of the button
  document.getElementById('parse').innerHTML = "re-parse";
  raw = document.getElementById('library-data').value.trim();
  parsed = JSON.parse(raw).songs;
  sortSongs(parsed)
}

/**
 * Get the value of the two selects to generate a sort function using sortMaker()
 * calls the display fonction
 * @param songs : unsorted song array from init()
 */
function sortSongs(songs)
{
  let type = document.getElementById('sortType').value;
  let order = (document.getElementById('sortOrder').value == "desc") ? true : false;
  let sorter = sortMaker(type, order);
  compute(songs.sort(sorter));
}

/**
 * display the songs in an html table in the appropriate div in the DOM
 * @param songs
 */
function compute(songs)
{
  let out = document.getElementById('output'); // DOM element that will receive the table
  acc = "<table><tr><th>Artist</th><th>Album</th><th>Title</th><th>Bitrate</th><th>Format</th></tr>"; // header of the table
  for(let song of songs)
  {
    acc += line(song); // call the function that generates a table line for the song
  }
  out.innerHTML = acc + "</table>"; // close the table tag
}

/**
 * given a single song objects, return a table line with it's properties
 * @param song : the song object
 * @returns {string}
 */
function line(song)
{
  let bitrateColor = bitColor(song.kbps); // get the appropriate class name for the value of the bitrate
  let formatColor = forColor(song.format); // same thing for the format
  // this is defined here to make rearranging columns around easier
  let artist = `<tr><td>${song.artist}</td>`; // artist part of the line
  let title = `<td>${song.album}</td><td>${song.title}</td>`; // title part of the line
  let bitrate = `<td class="${bitrateColor}">${song.kbps}</td>`; // bitrate part of the line
  let format = `<td class="${formatColor}">${song.format}</td></tr>`; // format part of the line
  return artist + title + bitrate + format;
}

/**
 * return the appropriate color constant given a certain bitrate
 * @param bitrate
 * @returns {string}
 */
function bitColor(bitrate)
{
  if(bitrate<= BITRATE_LOW)
  {
    return COLOR_LOW;
  }
  else if(bitrate <= BITRATE_MEDIUM)
  {
    return COLOR_MEDIUM
  }
  else
  {
    return COLOR_HIGH
  }
}

/**
 * return the appropriate color constant for a given format
 * @param format
 * @returns {string}
 */
function forColor(format)
{
  let score = FORMAT_HIERARCHY.indexOf(format); // the formats "value" is determined by it's place in the FORMATS_HIERARCHY constant, with the worst being an unknowwn / unsupported format
  if(score <= FORMAT_LOW) {
    return COLOR_LOW;
  }
  else if(score <= FORMAT_MEDIUM) {
    return COLOR_MEDIUM;
  }
  else {
    return COLOR_HIGH;
  }
}

/**
 * Higher order function to return a function that will be used to sort the array
 * these sort functions take two objects as parameter and return an integer.
 * @param type : what attribute are we sorting after
 * @param inv : when true : sorted in descending order. otherwise sorted by ascending order
 * @returns {(function(...[*]=))|(function(*, *): number)|(function(*, *): number)}
 */
function sortMaker(type, inv=false)
{
    let mod = (inv)? -1 : 1; // to determine wether to sort by ascending or descending order, it is easier to multiply the result by 1 (default, ascending order) or -1 (descending order)
    if(STRING_SORTS.indexOf(type) != -1) { // if we sort by one of the types that requires sorting by a string
      return (a, b) => a[type].localeCompare(b[type]) * mod; // using the function with the same purpose built into the String type
    }
    else if(type == "format") { // if we sort by format
      return function(a, b){
        // get the score for both the compared objects
        let rankA = FORMAT_HIERARCHY.indexOf(a.format);
        let rankB = FORMAT_HIERARCHY.indexOf(b.format);
        if(rankA < rankB) {
          return -1 * mod;
        }
        else if(rankA > rankB) {
          return 1 * mod;
        }
        else{
          return 0;
        }
      };
    }
    else { // all the above only leave the bitrate as sorting option
      return (a, b) => (a.kbps - b.kbps) * mod; // no need to get fancy, substracting the two bitrates works just fine
    }

}