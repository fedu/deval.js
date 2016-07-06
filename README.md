----
# Deval.js - HTML5 Javascript template engine
I too was using Angular.js few years ago, but then I realized it's nature.
I needed lighter and happier syntax to achieve same kind of designs faster.
That's how Deval was born - a W3C validating syntax with a blazing fast parser.

Mastering Deval only requires learning the basic attributes to use it, JS you already know.
Unlike Angular, this doesn't provide observables.. Why? Because they suck.

Angular coders, if you're reading this... Stop exhausting my CPU and eating up my memory!
Always respect the client space and its resources.

If you're interested of porting this logic into Node.js, please let me know.

Happy hacking! ;-)

***@license FREE FOR ALL*** - But, let me know of any public usage (for fame) or bugs (for shame)

@TODO Refactor and port for Node.js (npm)

## Usage
```html
<html>
  <head>
    <script src="deval.min.js"></script>
  </head>
  <body>
    <h1 data-eval="timer = new Date().toLocaleTimeString()"
        data-interval="1000">
      [timer]
    </h1>
    <script>
      deval.parse();
    </script>
  </body>
</html>
```


#### Simple example
```html
<p data-eval="simple = 'Example'">[simple]</p>
```
#### Display today date
```html
<p data-eval="time = new Date()">[time]</p>
```
#### Render clock which updates every second
```html
<p data-eval="timer = new Date().toLocaleTimeString()" data-interval="1000">[timer]</p>
```
#### Access DOM tree
```html
<p data-eval="this.style.background = true ? 'yellow' : 'red'">I have yellow background</p>
```


#### JSON REST API Ajax call:
```html
<div data-eval="dat = ajax:json:myJsonUrl">
  <div data-ajax="init">Loading..</div>
  <div data-ajax="ok">
    <div data-eval="dat.status == 'ok'">Success!</div>
    <div data-eval="dat.status == 'error'">Error: [dat.error]</div>
  </div>
  <div data-ajax="error">Could not connect to server</div>
</div>
```

#### XML Ajax call (ignore first 2 titles and update it every 5 seconds):
```html
<div data-eval="news = ajax:xml:news.xml" data-interval="5000">
  <div data-ajax="init">Loading..</div>
  <div data-ajax="ok">
  <table>
    <tbody data-loop="n = news.getElementsByTagName('title')">
      <tr data-eval="[n.num()] > 2">
        <td>[n.childNodes[0].nodeValue]</td>
      </tr>
    </tbody>
  </table>
  </div>
  <div data-ajax="loading">Updating..</div>
  <div data-ajax="error">Could not load any news.</div>
</div>
```

#### Object data rendering example
```html
<script>
var example = {
  contents: {
    firstArray: [
      { html:'content1-1' },
      { html:'content1-2' },
      { html:'content1-3' }
    ],
    secondEmpty: {
      // empty
    },
    thirdObject: {
      'some': { html:'content3-1' }
    }
  }
};

function myRowFormatter(dat) {
  dat.html = dat.html.toUpperCase();
  return dat;
}

function doSomethingWithDataAndKey(s, key) {
  return s + ' render key '+key;
}
</script>

<!-- Rendering -->
<ul data-loop="s = example.contents">
  <li>
    [s.num()]. [s.key()] ([s.count()])
    <ul data-loop="c = s" data-row="myRowFormatter">
      <li>
        <div data-eval="html = doSomethingWithDataAndKey(c.html, '[c.key()]')">
          <p>[html]</p>
        </div>
      </li>
    </ul>
  </li>
</ul>
```

#### Events
```html
<p data-eval="timer = new Date().toLocaleTimeString()" data-event="clock">Event clock: [timer]</p>
<button onclick="deval.dispatchEvent('clock')">Event: clock</button>
```

#### Loading external data with ajax
Remember to respect cross origin XMLHttpRequests ;)
```html
<!-- Text file -->
<p data-eval="txt = ajax:test.txt">[txt]</p>

<!-- JSON file -->
<p data-eval="json = ajax:json:test.json">[json.some.example]</p>

<!-- XML file -->
<div data-eval="xml = ajax:xml:test.xml">
  <p data-eval="xmlContent = xml.getElementsByTagName('example')[0].childNodes[0].nodeValue">
    [xmlContent]
  </p>
</div>
```

#### Parse and render with debug option
```html
<script>
  // debug
  deval.debug = true;
  // parse and render the whole body
  deval.parse();
</script>
```

----
## Attributes
### data-eval
Javascript evaluation and conditionals etc.

```html
<div data-eval="txt = ajax:hello.txt">[txt]</div>

Few examples:
data-eval="myString = 'it\'s a string!'"
data-eval="myObject = {data:'things'}"
data-eval="myArray = [1,2,3,4]"
data-eval="myBoolean == 'things' ? true : false"
data-eval="myData = ajax:hello.txt"
data-eval="myJson = ajax:json:my.json"
data-eval="myXml = ajax:xml:my.xml"
data-eval="myUppercaseString = 'wow'.toUpperCase()"
data-eval="myOutput = calculateMyThings(data)"
```

### data-params     
URL params can be passed into ajax URL with data-params attributes

```
<div data-params="min=1&max=myMaxValue" data-eval="my = ajax:/call"></div>
```

This tries to read all values first as a variable, if not found, they're interpreted as value.
So you can pass text and variables like `var min = 0; var max = 10;` with `foo=bar&min=min&max=max`.

Here are some other examples of usage -> result:

```
data-params="foo=bar&limit=10" -> /call?foo=barVariableValue&limit=10
data-params="foo='bar'"        -> /call?foo=bar
data-params="p"                -> /call?pVarValue
data-params="{foo:'bar'}"      -> /call?foo=bar
data-params="t=Date.now()"     -> /call?t=1126217126272
```

### data-ajax       
Events for DOM objects: `init | loading | ok | error`
```html
<p data-ajax="init">Loading..</p>
<p data-ajax="loading">Reloading data..</p>
<p data-ajax="ok">Ajax completed succesfully.</p>
<p data-ajax="error">Could not access the server!</p>
```

### data-loop       
Loop data within innerHTML template
```html
<ul data-loop="row = some.data">
  <li>[row]</li>
</ul>
```

Supported inline methods for data:

```html
[row.num()] - Row number
[row.key()] - Row key
[row.count()] - Row array|object count (length)
```

### data-row    
Handle loop data before it renders on a row basis

```html
<ul data-row="myRowFormatter" data-loop="row = some.data">
  <li>[row]</li>
</ul>
    
myRowFormatter(row) { return row; }
```

### data-event      
Listen to events with chosen name and fire `Deval.update` accordingly
    
```html
<p data-eval="clock = new Date()" data-event="clock">[clock]</p>

<script> deval.dispatchEvent('clock'); </script>
```

### data-limit      
Loop `limit uint[,uint]`

```html
<ul data-limit="5" data-loop="row = some.data">
  <li>[row]</li>
</ul>

data-limit="10"          -> limit loop to 10 rows
data-limit="5,10"        -> loop only rows 5 to 10
data-limit="mylimitvar"  -> use variable to pass the limit ie. mylimitvar = 10
data-limit="start,limit" -> use variables to pass the start,limit ie. start = 5, limit = 10
```

### data-form       
Binds the form to Deval and gives support for `data-value`, `data-validate`, etc. methods.

You can pass URL GET params with same input names into the fields automatically (urlParamsToForm).
Use multipart/form-data in your form to send files, default is `application/x-www-form-urlencoded`

```html
<form data-form action="/myFormHandler"></form>
```

### data-value      
Form field default value if no value is set

```html
<input data-value="target.country||'fi'||23" type="text">
```

### data-validate   
Handle any form changes, also fired upon ajax submit.
You can do easily server side checks with this or make logics according to the user input.

```html
<form data-validate="myValidator(dat)"></form>

function myValidator(dat) { return dat; }
```

### data-interval   
Data update interval in milliseconds (for `data-eval`)

```html
<p data-interval="1000" data-eval="time = new Date()">[time]</p>
```

### data-translate  
Handle ajax data before rendering (for your own data logics)

```html
<div data-translate="myPreDataHandler" data-eval="my = { foo: 'bar' }"></div>

function myPreDataHandler(dat) { return dat; }
```

### data-callback   
Callback function after we are done eval'ing, passes object so ie. `function myCallback(o) {}`.
Callback for ajax forms server response, if you want data pre-processing use ie. `data-translate="json"`

With ajax calls, there can be error so setup your ajax callbacks like:

```html
<div data-callback="myCallback(dat, error)" data-eval="my = ajax:call"></div>
```

### data-ignore     
Ignores this dom tree in parsing (if you want to use `deval.render` calls directly)

```html
<div data-ignore></div>
```

### data-debug      
Debug all related parses into `console.log`

```html
<div data-debug data-eval="debug = this">[debug]</div>
```

----
## Direct JavaScript API:
#### Initialize
ie. `deval.debug = true`
```javascript
var deval = new Deval({
  urlParamsToForm: false,          // default: true
  formStorage: false,              // default: true
  debug: true,                     // default: false

  // Global Ajax callbacks
  onLoad:  function() {},          // ajax onLoad (loading)
  onAjax:  function() {},          // ajax onAjax (ok)

  // Form changes (data-form)
  onStorage:  function( data ) {}, // Callback if some form has some value changed (formStorage: true)
});
```
#### If you want to access the rendering engine directly with your own stuff
```javascript
deval.render({
  // Required
  id:  'content',      // element id
  set: 'now',          // variable

  // Data methods
  get: 'new Date()',   // eval data
  dat: function() {    // direct data
    return new Date()
  }, 
  limit:    0,         // loop limit (0 = unlimited)

  // Ajax options
  url: 'http://ajax/jsondata',  // ajax url
  translate: '',                // json|xml|tags|function|other
  xml: false,                   // parse as xml?
  tags: false,                  // encode html tags?
  params: 'foo=bar&limit=max'   // pass params to url with dynamic values

  // Form options
  form:     'formid',           // handle as form data

  // Update interval
  interval: 1000,               // milliseconds

  // Callback
  callback: function(o) {       // Object o has all the info above with tha data in o.dat
    // your code
    alert( JSON.stringify(o) );
  },

  // If you want your own template
  template: '<p>Date is [now]</p>'

  // Debugging and debug console overwrite
  debug: true,
  console = {
    log: function(s) { console.log(s); },    // overwrite example:
    error: function(s) { console.error(s); } // deval.console.error = function(s) { alert(s); }
  }
});
```
#### Events
```javascript
deval.event('myEvent', 'myDivId'); // create event
deval.event('myEvent', 'myDivId'); // dispatch event

deval.addEventListener('myEvent', 'myDivId');
deval.dispatchEvent('myEvent');
deval.removeEventListener('myEvent', 'myDivId');
```
#### Parse whole dom document.body tree for attributes (add it to the bottom of your body)
```javascript
deval.parse();
```
#### If you want to parse only your specific node tree
```javascript
deval.parse( 'myDataEvalDivId' ); or
deval.parse( document.getElementById('myDataEvalDivId') );
```
#### Update (parse again)
```javascript
deval.update('myDataEvalDivId');
```

----
## Simple URL handling class is also included with this
### @global url
I need this kind of url handling constantly, so it's logical to include this.

Try: `alert( JSON.stringify(url) );`

#### Examples:
```
http://localhost/foo/bar/things/?myparam=some#key=value
url.myparam   // some
url._parent   // bar
url._first    // foo
url._last     // things
url._hash.key // value
url.1         // foo
url.2         // bar
etc.
```
