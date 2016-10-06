/**
 * Deval.js - HTML5 Javascript template engine
 * =================================================================================================
 * I too was using Angular.js few years ago, but then I realized it's nature.
 * I needed lighter and happier syntax to achieve same kind of designs faster.
 * That's how Deval was born - a W3C validating syntax with a blazing fast parser.
 * Mastering Deval only requires learning the basic attributes to use it, JS you already know.
 *
 * Unlike Angular, this doesn't provide observables.. Why? Because they suck.
 * Angular coders, if you're reading this... Stop exhausting my CPU and eating up my memory!
 * Always respect the client space and its resources.
 *
 * If you're interested of porting this logic into Node.js, please let me know.
 *
 * Happy hacking! ^__^
 *
 * @author fedu
 *
 * @license FREE FOR ALL
 *      But, let me know of any public usage (for fame) or bugs (for shame)
 *
 * @global deval  Deval class and methods
 * @global url    Simple URL handling methods
 * @global getId  document.getElementById shorthand
 *
 * @version 2017-05-07 11:38
 *
 * @history
 *     2017-10-06  Added Forms GET method support for form fields
 *     2017-05-07  Added events
 *     2016-03-01  Decided to release this into the wild
 *     2015-10-09  Commented and optimized
 *     2014-08-18  First working version
 *     2014-04-04  Prototype
 *
 * @TODO Deval for Node.js (npm)
 *
 *
 *
 * ATTRIBUTES
 * -------------------------------------------------------------------------------------------------
 *  data-eval    Javascript evaluation and conditionals etc.
 *
 *               ie.
 *               <div data-eval="txt = ajax:hello.txt">[txt]</div>
 *
 *               Few examples:
 *
 *               data-eval="myString = 'it\'s a string!'"
 *               data-eval="myObject = {data:'things'}"
 *               data-eval="myArray = [1,2,3,4]"
 *               data-eval="myBoolean == 'things' ? true : false"
 *               data-eval="myData = ajax:hello.txt"
 *               data-eval="myJson = ajax:json:my.json"
 *               data-eval="myXml = ajax:xml:my.xml"
 *               data-eval="myUppercaseString = 'wow'.toUpperCase()"
 *               data-eval="myOutput = calculateMyThings(data)"
 *
 *  data-params  URL params can be passed into ajax URL with data-params attributes
 *
 *               ie.
 *               <div data-params="min=1&max=myMaxValue" data-eval="my = ajax:/call"></div>
 *
 *               This tries to read all the values as a variable, if not found they are interpreted as normal value
 *               You can pass text and variables as values like var min = 0; var max = 10; with foo=bar&min=min&max=max
 *
 *               Here are some other examples of usage -> result:
 *
 *               data-params="foo=bar&limit=10"  -> /call?foo=barVariableValue&limit=10
 *               data-params="foo='bar'"      -> /call?foo=bar
 *               data-params="p"          -> /call?pVarValue
 *               data-params="{foo:'bar'}"    -> /call?foo=bar
 *               data-params="t=Date.now()"    -> /call?t=1126217126272
 *
 *  data-ajax    Events for DOM objects: init|loading|ok|error
 *
 *               ie.
 *               <p data-ajax="init">Loading..</p>
 *               <p data-ajax="loading">Reloading data..</p>
 *               <p data-ajax="ok">Ajax completed succesfully.</p>
 *               <p data-ajax="error">Could not access the server!</p>
 *
 *  data-loop    Loop data within innerHTML template
 *
 *               ie.
 *               <ul data-loop="row = some.data.with.myarray">
 *                 <li>[row]</li>
 *               </ul>
 *
 *               Supported inline methods for data:
 *
 *                [row.num()] - Row number
 *                [row.key()] - Row key
 *                [row.count()] - Row array|object count (length)
 *
 *  data-row     Handle loop data before it renders on a row basis
 *
 *               ie.
 *               <ul data-row="myRowFormatter" data-loop="row = some.data.with.myarray">
 *                 <li>[row]</li>
 *               </ul>
 *
 *               myRowFormatter(row) { return row; }
 *
 *  data-event   Listen to events with chosen name and fire Deval.update accordingly
 *
 *               ie.
 *               <p data-eval="clock = new Date()" data-event="clock">[clock]</p>
 *               <script> deval.dispatchEvent('clock'); </script>
 *
 *  data-limit   Loop limit uint[,uint]
 *
 *               ie.
 *               <ul data-limit="5" data-loop="row = some.data.with.myarray">
 *                 <li>[row]</li>
 *               </ul>
 *
 *               data-limit="10"        -> limit loop to 10 rows
 *               data-limit="5,10"      -> loop only rows 5 to 10
 *               data-limit="mylimitvar"    -> use variable to pass the limit ie. mylimitvar = 10
 *               data-limit="start,limit"  -> use variables to pass the start,limit ie. start = 5, limit = 10
 *
 *  data-form    Binds the form to Deval and gives support for data-value, data-validate, etc. methods
 *               You can pass URL GET params with same input names into the fields automatically (urlParamsToForm)
 *               Use multipart/form-data in your form to send files, default is application/x-www-form-urlencoded
 *
 *               ie.
 *               <form data-form action="/myFormHandler"></form>
 *
 *  data-value   Form field default value if no value is set
 *
 *               ie.
 *               <input data-value="target.country||'fi'||23" type="text">
 *
 *  data-validate Handle any form changes, also fired upon ajax submit
 *                You can do easily server side checks with this or make logics according to the user input
 *
 *               ie.
 *               <form data-validate="myValidator(dat)"></form>
 *
 *               function myValidator(dat) { return dat; }
 *
 *  data-interval  Data update interval in milliseconds (for data-eval)
 *
 *               ie.
 *               <p data-interval="1000" data-eval="time = new Date()">[time]</p>
 *
 *  data-translate  Handle ajax data before rendering (for your own data logics)
 *
 *               ie.
 *               <div data-translate="myPreDataHandler" data-eval="my = { foo: 'bar' }"></div>
 *
 *          function myPreDataHandler(dat) { return dat; }
 *
 *  data-callback  Callback function after we are done eval'ing, passes object so ie. function myCallback(o) {}
 *               Also callback for ajax forms server response, if you want data pre-processing use ie. data-translate="json"
 *               With ajax calls, there can be error so setup your ajax callbacks like:
 *
 *               ie.
 *               <div data-callback="myCallback(dat, error)" data-eval="my = ajax:call"></div>
 *
 *  data-ignore    Ignores this dom tree in parsing (if you want to use deval.render calls directly)
 *
 *               ie.
 *               <div data-ignore></div>
 *
 *  data-debug    Debug all related parses into console.log
 *
 *               ie.
 *               <div data-debug data-eval="debug = this"></div>
 *
 *
 * SOME EXAMPLES OF USAGE:
 * -------------------------------------------------------------------------------------------------
 *
 * Clock:
 *   <div data-eval="date = new Date().toString()" data-interval="1000">[date]</div>
 *
 * JSON REST API Ajax call:
 *  <div data-eval="dat = ajax:json:getMyJSON">
 *     <div data-ajax="init">Loading..</div>
 *     <div data-ajax="ok">
 *      <div data-eval="dat.status == 'success'">Success!</div>
 *      <div data-eval="dat.status == 'error'">Error: [dat.error]</div>
 *     </div>
 *     <div data-ajax="error">Could not connect to server</div>
 *  </div>
 *
 * XML Ajax call (ignore first 2 titles and update it every 5 seconds):
 *   <div data-eval="news = ajax:xml:news.xml" data-interval="5000">
 *     <div data-ajax="init">Loading..</div>
 *     <div data-ajax="ok">
 *       <table>
 *         <tbody data-loop="n = news.getElementsByTagName('title')">
 *           <tr data-eval="[n.num()] > 2">
 *             <td>[n.childNodes[0].nodeValue]</td>
 *           </tr>
 *         </tbody>
 *       </table>
 *     </div>
 *     <div data-ajax="loading">Updating..</div>
 *     <div data-ajax="error">Could not load any news.</div>
 *   </div>
 *
 *
 * DATA-LOOP ROW METHODS:
 * -------------------------------------------------------------------------------------------------
 * [data.num()] - Row number
 * [data.key()] - Row key
 * [data.count()] - Row array|object count (length)
 *
 *
 * DIRECT JAVASCRIPT API:
 * -------------------------------------------------------------------------------------------------
 *
 * // Initialize - You can se these directly too ie. deval.debug = true
 * var deval = new Deval({
 *     urlParamsToForm: false,          // default: true
 *     formStorage: false,              // default: true
 *     debug: true,                     // default: false
 *
 *    // Global Ajax callbacks
 *    onLoad:  function() {},           // ajax onLoad (loading)
 *    onAjax:  function() {},           // ajax onAjax (ok)
 *
 *    // Form changes (data-form)
 *    onStorage:  function( data ) {},  // Callback if some form has some value changed (formStorage: true)
 * });
 *
 * // If you want to access the rendering engine directly with your own stuff
 * deval.render({
 *
 *     // Required
 *    id:    'content',                 // element id
 *    set:  'now',                      // variable
 *
 *    // Data methods
 *    get:  'new Date()',               // eval data
 *    dat:  function() { return new Date() },   // direct data
 *    limit:  0,                        // loop limit (0 = unlimited)
 *
 *    // Ajax options
 *    url:  'http://ajax/jsondata',     // ajax url
 *    translate: '',                    // json|xml|tags|function|other
 *    xml:   false,                     // parse as xml?
 *    tags:   false,                    // encode html tags?
 *    params:  'foo=bar&limit=max'      // pass params to url with dynamic values
 *
 *    // Form options
 *    form:   'formid',                 // handle as form data
 *
 *    // Update interval
 *    interval: 1000,                   // milliseconds
 *
 *    // Callback
 *    callback: function(o) {           // Object o has all the info above with tha data in o.dat
 *      // your code
 *      alert( JSON.stringify(o) );
 *    },
 *
 *    // If you want your own template
 *    template: '<p>Date is [now]</p>'
 *
 *    // Debugging and debug console overwrite
 *    debug: true,
 *    console = {
 *      log: function(s) { console.log(s); },    // overwrite example:
 *      error: function(s) { console.error(s); } // deval.console.error = function(s) { alert(s); }
 *    }
 *
 * });
 *
 * // Events
 * deval.event('myEvent', 'myDivId'); // create event
 * deval.event('myEvent', 'myDivId'); // dispatch event
 *
 * deval.addEventListener('myEvent', 'myDivId');
 * deval.dispatchEvent('myEvent');
 * deval.removeEventListener('myEvent', 'myDivId');
 *
 * // Parse whole dom document.body tree for attributes (add it to the bottom of your body)
 * deval.parse();
 *
 * // If you want to parse only your specific node tree
 * deval.parse( 'myDataEvalDivId' ); or
 * deval.parse( document.getElementById('myDataEvalDivId') );
 *
 * // Update (parse again)
 * deval.update('myDataEvalDivId');
 *
 *
 * Simple URL handling class is also included with this
 * -------------------------------------------------------------------------------------------------
 * @global url
 *
 * I need this kind of url handling constantly, so it's logical to include this.
 *
 * Try: alert( JSON.stringify(url) );
 *
 * Examples:
 *
 *     http://localhost/foo/bar/things/?myparam=some#key=value
 *
 *     url.myparam    // some
 *     url._parent    // bar
 *     url._first     // foo
 *     url._last      // things
 *     url._hash.key  // value
 *     url.1          // foo
 *     url.2          // bar
 *     etc.
 *
 */

/**
 * Deval class
 * -------------------------------------------------------------------------------------------------
 * Note to anyone who's thinking of reading through the code:
 * The common problem with global namespace and eval handling is that you can't use normal variable names.
 * The user might use variables like e, i, o, etc. so it's not safe to use any of those.
 * I named all my variables starting with underscore to make them safe.
 * I know, it's pains my eyes too. This might be one of the reasons why people hate global namespace and eval?
 * Remove all _underscores before reading through the code. It really helps.
 *
 * If you want to be part of my future eye and brain surgery in the loonie bin, send your love to:
 *
 *  BTC: 1Q5uzabWMAVjXHPkEFk75QiAWqutqmizbL
 *  LTC: LMruyWBnh9DCPvBCnEfgda8dwHQSdViKqE
 *
 *
 * Comparison of other systems and Deval? I found one blog entry comparing Javscript template engines.
 * -------------------------------------------------------------------------------------------------
 * @see http://sporto.github.io/blog/2013/04/12/comparison-angular-backbone-can-ember/
 *
 * Here are the blog topics and Deval answers for them:
 *
 *
 * 1. Observables: Objects that can be observed for changes.
 * ------------------------------------------------------
 * Comment: Listen to some variable/object and dispatch global event if it changes?
 * Answer: You shouldn't use Observables, they are heavy on client CPU.
 *
 *   data-event    - You can use data-event="test" to create events and call them in data-callbacks
 *                 - deval.addEventListener('test', 'myDivId')
 *                 - deval.dispatchEvent('test')
 *
 *  data-callback  - for forms you can use data-form and data-validate="myUpdaterMethod" (passes form data obj)
 *                 - use events and not these kind of heavy CPU eaters that can make your code go bad
 *                 - force other views to update manually with data-validate
 *
 * 2. Routing: Pushing changes to the browser url hash and listening for changes to act accordingly.
 * -------------------------------------------------------------------------------------------------
 * Comment: Simple url handling and view changing accordingly?
 * Conclusion: You should make your own url listeners -> Easy to create custom logics
 *
 *   location.hash - read the search hash and view wanted things with simple data-eval="location.hash == '#foo'"
 *                 - you can write your own logic for the hash also with some boolean method like data-eval="routing('#foo/bar')"
 *
 *   url.param     - global url object can be accessed to check params like url.foo (UrlParser included in the bottom)
 *
 *   data-callback - custom methods can be easily integrated with callbacks and location.hash changed with it
 *                 - updating the wanted views can be called directly through js with deval.update('id' [, myCallback])
 *
 * 3. View bindings: Using observable objects in views, having the views automatically refresh when the observable object change.
 * -------------------------------------------------------------------------------------------------
 * Comment: Automatic innerHTML change when listened var/obj changes?
 * Answer: You should make your own listeners with onclick, onfocus etc. -> More control
 *
 *   data-callback  - ajax renders can be updated automatically with data-interval and tracked with data-callback
 *                  - deval.update('id' [, myCallback])
 *                  - deval.update( mydiv [, myCallback] )
 *
 * 4. Two way bindings: Having the view push changes to the observable object automatically, for example a form input.
 * -------------------------------------------------------------------------------------------------
 * Comment: This is needed only with ajax and user forms?
 * Answer: We give user the control of this.
 *
 *   data-validate  - For forms you can use data-form and data-validate="myUpdaterMethod" (passes form data obj)
 *                  - For ajax calls you can use data-callback="myAjaxHandler" and call deval.update to render it
 *                  - There are supports for ie. type="email" required in html already
 *
 * 5. Partial views: Views that include other views.
 * -------------------------------------------------------------------------------------------------
 * Comment: Include some file to template in runtime? or display something if something is something?
 * Answer: Callbacks are supported, yes.
 *
 *   data-eval      - With data-eval="mything == true" you can parse different things and update them accordingly
 *                  - You can load/parse external files with data-eval="s = ajax:/my.html" data-callback="myHtmlImporter"
 *
 * 6. Filtered list views: Having views that display objects filtered by a certain criteria.
 * -------------------------------------------------------------------------------------------------
 * Comment: You can create your own data handlers and use limits to display data accordingly?
 * Answer: You can use data-translate and make eval logic accordingly.
 *
 *   data-row      - handles data before it renders on a row basis
 *   data-filter   - data-limit="10", data-limit="5,10" or use js variables/methods instead of integers
 *                 - data-translate can be used for ajax calls to handle data before it renders to make any kind of filter
 *                 - With ajax tables and data, you could use data-params for server side filtering
 *
 * So, the final wishlist would be?
 * --------------------------------
 *  data-bind      Observe some object/value/event for changes and update all selected views if it changes
 *   data-init     Not sure if this is needed becouse every method can be called separately? We have deval.onLoad
 *   data-error    Global error dispatcher could save someone? Currently "deval.debug = true" gives you console.log
 *                 - ajax errors can be handled through data-ajax views and data-callback attributes
 *
 * @class Deval
 */

 /**
  * Disabled warnings for jshint
  * “Leave me alone, I know what I'm doing” -Kimi Räikkönen
  */
 /* jshint -W041 */ // - Use '!==' to compare with 'undefined'.
 /* jshint -W061 */ // - eval can be harmful.
 /* jshint -W080 */ // - It's not necessary to initialize '_check' to 'undefined'.
 /* jshint -W002 */ // - Value of '_e' may be overwritten in IE 8 and earlier.
 /* jshint -W083 */ // - Don't make functions within a loop.
 /* jshint -W084 */ // - Expected a conditional expression and instead saw an assignment.
 /* jshint -W082 */ // - Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.

function Deval( config ) {
  // config can be overwriten
  if( !config ) { config = {}; }

  /**
   * CONFIG
   */
  // debug displays all console.log and console.error messages (default false)
  this.debug = config.debug ? config.debug : false;

  // global render and ajax event methods (undefined by default)
  this.onLoad = config.onLoad;
  this.onAjax = config.onAjax;
  this.onComplete = config.onComplete;
  this.onError = config.onError;

  // default prefix for attributes (default data-* because html5 supports them)
  this.prefix = config.prefix ? config.prefix : 'data-';

  // debug console methods
  this.log = function(s) { console.log(s); };    // basic log stuff
  this.error = function(s) { console.error(s); };  // use alert here if you want to go cuckoo

  /**
   * ATTRIBUTES
   */
  this._attrs = {
    ignore    : this.prefix + 'ignore',   // data-ignore (for global parse)

    eval      : this.prefix + 'eval',     // data-eval="now = new Date()"
    loop      : this.prefix + 'loop',     // data-loop="list = new Array(10)"
    row       : this.prefix + 'row',      // data-row (eval data row with data-loop)
    value     : this.prefix + 'value',    // data-value="[foo]|bar"
    form      : this.prefix + 'form',     // data-form (ajax)

    event     : this.prefix + 'event',    // data-event="name"

    ajax      : this.prefix + 'ajax',     // data-ajax="init|ok|loading|error"
    params    : this.prefix + 'params',   // data-params="myParams"
    interval  : this.prefix + 'interval', // data-interval="5000"
    limit     : this.prefix + 'limit',    // data-limit="5,10"

    translate : this.prefix + 'translate',// data-translate="myTranslator"
    validate  : this.prefix + 'validate', // data-validate="myValidator"

    callback  : this.prefix + 'callback', // data-callback="myCallback"
    error     : this.prefix + 'error',    // data-error="myErrorHandler"

    debug     : this.prefix + 'debug'     // data-debug
  };

  // debug console
  this.console = {
    log: this.log,
    error: this.error
  };

  /**
   * Internal logic handling, dont touch these (but you can read them globally if you want)
   */

  // events
  this._events = {};

  // ajaxState tracking variable (+1 or -1, 0 = Completed)
  this._ajaxLoading = 0;

  // data tracking
  this._data = {};

  // remember parsed objects for deval.update('mydivid'); method
  this._objects = {};

  // remember stored forms
  this._storage = {};

  // templates
  this._templates = {};

  // keep track of ajax forms
  this._formSubmits = {};

  // dynamic id
  this._dynID = '__deval_';
  this._dynIDNum = 0;

  // dynamic hidden id
  this._dynHiddenID = '__hidden_';
  this._dynHiddenIDNum = 0;

  // parser depth
  this._depth = 0;
}


/**
 * Parse dom tree recursively
 * --------------------------------
 * @param object | undefined node
 * @return boolean true|false
 */
Deval.prototype.parse = function( node ) {
  // node has disappeared? user has screwed up the dom tree?
  if( node != undefined && !node ) {
    this.console.error('Deval.parse says:'+"\n\n"+'This is not a dom element?'+"\n\n"+node);
    return false;
  }

  // node is written in text as deval.parser('myid') ?
  var direct = false;
  if( typeof node == 'string' ) {
    if( this.debug ) { this.console.log('Deval.parse call for id: '+node); }
    node = document.getElementById( node );
    if( node != undefined && !node ) {
      this.console.error('Deval.parse says:'+"\n\n"+'Element id not found: '+node);
      return false;
    }
    direct = true;
  }

  // take wanted node or start from the top of document.body (default)
  if( !node ) {
    /*if( this.onLoad ) {
      this.onLoad();
    }*/
    node = document.body;
  }

  // go through the children
  var e = direct ? [node] : node.children;
  for(var i=0; i<e.length; i++) {
    var id = e[i].getAttribute('id');
    // check that we're not already parsing this node, it doesn't have data-ignore and parsing returns false (reversed)
    if(
      ( !id || (id && !this._data[ id ])) &&  // has id and not already parsing?
      e[i].getAttribute( this._attrs.ignore ) == undefined &&  // data-ignore attribute is undefined?
      this.parseChild( e[i] )                  // if parsing returned false, no deeper parsing needed
    ) {
      // go to the next level
      this.parse( e[i] );
    }
  }

  // I left the first method without underscore variables, just for the peace of mind..
  return true;
};

/**
 * Parse element
 * --------------------------------
 * @param object _e
 * @return bool true|false
 */
Deval.prototype.parseChild = function( _e ) {
  // got doge?
  if( !_e ) { return false; }

  // element id
  var _id = _e.getAttribute('id');

  // double check data store that we're not parsing this id tree already
  if( _id && this._data[ _id ] ) {
    if( this.debug ) { this.console.log('Already parsing: '+_id); }
    return false;
  }

  // try reading these from every element and gather things into object in their execution order
  var _o = {
    eval   : _e.getAttribute( this._attrs.eval ),  // 1st
    loop   : _e.getAttribute( this._attrs.loop ),  // 2nd
    form   : _e.getAttribute( this._attrs.form ),  // 3rd
    value  : _e.getAttribute( this._attrs.value )  // 4th
  };

  /**
   * 1st and 2nd exec: data-eval and data-loop
   */
  if( _o.eval || _o.loop ) {
    // elements found, depth increasing
    this._depth++;

    // check other supported attributes
    _o.row       = _e.getAttribute( this._attrs.row ); // 2nd inner logic eval within a loop
    _o.ajax      = _e.getAttribute( this._attrs.ajax );
    _o.params    = _e.getAttribute( this._attrs.params );
    _o.interval  = _e.getAttribute( this._attrs.interval );
    _o.limit     = _e.getAttribute( this._attrs.limit );

    _o.event     = _e.getAttribute( this._attrs.event );

    _o.translate = _e.getAttribute( this._attrs.translate );
    _o.validate  = _e.getAttribute( this._attrs.validate );

    _o.callback  = _e.getAttribute( this._attrs.callback );
    _o.error     = _e.getAttribute( this._attrs.error );

    // has debug on?
    _o.debug     = _e.getAttribute( this._attrs.debug );

    // has no id? let's create one on the fly so we can access it later, even if the dom changes..
    if( !_id ) {
      // increase dynIDNum to make sure this is unique
      this._dynIDNum++;
      // parse from attribute value by replacing all bogus
      _id = this._dynID + this._dynIDNum;
      _e.setAttribute('id', _id);
    }

    // dom related attributes
    _o.id      = _id;
    _computedStyle  = getElementStyle(_e, 'display');
    _o.display     = _computedStyle && _computedStyle.toLowerCase() != 'none' ? _computedStyle : '';

    // go through attributes in order: eval, loop
    var _attrs = {
      eval: _o.eval,
      loop: _o.loop
    };
    var _check = false;
    for(var _type in _attrs) {
      // check found attribute
      var _attr = _attrs[_type];
      if( !_attr ) { continue; }

      // set type accordingly
      _o.type = _type;

      // default set and get
      _o.get = '';
      _o.set = '';

      // parse attribute value ie. data-eval="foo = bar"
      var _params = _attr.split('=');
      if( _params[1] == undefined ) {
        _o.get = _attr.trim();
      } else {
        _o.set = _params.shift().trim();
        _o.get = _params.join('=').trim();
      }
      // hotfix
      if( _o.get[0] == '=' ) {
        _o.set += '=';
        _o.get = _o.get.substring(1);
      }

      // parse evals here, loops are directly rendered because they dont have deeper evaled logic
      _check = _o.type == 'eval' ? this.parseEvalAndLoop( _o, _e, _attr ) : true;
      if( _check ) {
        // render it if we are good to go
        // return, because form and value fields shouldn't be in the same element?
        _check = this.render( _o );

        // no need to parse form or value field?
        if( !_o.form && !_o.value )
          return _check;
      }
    }
  }

  /**
   * 3rd exec: data-form set
   */
  if( _o.form != undefined ) {
    // elements found, depth increasing
    this._depth++;

    // type: form
    _o.type = 'form';

    // check other supported attributes
    _o.debug     = _e.getAttribute( this._attrs.debug );
    _o.params    = _e.getAttribute( this._attrs.params );

    _o.translate = _e.getAttribute( this._attrs.translate );
    _o.validate  = _e.getAttribute( this._attrs.validate );

    _o.callback  = _e.getAttribute( this._attrs.callback );
    _o.error     = _e.getAttribute( this._attrs.error );

    // has no id? let's create one on the fly so we can access it later, even if the dom changes..
    if( !_id ) {
      // increase dynIDNum to make sure this is unique
      this._dynIDNum++;
      // parse from attribute value by replacing all bogus
      _id = this._dynID + this._dynIDNum;
      _e.setAttribute('id', _id); // + '_' + _attr.replace(/\W/g, '');
    }

    // dom related attributes
    _o.id          = _id;
    _computedStyle = getElementStyle(_e, 'display');
    _o.display     = _computedStyle && _computedStyle.toLowerCase() != 'none' ? _computedStyle : '';

    // let everyone know we are parsing this by storing the id into _data
    //this.store( _o.id );

    // parse form
    this.formParse( _o );

  /**
   * 4th exec: data-value field
   * You never know what the coders are thinking so we support all use cases
   */
   } else if( _o.value != undefined ) { //  && _o.value[0] != '['
    // elements found, depth increasing
    this._depth++;

    // check other supported attributes
    _o.debug = _e.getAttribute( this._attrs.debug );

    // has no id? let's create one on the fly so we can access it later, even if the dom changes..
    if( !_id ) {
      // increase dynIDNum to make sure this is unique
      this._dynIDNum++;
      // parse from attribute value by replacing all bogus
      _id = this._dynID + this._dynIDNum;
      _e.setAttribute('id', _id); // + '_' + _attr.replace(/\W/g, '');
    }

    // dom related attributes
    _o.id          = _id;
    _computedStyle = getElementStyle(_e, 'display');
    _o.display     = _computedStyle && _computedStyle.toLowerCase() != 'none' ? _computedStyle : '';

    // let everyone know we are parsing this by storing the id into _data
    //this.store( _o.id );

    // parse form element
    this.formParseChild( _e );
  }

  // done here
  return true;
};

/**
 * Parse eval and loop calls
 * --------------------------------
 * @param object _o
 * @param object _e dom element
 * @param string _attr
 * @return bool true|false
 */
Deval.prototype.parseEvalAndLoop = function( _o, _e, _attr ) {

  // for debug announcing parsing target
  var _debugmsg = '';
  if( this.debug || _o.debug ) {
    _debugmsg = 'Found data-'+_o.type+'="'+_attr+'"'; // id '+e.id+' with
  }

  /**
   * Support for Comparison Operators in ie. data-eval="true != false"
   * NOTE: other operators without '=' are automatically treated as if statements, so no need to check them.
   *
   * a == b    Equal            TRUE if a is equal to b.
   * a === b    Identical          TRUE if a is equal to b, and they are of the same type.
   * a != b    Not equal          TRUE if a is not equal to b.
   * a !== b    Not identical        TRUE if a is not equal to b, or they are not of the same type.
   * a <= b    Less than or equal to    TRUE if a is less than or equal to b.
   * a >= b    Greater than or equal to  TRUE if a is greater than or equal to b.
   */
  var _operators = new Array('==', '!==', '=', '!', '<', '>');
  if( _o.set && ( _operators.indexOf( _o.set.slice(-1) ) != -1 || _operators.indexOf( _o.get[0] ) != -1 ) ) {
    try {
      // try evaluating it
      eval('_o.dat = '+_attr);

      // debug on?
      if( this.debug || _o.debug ) {
        this.console.log(_debugmsg+' #1 comparison eval returned: '+_o.dat+(_o.dat ? '' : ' (display:none, ignore)'));
      }

      // show/hide?
      _e.style.display = _o.dat ? _o.display : 'none';

      // clear contents if we got no data
      if( !_o.dat ) {
        //console.log('EKA POIS: '+_e.innerHTML);
        // remember template
        if( !this._templates[ _o.id ] ) {
          this._templates[ _o.id ] = _e.innerHTML;
        }
        _e.innerHTML = '';
        return false;
      } else {
        // update template to orginal
        if( this._templates[ _o.id ] ) {
          _e.innerHTML = this._templates[ _o.id ];
        }
        //console.log('EKA PÄÄLLE: '+_e.innerHTML);
      }
    } catch(_error) {
      //if( this.debug || _o.debug ) {
        this.console.error('Deval.parseEvalAndLoop eval says: '+"\n\n"+_error+"\n\n"+'data-'+_o.type+'="'+_attr+'"');
      //}
      return false;
    }

  /**
   * Support for straight if's ie. data-eval="true" and data-eval="!true"
   */
  } else if( !_o.set && _o.get ) {
    try {
      // try evaluating it

      eval('_o.dat = '+_o.get+' ? true : false');


      // debug on?
      if( this.debug || _o.debug ) {
        this.console.log(_debugmsg+' #2 set/get eval returned: '+_o.dat+(_o.dat ? '' : ' (display:none, ignore)'));
      }

      // show/hide?
      _e.style.display = _o.dat ? _o.display : 'none';

      // clear contents if we got no data
      if( !_o.dat ) {
        // remember template
        if( !this._templates[ _o.id ] ) {
          this._templates[ _o.id ] = _e.innerHTML;
        }
        //console.log('TOKA POIS: '+_e.innerHTML);
        _e.innerHTML = '';
        return false;
      } else {
        // update template to orginal
        if( this._templates[ _o.id ] ) {
          _e.innerHTML = this._templates[ _o.id ];
        }
        //console.log('TOKA PÄÄLLE: '+_e.innerHTML);
      }
    } catch(_error) {
      //if( this.debug || _o.debug ) {
        this.console.error('Deval.parseEvalAndLoop straight if eval says: '+"\n\n"+_error+"\n\n"+'data-'+_o.type+'="'+_attr+'"');
      //}
      return false;
    }

  /**
   * Support for dom reference sets ie. data-eval="this.className += true ? ' active' : ' notactive'"
   */
  } else if( _o.set && _o.set.substring(0, 5) == 'this.' ) {
    // this supports all kind of dom references ie. data-eval="this.className += ' myClass'"
    try {
      // try evaluating it (replace this. with _e.)
      _attr = _attr.replace('this.', '_e.');

      eval( _attr );


      // debug on?
      if( this.debug || _o.debug ) {
        this.console.log(_debugmsg+' #3 dom ref (this) eval ok: '+_attr);
      }
    } catch(_error) {
      //if( this.debug || _o.debug ) {
        this.console.error('Deval.parseEvalAndLoop this match eval says: '+"\n\n"+_error+"\n\n"+'data-'+_o.type+'="'+_attr+'"');
      //}
      return false;
    }
  }

  // ok here
  return true;
};

/**
 * Render wanted data
 * --------------------------------
 * @param object|string _o = {id: 'myid'}|_o = 'id'
 * @return bool true|false errors and ajax calls return always false, otherwise true
 */
Deval.prototype.render = function( _o ) {
  // dom object
  var _e;

  // support for direct string id rendering
  if( typeof _o == 'string' ) {
    _e = document.getElementById( _o );
    if( !_e ) {
      this.console.error('Deval.render says:'+"\n\n"+'Unknown id: '+"\n\n"+_o);
      return false;
    }
    return this.parseChild( _e );
  }

  // we got something here? (wow.. that's a nice looking if right there)
  var _err = '';
  if( !_o.id || _o.set == undefined || (_o.dat == undefined && !_o.get && !_o.url && _o.type != 'form') ) {
    try { _err = JSON.stringify(_o); } catch(errori) {}
    this.console.error('Deval.render says:'+"\n\n"+'Insufficent params!'+"\n\n"+_err);
    return false;
  }

  // get reference to dom (the dom may have changed or someone wants to access render directly, so we support both)
  _e = document.getElementById( _o.id ); // _o.dom ? _o.dom :
  if( !_e ) {
    try { _err = JSON.stringify(_o); } catch(_errori) {}
    this.console.error('Deval.render says:'+"\n\n"+'Element id not found: '+_o.id+"\n\n"+_err);
    return false;
  }

  // if we already have the element info, lets use the original template and display set
  if( this._objects[ _o.id ] && this._objects[ _o.id ].template ) {
    _o.template = this._objects[ _o.id ].template;
    _o.display = this._objects[ _o.id ].display ? this._objects[ _o.id ].display : '';
  }

  // if _o.display is not set (render called directly)
  if( _o.display == undefined ) {
    // element has it's own css display set? let's remember it so we don't mess up the layout
    // ignore if it's none, we want it to show if we're rendering
    // (or user doesnt understand that we/browser renders hidden automatically)
    _computedStyle  = getElementStyle(_e, 'display');
    _o.display     = _computedStyle && _computedStyle.toLowerCase() != 'none' ? _computedStyle : '';
  }

  // default type is eval so no need to write it every time
  _o.type = _o.type ? _o.type : 'eval';

  // has updateCallback? (called with domeval.update('thisid', function() { domeval.update('thatid'); }) or similar)
  if( !_o.updateCallback && this._objects[ _o.id ] && this._objects[ _o.id ].updateCallback ) {
    _o.updateCallback = this._objects[ _o.id ].updateCallback;
  }

  // announce parsing target for debug (want to talk about coding etiquettes? bring your own bottle..)
  if( this.debug || _o.debug ) {
    this.console.log('---------------------------------------------------------------'); // ooh nice little separator
    this.console.log('Parsing '+_o.type+': '+(_o.set ? _o.set+'=' : '')+(_o.get ? _o.get : _o.url ? _o.url : _o.dat ? _o.dat : '')+(_o.interval ? ' (interval: '+_o.interval+')' : ''));
  }

  // remember reference to the element
  _o.dom = _e;

  // no data yet? handle as ajax call or foo = bar to get the data
  if( _o.dat == undefined ) {

    /**
     * Ajax calls check
     */
    // we support direct render param url and get calls like ajax:/someurl
    var _ajaxGetCall = _o.get && _o.get.substring(0, 5) == 'ajax:' ? true : false;
    if( _o.url || _ajaxGetCall ) {
      // parse url from get string
      if( _ajaxGetCall ) {
        // check url params like ajax:json:/some/url
        var _ajaxParams = _o.get.split(':');
        _ajaxParams.shift(); // remove 'ajax:' from url

        // set ajax flag true
        _o.ajax = true;

        // has dynamic url params/attributes?
        _o.params = _o.params ? _o.params : _o.dom.getAttribute( this._attrs.params );

        // wants translate inline? (can be passed as param or written into get)
        if( !_o.translate && _ajaxParams[1] ) {
          var _trans = _ajaxParams[0];
          // we have support for translate if needed
          switch( _trans ) {
            // json, xml and tags supported
            case 'json':
            case 'xml':
            case 'tags':
              _ajaxParams.shift(); // remove 'json:' from url
              _o.translate = _trans;
              break;
          }
        }

        // remember clear url address
        // ajax:json:/url -> /url
        _o.url = _ajaxParams.join(":");
      }

      // clear get
      _o.get = '';

      // remember object parameters (for update)
      this._objects[ _o.id ] = _o;

      // remember reference for ajax callback
      _o.parser = this;

      // run ajax call
      this.ajaxCall( _o );

      // exit for now and let ajax handle things
      return false;
    }

    /**
     * Normal get and set
     */
    //_o = this.parseEvalAndLoop(_o, _e, _o.get+'='+_o.set);
    if( _o.dat == undefined && _o.get ) {
      try {
        // create global variable out of set name with get data

        if( _o.set ) {
          // double eval :(
          eval('_o.dat = '+_o.set+'='+_o.get);
          //this.console.log(_o.dat);
        } else {
          eval('_o.dat = '+_o.get);
        }

        // set display according to data
        _e.style.display = _o.dat ? _o.display : 'none';

        // clear contents if we got no data
        if( !_o.dat ) {
          //console.log('KOLMAS POIS: '+_e.innerHTML);
          _e.innerHTML = '';
          return false;
        } else {
          //console.log('KOLMAS PÄÄLLE: '+_e.innerHTML);
        }
      } catch(error) {
        var err = '';
        try { delete _o.dom; err = JSON.stringify(_o); } catch(errori) {}
        if( this.debug || _o.debug ) {
          this.console.error('Deval.render get/set eval says: '+"\n\n"+error+"\n\n"+err);
        }
        return false;
      }
    }
  /**
   * Cache?
   */
  // we got data already? let's make the set variable global with the data
  // (university elitist people dont like this, but they arent famous among pussies either..)
  } else if( _o.set && _o.dat ) {
    try {
      // create global variable matching set for rendering

      eval(_o.set+'=_o.dat');

    } catch(error) {
      var erri = '';
      try { delete _o.dom; erri = JSON.stringify(_o); } catch(errori) {}
      this.console.error('Deval.render set eval says: '+"\n\n"+error+"\n\n"+erri);
      return false;
    }
  }

  // we still dont have the data or data returned undefined? let's not go further, it could get weird..
  // (user is trying to do some weird shit)
  if( _o.dat == undefined ) {
    return false;
  }

  // announce rendering target
  var _debugmsg = '';
  if( this.debug || _o.debug ) {
    _debugmsg = 'Rendering '+_o.type+': '+(_o.set ? _o.set+'=' : '')+_o.get+' ('+(_o.dat ? typeof _o.dat : _o.get)+')'+' ('+_o.id+')';
  }

  // use innerHTML as template or if we have the template already in store, let's use that
  var _template = _o.template ? _o.template : _o.dom.innerHTML;
  if( !_o.template ) {
    _o.template = _template;
  }

  // remember things so people can call update directly by id and don't need to write everything again..
  if( !this._objects[ _o.id ] ) {
    this._objects[ _o.id ] = _o;
  }

  // do some logic by the type
  switch( _o.type ) {
    // form or some other?
    default:
      if( this.debug || _o.debug ) {
        this.console.log(_debugmsg);
      }

      // no recursion needed here? other parsers should take care of their children..
      break;
    // data-eval
    case 'eval':
      if( this.debug || _o.debug ) {
        this.console.log(_debugmsg);
      }
      _o.template = this.renderType( _o );

      // display
      _o.dom.innerHTML =_o.template;

      // reset orginal
      _o.template = _template;

      // recursive
      if( _o.dom.children[0] ) {
        // make set variable global if user wants to use it
        if( _o.set ) { // && _o.odat ?

          eval(_o.set+'=_o.dat');
        }

        // parse recursion from refreshed dom tree
        this.parse(_o.dom);
      }

      break;
    // data-loop
    case 'loop':
      var _loopedTemplate = '';
      var _count = 0;
      var _start = 0;
      var _length = _o.dat.length;
      var _limitcall = _o.limit;

      // parse data-limit attribute
      if( _o.limit ) {
        // numeric? ie. data-limit="10"
        if( parseInt(_o.limit) == _o.limit ) {
          _o.limit = parseInt( _o.limit );
        // has comma so it's start, stop?
        } else if( _o.limit.match(',') ) {
          var _tmp = _o.limit.split(',');
          // make sure we have 2 values here (user is drunk?)
          if( _tmp[1] ) {
            try {
              // evaluate and parseInt

              eval('_start = '+_tmp[0]);
              eval('_o.limit = '+_tmp[1]);

              _start = parseInt( _start );
              _o.limit = parseInt( _o.limit );
            } catch( _erri ) {
              this.console.error('Deval.render limit eval says: '+_erri+' (fix your limit methods/variables!)');
              return false;
            }
          }
        // it's some method/variable? like data-limit="mylimit"
        } else {
          try {
            // evaluate and parseInt

            eval('_o.limit = '+_o.limit);

            _o.limit = parseInt( _o.limit );
          } catch( _erri ) {
            this.console.error('Deval.render limit eval says: '+_erri+' (fix your limit method/variable!)');
            return false;
          }
        }
      }

      // announce limit for debugging
      if( (this.debug || _o.debug) && _o.limit ) {
        this.console.log('Limiting rendering loop with: '+(_start ? _start+', '+_o.limit : _o.limit)+' ('+this._attrs.limit+'="'+_limitcall+'")');
      }

      // object
      var _i, _olength;
      if( _length == undefined ) {
        _length = Object.keys(_o.dat).length;
        if( this.debug || _o.debug ) {
          this.console.log(_debugmsg+'('+_length+')');
        }

        for( _i in _o.dat ) {
          // limit reached?
          if( _o.limit && _count >= _o.limit ) {
            break;
          }

          // support _start
          if( _count >= _start ) {
            // parse row eval logic
            if( _o.row ) {
              if( this.debug || _o.debug ) {
                this.console.log('Formatting loop row: '+_o.set+'['+_i+']='+_o.row+'('+_o.set+'['+_i+'])');
              }
              try {
                // put data through row parser
                eval('_o.dat[_i]='+_o.row+'(_o.dat[_i])');
              } catch(errorr) {
                this.console.error('Deval.render loop row says: '+"\n\n"+errorr+' with '+_o.row);
                return false;
              }
            }

            // ooooolongjohnsson
            _olength = _o.dat[_i] ? _o.dat[_i].length : 0;
            if( _olength == undefined && typeof _o.dat[_i] == 'object' ) {
              _olength = Object.keys(_o.dat[_i]).length;
            }

            // support for [set.key()] [set.num()] [set.count()]
            _o.template = _template;
            _o.template = _o.template.replace( new RegExp('\\['+_o.set+'.key\\(\\)\\]', 'g'), _i);      // 0,1,2 or key1,key2,etc.
            _o.template = _o.template.replace( new RegExp('\\['+_o.set+'.num\\(\\)\\]', 'g'), _count+1);  // 1,2,3,4...
            _o.template = _o.template.replace( new RegExp('\\['+_o.set+'.count\\(\\)\\]', 'g'), _olength);  // 69 dude

            // render child
            _o.dom.innerHTML = this.renderChild(_o, _i);

            // recursion (any other faster way of doing this? we are rendering every line to DOM..)
            if( _o.dom.children[0] ) {
              // make set variable global if user wants to use it
              if( _o.set ) {

                eval(_o.set+'=_o.dat[_i]');

              }

              // parse recursion from refreshed dom tree
              this.parse(_o.dom);
            }

            // add rendered row to template
            _loopedTemplate += _o.dom.innerHTML;
          }

          // count
          _count++;
        }
      // array
      } else {
        if( this.debug || _o.debug ) {
          this.console.log(_debugmsg+'('+_length+')');
        }
        for( _i=_start; _i<_length; _i++ ) {
          // limit reached?
          if( _o.limit && _count >= _o.limit ) {
            break;
          }

          // support _start
          if( _count >= _start ) {
            // parse row eval logic
            if( _o.row ) {
              if( this.debug || _o.debug ) {
                this.console.log('Formatting loop row: '+_o.set+'['+_i+']='+_o.row+'('+_o.set+'['+_i+'])');
              }
              try {
                // put data through row parser
                eval('_o.dat[_i]='+_o.row+'(_o.dat[_i])');
              } catch(errorr) {
                this.console.error('Deval.render loop row says: '+"\n\n"+errorr+' with '+_o.row);
                return false;
              }
            }

            // ooooolongjohnsson
            _olength = _o.dat[_i] ? _o.dat[_i].length : 0;
            if( _olength == undefined && typeof _o.dat[_i] == 'object' ) {
              _olength = Object.keys(_o.dat[_i]).length;
            }

            // support for [set.key()] [set.num()] [set.count()]
            _o.template = _template;
            _o.template = _o.template.replace( new RegExp('\\['+_o.set+'.key\\(\\)\\]', 'g'), _i);      // 0,1,2 or key1,key2,etc.
            _o.template = _o.template.replace( new RegExp('\\['+_o.set+'.num\\(\\)\\]', 'g'), _count+1);  // 1,2,3,4...
            _o.template = _o.template.replace( new RegExp('\\['+_o.set+'.count\\(\\)\\]', 'g'), _olength);  // 69 dude

            // render child
            _o.dom.innerHTML = this.renderChild(_o, _i);

            // recursion (any other faster way of doing this? we are rendering every line to DOM..)
            if( _o.dom.children[0] ) {
              // make set variable global if user wants to use it
              if( _o.set ) {

                eval(_o.set+'=_o.dat[_i]');

              }

              // parse recursion from refreshed dom tree
              this.parse(_o.dom);
            }

            // add rendered row to template
            _loopedTemplate += _o.dom.innerHTML;
          }

          // count
          _count++;
        }
      }

      // combined
      _o.dom.innerHTML = _loopedTemplate;

      // reset orginal
      _o.template = _template;

      break;
  }

  // set render state to false so it can be rendered again
  this._data[ _o.id ] = false;

  // has update interval with data?
  if( _o.interval && (!_o.ajax || (_o.ajax && _o.dat)) ) {
    // clear dom reference and data for update
    delete _o.dom;
    delete _o.dat;
    delete _o.parser;

    // set timeout
    setTimeout('deval.render('+JSON.stringify(_o)+');', parseInt( _o.interval ));
  }

  // event binding?
  if( _o.event ) {
    try {
      this.addEventListener(_o.event, _o.id);
    } catch(_eventErr) {
      this.console.error('Deval.render event says: '+_eventErr);
    }
  }

  // make sure the element is visible when rendered
  _e.style.display = '';

  // onComplete?
  /*if( !_o.ajax && this.onComplete ) {
    this.onComplete( _o.id+': '+_o.set+' '+_o.get );
  }*/

  // callback?
  if( _o.callback && _o.dat ) {
    // clear dom reference and data for callback (things could get circular otherwise)
    delete _o.dom;
    delete _o.parser;
    switch( typeof _o.callback ) {
      // data-callback string?
      case 'string':
        try {
          // call the callback with eval passing the data for it
          if( this.debug || _o.debug ) {
            this.console.log('Callback: '+_o.callback+' (id:'+_o.id+')');
          }

          eval(_o.callback+'(_o)');

        } catch(_error) {
          this.console.error('Deval.render callback says: '+_error);
        }
        break;
      // direct obj
      default:
        if( this.debug || _o.debug ) {
          this.console.log('Callback: function (id:'+_o.id+')');
        }
        _o.callback(_o);
        break;
    }
  }

  // updateCallback.callback?
  if( _o.updateCallback ) {
    // clear dom reference and data for callback (things could get circular otherwise)
    delete _o.dom;
    delete _o.parser;
    switch( typeof _o.updateCallback ) {
      // data-callback string?
      case 'string':
        try {
          // call the callback with eval passing the data for it

          eval(_o.updateCallback+'(_o)');

        } catch(_error) {
          this.console.error('Deval.render update-callback says: '+_error);
        }
        break;
      // direct obj
      default:
        _o.updateCallback(_o);
        break;
    }
  }

  return false;
};

/**
 * addEventListener
 * ------------------------------------------
 * @param string _name
 * @param string _id
 * @return CustomEvent
 */
Deval.prototype.addEventListener = function(_name, _id) {
  // already defined?
  if( this._events[ _name ] && this._events[ _name ][ _id ] ) {
    return this._events[ _name ][ _id ];
  }

  if( this.debug ) {
    this.console.log('Listening on event "'+_name+'" for id: '+_id);
  }

  // add an appropriate event listener
  window.addEventListener(_name, function(_event) {
    if( this.debug ) {
      this.console.log('dispatchEvent: '+_event.detail);
    }
    // update according to id
    this.update( _event.detail );
  }.bind(this));

  // create the event (call with deval.event('name'))
  if( !this._events[ _name ] ) {
    this._events[ _name ] = {};
  }
  this._events[ _name ][ _id ] = new CustomEvent(_name, { detail: _id });

  return this._events[ _name ][ _id ];
};

/**
 * removeEventListener
 * ------------------------------------------
 * @param string _name
 * @param string _id (optional)
 * @return boolean
 */
Deval.prototype.removeEventListener = function(_name, _id) {
  // already removed?
  if( !this._events[ _name ] || !this._events[ _name ][ _id ] ) {
    return true;
  }

  // log
  if( this.debug ) {
    if( _id ) {
      this.console.log('Removing listener "'+_name+'" for id: '+_id);
    } else {
      this.console.log('Removing listener "'+_name);
    }
  }

  if( !_id ) {
    for(var id in this.events[ _name ]) {
      window.removeEventListener(_name, this.events[ _name ][ _id ]);
    }
    return true;
  }
  return window.removeEventListener(_name, this._events[ _name ][ _id ]);
};

/**
 * dispatchEvent
 * ------------------------------------------
 * @param string _name
 * @param string _id (optional)
 * @return boolean window.dispatchEvent
 */
Deval.prototype.dispatchEvent = function(_name, _id) {
  if( !this._events[ _name ] || (_id && !this._events[ _name ][ _id ]) ) {
    return this.console.error('Deval.js dispatchEvent says: Unknown event "'+_name+'", use Deval.addEventListener to create it.');
  }
  try {
    // log
    if( this.debug ) {
      if( _id ) {
        this.console.log('Event "'+_name+'" for id: '+_id);
      } else {
        this.console.log('Event "'+_name);
      }
    }

    if( _id ) {
      return window.dispatchEvent( this._events[ _name ][ _id ] );
    } else {
      for(var id in this._events[ _name ]) {
        window.dispatchEvent( this._events[ _name ][ id ] );
      }
      return true;
    }
  } catch(_eventError) {
    this.console.error('Deval.js dispatchEvent says: '+_eventError);
  }
};

/**
 * event shorthand for automatic addEventListener and  dispatchEvent
 * -----------------------------------------------------------------
 * @param string _name
 * @param string _id (optional)
 * @return event|dispatchEvent
 */
Deval.prototype.event = function(_name, _id) {
  return !this._events[_name] ?
    this.addEventListener(_name, _id) :
    this.dispatchEvent(_name);
};


/**
 * renderChild according to _o.type
 * ------------------------------------------
 * @param object _o
 * @param int|string _i
 * @return object
 */
Deval.prototype.renderChild = function(_o, _i) {
  // render it as copy with changed data (no deep copy needed, yey! but hard to maintain)
  return this.renderType({
    dom:       _o.dom,
    id:        _o.id,
    set:       _o.set,
    get:       _o.get,
    dat:       _o.dat[_i],
    url:       _o.url,
    callback:  _o.callback,
    template:  _o.template,
    limit:     _o.limit,
    display:   _o.display,
    debug:     _o.debug
  });
};

/**
 * renderType according to _o.type (eval|loop)
 * ------------------------------------------
 * @param object _o
 */
Deval.prototype.renderType = function( _o ) {
  // match set named replace according to results type
  switch( _o.dat.constructor ) {

    // single + multidimensional replace for objects and arrays
    case Object:
    case Array:
      _o = this.renderSingle( _o ); // single too, if someone wants to display the data as whole
      _o = this.renderMulti( _o );
      break;

    // single replace for all other data
    default:
      _o = this.renderSingle( _o );
      break;
  }

  // return modified object
  return _o.template;
};

/**
 * RenderSingle data to dom
 * --------------------------------
 * @param object _o
 */
Deval.prototype.renderSingle = function( _o ) {
  // run only if statement?
  if( !_o.set ) {
    //_o.dom.style.display = _o.dat ? _o.display : 'none';
    // recursive parsing (DISABLED COZ WE DO RECURSIVE IN EVAL AT PARSE)
    /*if( _o.dat && _o.dom.children[0] ) {
      this.parse( _o.dom );
    }*/
    return _o;
  }

  // replace [set] with _o.dat
  try {
    var _template = _o.template.replace(new RegExp('\\['+_o.set+'\\]', 'g'), _o.dat);
    _o.template = _template;
    //_o.dom.style.display = _o.dat ? _o.display : 'none';
  } catch(_error) {
    var _err = '';
    try { delete _o.dom; _err = JSON.stringify(_o); } catch(_errori) {}
    this.console.error('Deval.render get says:'+"\n\n"+_error+"\n\n"+_err);
    return _o;
  }

  // done
  return _o;
};

/**
 * RenderMulti data to dom
 * --------------------------------
 * @param object _o
 */
Deval.prototype.renderMulti = function( _o ) {
  // run only if statement?
  if( !_o.set ) {
    _o.dom.style.display = _o.dat ? _o.display : 'none';
    return _o;
  }

  // replace [set.name] with _o.dat.name and protect [some.other[1].thingies['foo']] from bracket matching
  var _tmplate = _o.template;
  _brackets = _tmplate.match( new RegExp('\\[[^'+_o.set+'\.]([^.].*?)\\]', 'g') ); // match all [brackets] that doesn't have dot in them
  // '\\[([^.].*?)\\]'
  var _i;
  if( _brackets ) {
    for(_i=0; _i<_brackets.length; _i++) {
      _tmplate = _tmplate.replace(_brackets[_i], _brackets[_i].replace( new RegExp('\\]', 'g'), '%!}') );
    }
  }
  // match only matching [some.thing] or [some.things[1]] or [some.things['with.some']]
  _brackets = _tmplate.match( new RegExp('\\[('+_o.set+'\.[^.].*?)\\]', 'g') ); // new RegExp('\\['+_o.set+'\.[^.](.*?)\\]', 'g')
  // '\\[('+_o.set+'\.[^.].*?)\\]'

  // nothing to match? exit the madhouse..
  if( !_brackets ) { return _o; }

  // template
  var _template = _o.template;

  // go through brackets
  for(_i=0; _i<_brackets.length; _i++) {
    // bring back brackets
    _brackets[_i] = _brackets[_i].replace( new RegExp('%!}', 'g'), ']' );

    // remove surrounding brackets to get the match
    var _match = _brackets[_i].substring(1, _brackets[_i].length-1);

    // evaluate data into global set variable
    try {

      eval(_o.set+'=_o.dat');

    } catch(_error) {
      var _err = '';
      try { delete _o.dom; _err = JSON.stringify(_o); } catch(errori) {}
      this.console.error('Deval.render dat eval says:'+"\n\n"+_error+"\n\n"+_err);
      return _o;
    }

    // evaluate set.name (matches global variable) to _replace variable
    var _replace = '';
    try {

      eval('_replace ='+_match);

    } catch(_error) {
      // show data accessing errors only with debug on?
      if( this.debug || _o.debug ) {
        this.console.error('Deval.render array/object says:'+"\n\n"+_error+"\n\n"+_brackets[_i]+"\n\n");
      }
      _replace = '';
    }

    // dont print undefined, only empty
    if( _replace == undefined ) {
      _replace = '';
    }

    // protected regexp replace to make sure user doesn't screw the replace method up with it's logic like !"#"[%¤]/&%(/())(
    _template = _template.replace(new RegExp(_brackets[_i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), _replace);
  }

  // replace and render
  _o.template = _template;

  // return
  return _o;
};

/**
 * Update some element tree manually
 * ------------------------------------------
 * @param string _id
 * @return boolean _updateCallback true|false
 */
Deval.prototype.update = function( _id, _updateCallback ) {
  // we dont have it? is the user drunk?
  if( !this._objects[_id] ) {
    // let's try finding it
    var _e = document.getElementById(_id);
    if( !_e ) {
      this.console.error('Deval.update id not found:'+"\n\n"+_id);
      return false;
    // and parsing it
    } else {
      return this.parseChild(_e);
    }
  }

  // clear dom reference and data for clean update
  delete this._objects[_id].dom;
  delete this._objects[_id].dat;
  delete this._objects[_id].parser;

  // set render state to false so it can be rendered again
  this._data[ _id ] = false;

  // has updateCallback?
  if( _updateCallback ) {
    this._objects[_id].updateCallback = _updateCallback;
  }

  // call update
  if( this.debug ) { this.console.log('Deval.update call for id: '+_id); }
  eval('deval.render('+JSON.stringify(this._objects[_id])+');');

};

/**
 * Store for remembering id's
 * --------------------------------
 * @param string _id
 * @return boolean
 */
Deval.prototype.store = function( _id ) {
  // already in store? we dont want it
  if( this._data[ _id ] ) {
    //this.console.log('Already in Store: '+id);
    return false;
  }
  // add to store
  this._data[ _id ] = true;
  //this.console.log('Stored: '+id);
  return true;
};

/**
 * AjaxGet data (o.parser needs to be reference to deval class so this can work!)
 * --------------------------------------------------------------------------------
 * @param object _o
 */
Deval.prototype.ajaxCall = function( _o, _data ) {
  // this
  var self = this;

  // create inline ajax call (with cross-browser support)
  _o.ajaxCall = function( _ref ) {
    var _ajaxRequest;
    try {
      _ajaxRequest = new XMLHttpRequest();
    } catch (_e) {
      try{
        _ajaxRequest = new ActiveXObject('Msxml2.XMLHTTP');
      } catch (_e) {
        try{
          _ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (_e) {
          // change state
          _ref.ajax = 'error';
          // parser still here? (ajax called twice?)
          if( _ref.parser ) {
            _ref.parser.ajaxParse( _ref );
          }

          self.onError();
          self.console.error('Deval.ajaxCall says:'+"\n\n"+'No Ajax support in your browser?');
          return false;
        }
      }
    }
    // onError
    _ajaxRequest.onerror = function(_e) {
      // change state
      self.onError();
      _ref.ajax = 'error';

      // parser still here? (ajax called twice?)
      if( _ref.parser ) {
        _ref.parser.ajaxParse( _ref, 'Could not access the URL' );
      }
    };
    // onReadyStateChange
    _ajaxRequest.onreadystatechange = function() {
      // we got something?
      if( _ajaxRequest.readyState == 4 ) {
        if(_ajaxRequest.status == 200 || _ajaxRequest.status == 304) {
          // we got data \o/
          _ref.dat = _ajaxRequest.responseText;
          // set state to ok and parse it
          _ref.ajax = 'ok';

          // parser still here? (ajax called twice?)
          if( _ref.parser ) {
            _ref.parser.ajaxParse( _ref );
          }
        } else if( _ajaxRequest.status ) {
          // errorrrrrorrororr
          self.onError();
          _ref.ajax = 'error';
          // parser still here? (ajax called twice?)
          if( _ref.parser ) {
            _ref.parser.ajaxParse( _ref, 'URL response status was: '+_ajaxRequest.status );
          }
        }
      }
    };

    // url to call
    var _url = _ref.url;

    // we have get params? add them to the end of the url
    if( _ref.params ) {
      // try evaluating the whole param string first (for ie. window.location.search or object support)

      var _check = undefined;

      var _urlParamsValidated = [];
      // data-params="foo" and data-params="'foo'" evaluation support
      if( _ref.params.indexOf('=') === -1 ) {
        try {

          eval('_check = '+_ref.params);

          switch( _check.constructor ) {
            // array
            case Array:
              for(var _a=0; _a<_check.length; _a++) {
                if( _check.constructor !== Array || _check.constructor !== Object ) {
                  _urlParamsValidated.push( _a+'='+_check[_a] );
                }
              }
              break;
            // object
            case Object:
              for(var _b in _check) {
                if( _check.constructor !== Array || _check.constructor !== Object ) {
                  _urlParamsValidated.push( _b+'='+_check[_b] );
                }
              }
              break;
            // other, string, int, etc.
            default:
              _urlParamsValidated.push( _check );
              break;
          }
        } catch(_err) {
          if( self.debug ) {
            self.console.log(_ref.params+': '+_err);
          }
          _check = undefined;
        }
      }

      // failed? let's go through the params then..
      if( _check == undefined ) {
        var _params = _ref.params.split('&');
        for(var _i=0; _i<_params.length; _i++) {
          var _vals = _params[_i].split('=');
          // try matching the value with variable by eval
          if( _vals[1] ) {
            try {

              eval('_check = '+_vals[1]);

            } catch(_err) {
              self.console.error('Deval.ajaxCall data-params:'+"\n\n"+_err);
            }
          }
          // if variable was found, check it's type and support depth 1 for objects and arrays
          if( _check != undefined ) {
            switch( _check.constructor ) {
              // array
              case Array:
                for(var _c=0; _c<_check.length; _c++) {
                  _urlParamsValidated.push( _vals[0]+'['+_c+']='+_check[_c] );
                }
                break;
              // object
              case Object:
                for(var _d in _check) {
                  _urlParamsValidated.push( _vals[0]+'['+_d+']='+_check[_d] );
                }
                break;
              // other, string, int, etc.
              default:
                _urlParamsValidated.push( _vals[0]+'='+_check );
                break;
            }
          // otherwise keep the orginal
          } else {
            _urlParamsValidated.push( _vals[0] ); // +'='+_vals[1]
          }
        }
      }

      // add param(s) to url
      _urlParamsValidated = _urlParamsValidated.join('&');
      _url += _ref.url.indexOf('?') == -1 ? '?' : '&';
      _url += _urlParamsValidated;

      // show get parameters in window.location.hash?
      //setTimeout('window.location.hash = "'+_urlParamsValidated+'"', 1);
    }

    // we got data
    if( _data ) {
      // move data into params
      if ( _ref.method.toLowerCase() === 'get' ) {
        _url = _url+'?'+_data;
      }
      _ajaxRequest.open( _ref.method ? _ref.method : 'POST', _url, true); // +'&nocache='+(new Date().getTime()) ?
      // support for user enctypes
      if( !_ref.enctype ) {
        _ref.enctype = 'application/x-www-form-urlencoded';
      }
      _ajaxRequest.setRequestHeader("Content-type", _ref.enctype);
      /**
       * Serialize string data object into string params (disabled for now - we dont need it, or do we?)
       * @see http://stackoverflow.com/questions/6566456/how-to-serialize-a-object-into-a-list-of-parameters
       */
      /*if( typeof _data != 'string' ) {
        var serialiseObject = function(obj) {
            var pairs = [];
            for (var prop in obj) {
                if (!obj.hasOwnProperty(prop)) {
                    continue;
                }
                if (Object.prototype.toString.call(obj[prop]) == '[object Object]') {
                    pairs.push(serialiseObject(obj[prop]));
                    continue;
                }
                pairs.push(prop + '=' + obj[prop]);
            }

            return pairs.join('&');
        };
        _data = serialiseObject(_data);
      }*/
      _ajaxRequest.send( _data );
    // if no data, do normal query
    } else {
      _ajaxRequest.open( _ref.method ? _ref.method : 'GET', _url, true); // +'&nocache='+(new Date().getTime()) ?
      _ajaxRequest.send( null );
    }

    // set state to loading
    _ref.ajax = 'loading';
    // parser still here? (ajax called twice?)
    if( _ref.parser ) {
      _ref.parser.ajaxParse( _ref );
    }
  };

  // add to ajaxLoading (for onLoad && onAjax)
  self.ajaxState(1);

  // call it
  _o.ajax = 'init';
  _o.ajaxCall( _o, _data );
};

/**
 * ajaxState for onLoad & onAjax
 * ---------------------------------
 * @param int 1 or -1
 */
Deval.prototype.ajaxState = function( n ) {
  // +1 or -1
  this._ajaxLoading += n;
  if( !this._ajaxLoading && this.onAjax ) {
    this.onAjax();
  } else if( this.onLoad ) {
    this.onLoad();
  }
};

/**
 * AjaxParse data and render
 * --------------------------------
 * @param object _o
 * @param string _errormsg if any error occured
 */
Deval.prototype.ajaxParse = function( _o, _errormsg ) {
  // state (for quick eval access ie. data-ajax="loading")
  // we should propably protect these variable names too, just to make sure.. maybe later
  var init = false;
  var error = false;
  var loading = false;
  var ok = false;

  // render state
  switch( _o.ajax ) {
    // init
    case 'init':
      init = true;
      // so ecplise doesn't complain about not using this variable :(
      if( init ) {}
      break;
    // error
    case 'error':
      // remove from ajaxLoading (for onLoad && onAjax)
      this.ajaxState(-1);
      error = true;
      break;
    // loading
    case 'loading':
      loading = true;
      // so ecplise doesn't complain about not using this variable :(
      if( loading ) {}
      break;
    // ok
    case 'ok':
      ok = true;

      // remove from ajaxLoading (for onLoad && onAjax)
      this.ajaxState(-1);

      // remember we have succeeded in this journey so data-ajax="ok" display doesn't blink when updated (interval)
      _o.ajaxSuccess = true;

      // we got something to translate? check if user has selected json, xml, tags or is using something else
      if( _o.dat && _o.translate ) {
        switch( _o.translate ) {

          // JSON
          case 'json':
            try {
              // parse as json
              _o.dat = JSON.parse( _o.dat );
            } catch(_e) {
              var _err = '';
              try { delete _o.dom; delete _o.parser; _err = JSON.stringify(_o); } catch(_errori) {}
              this.console.error('Deval.ajaxParse JSON.parse says:'+"\n\n"+_e+"\n\n"+_err);
              // state is error
              error = true;
            }
            break;

          // XML
          case 'xml':
            try {
              // parse as xml
              // @see http://www.w3schools.com/xml/xml_parser.asp
              if( window.DOMParser )
              {
                var _parser = new DOMParser();
                _o.dat = _parser.parseFromString(_o.dat,"text/xml");
              }
              else // Internet Explorer
              {
                var _xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                _xmlDoc.async=false;
                _xmlDoc.loadXML(_o.dat);
                _o.dat = _xmlDoc;
              }
            } catch(_e) {
              var _erri = '';
              try { delete _o.dom; delete _o.parser; _erri = JSON.stringify(_o); } catch(_errori) {}
              this.console.error('Deval.ajaxParse XML parser says:'+"\n\n"+_e+"\n\n"+_erri);
              // state is error
              error = true;
            }
            break;

          // htmlentities (tags)
          case 'tags':
            _o.dat = _o.dat.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            break;

          // user has it's own translator so let's use that
          default:
            switch( typeof _o.translate )
            {
              // data-callback string?
              case 'string':
                try {
                  // try evaluating it

                  eval('_o.dat = '+_o.translate+'(_o.dat);');

                  if( (_o.parser && _o.parser.debug) || _o.debug ) {
                    this.console.log('Deval.ajaxParse says:'+"\n\n"+'Translation ok: '+_o.translate);
                  }
                } catch(_error) {
                  this.console.error('Deval.ajaxParse says:'+"\n\n"+'Translation error with: '+_o.translate+"\n\n"+_error);
                }
                break;
              // direct obj
              default:
                _o.dat = _o.translate(_o.dat);
                break;
            }
            break;
        }
      }
      break;
  }

  // this was form ajax call? do another logic for it..
  if( _o.type == 'form' ) {
    if( error ) {
      this.console.error(_errormsg);
    }
    // store error message
    _o.errormsg = _errormsg;
    return this.formParse( _o );
  }

  // get reference to dom (dom may have changed so let's get a new one)
  var _e = _o.dom ? _o.dom : document.getElementById( _o.id );
  if( !_e ) {
    var _erra = '';
    try { delete _o.dom; delete _o.parser; _erra = JSON.stringify(_o); } catch(_errori) {}
    this.console.error('Deval.ajaxParse says:'+"\n\n"+'Element id not found: '+_o.id+"\n\n"+_erra);
    return false;
  }

  // make sure the main element is visible when rendering
  var _computedStyle = getElementStyle(_e, 'display');
  if( _computedStyle == 'none' ) {
    _e.style.display = '';
  }

  // go through children to match data-ajax="ok" etc.
  var _children = _e.getElementsByTagName('*');
  for(var _i=0; _i<_children.length; _i++) {
    // some bogus?
    if( !_children[_i] ) { continue; }

    // get all children with ajax attribute
    var _attr = _children[_i].getAttribute( this._attrs.ajax );
    if( !_attr ) { continue; }

    // match state and set display visible/hidden accordingly
    var _check = false;

    try {
      // evaluate so this supports logics like !ok, init|loading, etc.
      eval('_check = '+_attr);
    } catch(_e) {
      var _errb = '';
      try { delete _o.dom; delete _o.parser; _errb = JSON.stringify(_o); } catch(_errori) {}
      this.console.error('Deval.ajaxParse data-ajax says:'+"\n\n"+_e+"\n\n"+_errb);
      return false;
    }

    // set visibility accordingly
    _children[_i].style.display = _check || (_attr == 'ok' && _o.ajaxSuccess) ? _o.display : 'none';
  }

  // launch render on ok
  if( ok ) {
    // announce parsing target (want to talk about coding etiquettes? please contact our staff at /dev/null)
    if( (_o.parser && _o.parser.debug) || _o.debug ) {
      this.console.log('Ajax finished: '+_o.url+' (id:'+_o.id+')');
    }

    // render state
    this.render( _o );

    // fire onComplete event (if set)
    if( this.onComplete ) {
      setTimeout(this.onComplete(_o.id), 1);
    }

  // if error and this has update interval, let's try that
  } else if( error ) {
    if( (_o.parser && _o.parser.debug) || _o.debug ) {
      this.console.error('Ajax ERROR '+_o.id+': '+"\n\n"+(_errormsg ? _errormsg+"\n\n" : '')+'data-'+_o.type+'="'+_o.set+' = '+_o.url+'"');
    }

    // fire update interval (if set)
    if( _o.interval ) {
      // clear dom reference and data for update
      delete _o.dom;
      delete _o.dat;
      setTimeout('deval.render('+JSON.stringify(_o)+');', parseInt( _o.interval ));
    }
  } else if( (_o.parser && _o.parser.debug) || _o.debug ) {
    this.console.log('Ajax '+(_o.method ? _o.method : 'GET')+': '+'data-'+_o.type+'="'+_o.set+' = '+_o.url+'"'+' (id:'+_o.id+')');
  }

  // set id to false so it can be rendered again
  this._data[ _o.id ] = false;
};

/**
 * FormParse for ajax post|get
 * --------------------------------
 * @param object _o
 */
Deval.prototype.formParse = function( _o ) {
  // get reference to dom
  var _e = document.getElementById( _o.id );
  if( !_e ) {
    var _err = '';
    var _id = _o.id;
    try {
      delete _o.dom;
      delete _o.parser;
      delete _o.id;
      _err = JSON.stringify(_o);
    } catch(_errori) { _err += "\n\n"+_errori; }
    this.console.error('Deval.formParse says:'+"\n\n"+'Element id not found: '+_id+"\n\n"+_err);
    return false;
  }

  // default ajax state is init
  if( !_o.ajax ) {
    _o.ajax = 'init';
  }

  // state booleans
  var init  = _o.ajax == 'init';
  var error  = _o.ajax == 'error';
  var loading  = _o.ajax == 'loading';
  var ok  = _o.ajax == 'ok';

  // if _o.display is not set (render called directly)
  if( _o.display == undefined ) {
    // has it's own style.display set? let's remember it so we don't mess up the layout
    // ignore if it's none, we want it to show if we're rendering (or user is a douche and rendering things hidden?)
    var _computedStyle = getElementStyle(_e, 'display');
    if( _computedStyle == 'none' ) {
      _e.style.display = '';
    }
  }

  // set ajax methods for the form
  // store info about this form
  _o.action = _e.action;
  _o.method = _e.method;
  if( !this._formSubmits[ _o.id ] ) {
    _o.template = _e.innerHTML;
    this._formSubmits[ _o.id ] = _o;
  }

  // initialize onsubmit for the form (why this doesn't work before screen renders? well no time to think about it..)
  // change to addEventListener?
  //setTimeout("var _tmp = document.getElementById('"+_o.id+"'); _tmp.onsubmit = function() { return deval.formSubmit(this); }", 1);
  if( !_e.onsubmit ) {
    _e.onsubmit = function(_formCallback) { return deval.formSubmit( this, _formCallback ); };
  }

  // browser supports storage? let's use it to remember user values then..
  /*var _storageSupport = typeof(Storage) !== "undefined" ? true : false;

  // if we have storageSupport, please be kind to reset requests and clear the storage too..
  if( this.formValueStorage && _storageSupport ) {
    _e.addEventListener('reset', function() {
      // clear our formStorage
      deval.clearStorage();
    });
  }*/

  // go through children
  var _children = _e.getElementsByTagName('*');
  var _attr;
  for(var _i=0; _i<_children.length; _i++) {
    // some bogus?
    if( !_children[_i] ) { continue; }

    // if formValueStorage is enabled, try going through the elements and if child has data-eval attribute, parse it
    /*if( init && this.formValueStorage ) {
      _attr = _e.getAttribute( this._attrs.eval );
      // parseChild if eval attribute was found
      if( _attr && !this.parseChild( _e ) ) {
        continue;
      }
    }*/

    // get all children with ajax attribute to render state
    _attr = _e.getAttribute( this._attrs.ajax );
    if( _attr ) {
      // match state and set display visible/hidden accordingly
      var _check = false;
      try {
        // evaluate it

        eval('_check = '+_attr);

      } catch(_er) {
        var _errd = '';
        try { delete _o.dom; delete _o.parser; _errd = JSON.stringify(_o); } catch(_errori) {}
        this.console.error('Deval.formParse data-ajax says:'+"\n\n"+_er+"\n\n"+_errd);
        return false;
      }
      _e.style.display = _check ? _o.display : 'none';
    }

    // init mode
    else if( init ) {
      // parse form child
      /*if( _children[_i].getAttribute( this._attrs.value ) ) {
        this.formParseChild( _o, _children[_i] );
      }*/

      /**
       * data-validate param support
       * .notyetvalidated can be defined to dom with all browsers? (this might be a bug in same browsers?)
       */
      if( _o.validate && !_e.notyetvalidated ) {
        _e.notyetvalidated = true;
        // check type
        switch( _e.type ) {
          // track user input changes with onkeyup
          default:

            _e.addEventListener('keyup', function() {
              // pass the whole form data to user callback
              try {
                eval( 'deval.formChange("'+_o.id+'", "'+_o.validate+'")' );
              } catch(_error) {
                this.console.error('Error! data-validate says:'+"\n\n"+_error);
              }
            });

            break;
          // track other changes with onchange
          case 'radio':
          case 'checkbox':
          case "select-one":
          case "select-multiple":

            _e.addEventListener('change', function() {
              // pass the whole form data to user callback
              try {
                eval( 'deval.formChange("'+_o.id+'", "'+_o.validate+'")' );
              } catch(_error) {
                this.console.error('Error! data-validate says:'+"\n\n"+_error);
              }
            });

            break;
        }
      }

    }


    //continue;
  }

  // form has callback?
  if( ok && _o.dat ) {
    _o.callback = _e.getAttribute( this._attrs.callback );
    this.formCallback( _o );
  } else if( _o.errormsg ) {
    _o.callback = _e.getAttribute( this._attrs.callback );
    this.formCallback( _o );
    _o.errormsg = '';
  }
};


/**
 * FormCallback
 * --------------------------------
 * @param object _o
 */
Deval.prototype.formCallback = function ( _o ) {
  if( _o.callback ) {
    // pass only data (no need for the whole deval object?)
    switch( typeof _o.callback ) {
      // data-callback string?
      case 'string':
        try {
          // pass data for it through eval

          eval( _o.callback+'(_o.dat, _o.errormsg)' );

        } catch(_error) {
          this.console.log('FormParse callback(string) error with: '+_o.formCallback+"\n\n"+_error);
        }
        break;
      // direct function
      case 'function':
        try {
          _o.callback(_o.dat, _o.errormsg);
        } catch(_error) {
          this.console.log('FormParse callback error with: '+_o.callback+'(data)'+"\n\n"+_error);
        }
        break;
    }
  }

  // formCallback
  if( _o.formCallback ) {
    // pass only data (no need for the whole deval object?)
    switch( typeof _o.formCallback ) {
      // data-callback string?
      case 'string':
        try {
          // pass data for it through eval

          eval( _o.formCallback+'(_o.dat, _o.errormsg)' );

        } catch(_error) {
          this.console.log('FormParse formCallback(string) error with: '+_o.formCallback+"\n\n"+_error);
        }
        break;
      // direct function
      case 'function':
        try {
          _o.formCallback(_o.dat, _o.errormsg);
        } catch(_error) {
          this.console.log('FormParse formCallback error with: '+_o.formCallback+'(data)'+"\n\n"+_error);
        }
        break;
    }
  }
};


/**
 * FormParseChild
 * --------------------------------
 * @param string _e
 * @return bool true|false
 */
Deval.prototype.formParseChild = function( _e )  {
  // check that we have form element here
  var _attr = _e.getAttribute('name');


  var _stored = undefined;

  // not found in storage, but we got it in url (urlParamsToForm enabled)? let's use that then..
  /*if( this.formValueStorage && _storageSupport ) {
    // check for value in storage and url (if urlParamsToForm is enabled)
    _stored = _storageSupport && sessionStorage[_attr] != undefined ? sessionStorage[_attr] : this.urlParamsToForm ? url[_attr] : undefined;
    if( this._storage[_attr] == undefined && _stored != undefined ) {
      // if storage is supported, store it there too..
      if( _storageSupport ) {
        sessionStorage[_attr] = _stored;
      }
      this._storage[_attr] = _stored;
    }
  // only urlParamsToForm enabled?
  } else if( this.urlParamsToForm ) {*/
  if( this.urlParamsToForm ) {
    _stored = url[_attr];
  }
  //}

  // check if data has it
  /*if( _o.dat && _o.dat[_attr] ) {
    _stored = _o.dat[_attr];
  }*/

  var _tmp, c;

  // if stored is undefined and we got data-value param, try that..
  if( _stored == undefined ) {
    // support for logic like data-value="'first'||23||new Date.getTime()" would return first
    // data-value="false||true" would return true and so on..
    var _defaultValue = _e.getAttribute( this._attrs.value );
    if( _defaultValue != undefined ) {
      if( _defaultValue ) {
        try {
          eval('_stored = '+_defaultValue);
        } catch(_error) {
          this.console.error('Error! data-value says:'+"\n\n"+_error);
        }
      }
      /** OLD LOGIC
      _tmp = _defaultValue.split('|');
      for(_c=0; _c<_tmp.length; _c++) {
        if( _tmp[_c] ) {
          _stored = _tmp[_c];
          break;
        }
      }*/
    }
  }

  // refresh? try to find current values from url get params..
  if( _stored != undefined ) {
    switch( _e.type ) {
      case 'radio':
      case 'checkbox':
        _e.checked = false;
        if( _stored ) {
          _stored = (_stored != 'false' && _stored !== false && _stored !== '') ? true : false;
          if( _stored ) {
            _e.checked = true;
          }
        }
        break;
      case "select-one":
        // look at all those underscores.. so many underscores
        for(_c=0; _c<_e.options.length; _c++) {
          _e.options[_c].selected = false;
          if( _e.options[_c].value == _stored ) {
            _e.options[_c].selected = true;
          }
        }
        break;
      case "select-multiple":
        for(_c=0; _c<_e.options.length; _c++) {
          _e.options[_c].selected = false;

          // detect array
          _tmp = _stored;
          if( typeof _stored == 'string' && _stored.match(',') ) {
            _tmp = _stored.split(',');
          }

          // has more than one selected?
          if( _tmp.constructor === Object || _tmp.constructor === Array ) {
            for(var _d=0; _d<_tmp.length; _d++) {
              if( _tmp[_d] == _e.options[_c].value ) {
                _e.options[_c].selected = true;
              }
            }
          // has only one selected
          } else {
            if( _tmp == _e.options[_c].value ) {
              _e.options[_c].selected = true;
            }
          }
        }
        break;
      default:
        _e.value = _stored;
        break;
    }
  }

  /**
   * formValueStorage param support
   * If we have Storage support: Create onchange listener for remembering form data as it changes
   * @see http://stackoverflow.com/questions/7744574/hijacking-onchange-event-without-interfering-with-original-function
   */
  // not found in storage, but we got it in url (urlParamsToForm enabled)? let's use that then..
  /*if( this.formValueStorage && _storageSupport ) {
    _e.addEventListener('change', function() {
      // access our formStorage
      deval.formStorage(this);
    });
  }*/

  return true;
};

/**
 * FormChange
 * --------------------------------
 * @param string _formid
 * @param string _method to pass data to
 * @return mixed eval return
 */
Deval.prototype.formChange = function( _formid, _method ) {
  // get reference to dom
  var _e = document.getElementById( _formid );
  if( !_e ) {
    this.console.error('Deval.formChange says:'+"\n\n"+'Element id not found: '+_formid);
    return false;
  }

  // pass form values as object to the validate method
  var _data = this.formValues( _e, true );
  if( _data != undefined ) {
    try {

      eval('var _check='+_method+'(_data)' );
      return _check;

    } catch(_error) {
      this.console.error('Deval.formChange data-change="'+_method+'" eval says:'+"\n\n"+'Error calling: '+_method+'(data)'+"\n\n"+_error);
    }
  }
};

/**
 * FormSubmit for form data
 * --------------------------------
 * @param object _e
 * @param function _formCallback
 */
Deval.prototype.formSubmit = function( _e, _formCallback ) {
  // get form info from memory
  var _o = this._formSubmits[ _e.getAttribute('id') ];

  // validate before submit?
  if( _o.validate ) {
    var checkIfBoolean = null;

    try {
      eval( 'checkIfBoolean = deval.formChange("'+_o.id+'", "'+_o.validate+'")' );
    } catch(_err) {
      this.console.error('Deval.formSubmit data-validate="'+_o.validate+'" eval says:'+"\n\n"+'Error calling: '+_o.validate+'(data)'+"\n\n"+_err);
    }

    // if data-validate return boolean false, abort submit
    if( checkIfBoolean === false ) {
      // we support validation
      return checkIfBoolean;
    }
  }

  // we support callbacks too
  _o.formCallback = _formCallback;

  // default method is post
  _o.method = _o.method ? _o.method : 'post';
  // we have some url to call?
  if( _o.action ) {
    try {
      // use action url as ajax url
      _o.url = _o.action;

      // get form values
      var _data = this.formValues( _e );

      // ajaxCall requires _o.parser as reference to deval
      _o.parser = this;

      // update form status to loading
      _o.ajax = 'loading';
      this.formParse( _o );

      // wants translate? (support for param or inline)
      _o.translate = _o.translate ? _o.translate : _e.getAttribute( this._attrs.translate );

      // if form has a target, it's not an ajax call (legacy support for iframe submits instead ajax)
      if( _e.getAttribute('target') ) {
        // wait 200ms for the callback if set (possibly bugging this one on some browsers)
        if( _formCallback ) {
          delete _o.dom;
          delete _o.parser;
          setTimeout(_formCallback( JSON.stringify(_o) ), 200);
        }
        return true;
      // send ajax query
      } else {
        //this.console.log( _data );
        if ( this.debug ) {
          this.console.log('Deval.formSubmit ajaxCall '+_o.method+' '+_o.action);
        }
        this.ajaxCall( _o, _data );
      }

    } catch(_error) {
      var _err = '';
      try { delete _o.dom; delete _o.parser; _err = JSON.stringify(_o); } catch(_errori) {}
      this.console.error('Deval.formSubmit ajax '+_o.method+' says:'+"\n\n"+_error+"\n\n"+_err);

      // update form status to error
      _o.ajax = 'error';
      this.formParse( _o );
    }
  }
  return false;
};

/**
 * Get form values as object
 * --------------------------------
 * @param object _e FormElement
 * @param boolean _returnObject if you want object instead of new FormData
 * @returns object {__querystring:'&my=values', my:'values'}
 */
Deval.prototype.formValues = function( _e, _returnObject ) {

  // convert all form values into url params (for ajax call)
  var _children = _e.getElementsByTagName('*');

  // form id
  var _formid = _e.getAttribute('id');

  /**
   * Use FormData if available, otherwise gather data to kvpairs
   * @see https://developer.mozilla.org/en-US/docs/Web/API/FormData
   */

  // FormData supported and no enctype multipart/form-data? Let's use the easy way out...
  var _enctype = _e.getAttribute('enctype');
  if( FormData && _enctype == 'multipart/form-data' ) {
     var _directFormData = new FormData( _e );
    return _directFormData;
  } else {
    _formData = null;
  }

  //var _formData = FormData ? new FormData() : null;
  var _kvpairs = [];
  var _obj = {};

  // lol at _i<_
  for(var _i=0; _i<_children.length; _i++) {
    // some bogus?
    if( !_children[_i] ) { continue; }
    // is some element with a name?
    var _name = _children[_i].getAttribute('name');
    if( !_name ) {
      continue;
    }

    var _c, _value;

    // go through types
    switch( _children[_i].type ) {
      case 'radio':
      case 'checkbox':
        // figure out value or boolean
        _value = _children[_i].value ? _children[_i].value : true;
        _value = _children[_i].checked ? _value : '';
        if( _returnObject ) {
          _obj[_name] = _value;
        } else {
          if( _formData ) { _formData.append(_name, _value); }
          else { _kvpairs.push( _name+'='+_value ); }
        }
        break;
      case 'select-one':
      case 'select-multiple':
        for(_c=0; _c<_children[_i].options.length; _c++) {
          if( _children[_i].options[_c].selected ) {
            _value = _children[_i].options[_c].value;
            if( _returnObject ) {
              _obj[_name] = _value;
            } else {
              if( _formData ) { _formData.append(_name, _value); }
              else { _kvpairs.push( _name+'='+_value ); }
            }
          }
        }
        break;
      case 'file':
        for(_c=0; _c<_children[_i].files.length; _c++) {
          if( _children[_i].files[_c].name ) {
            // poop?
            if( _returnObject ) {
              _obj[_name] = _children[_i].files[_c].name;
            } else {
              if( _formData ) { _formData.append(_name, _children[_i].files[_c]); }
              else {
                /**
                 * @prototype Build ajax upload support for older browsers with iframe?
                 * @see http://stackoverflow.com/questions/2181385/ie-issue-submitting-form-to-an-iframe-using-javascript
                 */
                var _framename = _formid + 'ajax_iframe';
                var _check = document.getElementById( _framename );
                if( !_check ) {
                  // create iframe
                  var _iframe = document.createElement('iframe');
                  _iframe.name   = _framename;
                  _iframe.setAttribute('id', _framename);
                  //_iframe.onload  = function() { alert('jee: '+(iframe.contentDocument || iframe.contentWindow.document)); };
                  // set form target to iframe and remove onsubmit
                  _e.setAttribute('target', _framename);
                }
                throw new TypeError('Your browser does not support AJAX file uploading.');
              }
            }
          }
        }
        break;
      default:
        _value = _children[_i].value;
        if( _returnObject ) {
          _obj[_name] = _value;
        } else {
          if( _formData ) { _formData.append(_name, _value); }
          else { _kvpairs.push( _name+'='+_value ); } // encodeURIComponent
        }
        break;
    }

  }

  // return FormData or values as url string
  if( _returnObject ) {
    return _obj;
  }
  return _formData ? _formData : _kvpairs.join("&");
};

/**
 * FormStorage for form data
 * --------------------------------
 * @param object _e
 * @global sessionStorage HTML5 feature
 */
Deval.prototype.formStorage = function( _e ) {
  var _stored = '';
  switch( _e.type ) {
    case 'radio':
    case 'checkbox':
      _stored = sessionStorage[_e.name] = _e.checked ? _e.value : '';
      break;
    case "select-one":
      _stored = sessionStorage[_e.name] = _e.value;
      break;
    case "select-multiple":
      var _tmp = [];
      for(var _c=0; _c<_e.options.length; _c++) {
        if( _e.options[_c].selected ) {
          _tmp.push(_e.options[_c].value);
        }
      }
      _stored = sessionStorage[_e.name] = _tmp;
      break;
    default:
      _stored = sessionStorage[_e.name] = _e.value;
      break;
  }
  this._storage[_e.name] = _stored;

  // debug?
  if( this.debug ) {
    this.console.log(_e.name+': '+_stored);
  }

  // Callback if onStorage is set
  if( this.onStorage ) {
    try {
      this.onStorage( this._storage );
    } catch(_er) {
      this.console.error('Deval.formStorage callback says:'+"\n\n"+_er+"\n\n"+this.onStorage);
      return false;
    }
  }
};

/**
 * ClearStorage, but only for our stored values (we don't want to delete user's own things)
 * ----------------------------------------------------------------------------------------
 * @param object o
 */
Deval.prototype.clearStorage = function() {
  // we have storage for all the stored, so let's clear only those
  for(var _i in this._storage) {
    // debug?
    if( this.debug ) {
      this.console.log('Deleted: '+_i+' = '+this._storage[_i]);
    }

    delete sessionStorage[ _i ];
  }

  // clear
  this._storage = {};

  // debug?
  if( this.debug ) {
    this.console.log('Storage cleared.');
  }

  // Callback if onStorage is set
  if( this.onStorage ) {
    try {
      this.onStorage( this._storage );
    } catch(_e) {
      this.console.error('Deval.formStorage callback says:'+"\n\n"+_e+"\n\n"+this.onStorage);
      return false;
    }
  }
};



/**
 * UrlParser class for url pathname and search parsing
 * ===================================================
 * @author MediaMoguli 2014
 * @license Free \o/
 */
function UrlParser() {
  // gathers ( access: url._first, url._last and url._parent )
  this._first = this._last = this._parent = '';
  this._hash = {};

  // get url params from search
  this.getUrlParams( location.search );

  // add path params to url from pathname
  this.parsePathParams( location.pathname );

  // parse hash params
  this.parseHashParams( location.hash );

  // on hash change
  window.onhashchange = function() {
    url.parseHashParams( location.hash );
  };
}

/**
 * URL parameters reader
 * --------------------------------
 * @example alert( url.param )
 * @see http://stackoverflow.com/questions/520611/how-can-i-match-multiple-occurrences-with-a-regex-in-javascript-similar-to-phps/20613629#20613629
 */
UrlParser.prototype.getUrlParams = function( search ) {
  var re = /(?:\?|&(?:amp;)?)([^=&#]+)(?:=?([^&#]*))/g,
      match = {},
      decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };

  if (typeof search == "undefined") { search = document.location.href; }


  while( match = re.exec(search) ) {
    if( this[decode(match[1])] ) {
        if( typeof params[decode(match[1])] != 'object' ) {
          this[decode(match[1])] = new Array( this[decode(match[1])], decode(match[2]) );
        } else {
          this[decode(match[1])].push(decode(match[2]));
        }
    }
    else {
      this[decode(match[1])] = decode(match[2]);
    }
  }

};

/**
 * Parse URL pathname
 * --------------------------------
 * @example alert( url.1+' == '+url._first )
 * @param string pathname = /my/path/ (starting and ending with trail, otherwise wont work..)
 */
UrlParser.prototype.parsePathParams = function( pathname ) {
  // create url.0 url.1 etc. and url.first(), url.second(), url.parent() and url.last()
  var tmp = pathname.split('/');

  // first one is always blank so -1
  var lastindex = tmp.length;
  for(var i=0; i<lastindex; i++) {
    // ignore empty
    if( !tmp[i] ) { continue; }

    // parent for last?
    if( i == lastindex-1 ) {
      this._parent = this._last ? this._last : '';
    }

    // first
    if( i == 1 ) {
      this._first = tmp[i];
    }

    // remember last and set current path entry as url.1, url.2, etc.
    this._last = this[i] = tmp[i];
  }
};

/**
 * Parse hash params
 * --------------------------------
 * @example alert( url._hash.param )
 * @param string hash = '#somehash=with&params=foo'
 */
UrlParser.prototype.parseHashParams = function( hash ) {
  var loc = hash.replace('#', '');
  if( loc ) {
    var parts = loc.split('&');
    for(var i in parts) {
      var part = parts[i].split('=');
      this._hash[part[0]] = part[1];
    }
  }
};

/**
 * Fast id method
 * --------------------------------------------------
 * @example getId('mydivid')
 * @return object|null
 */
function getId(id) {
  var e = document.getElementById(id);
  if( !e ) {
    this.console.error('id() error: id not found: '+id);
    return null;
  }
  return e;
}

/**
 * Polyfill for trim() (IE8 and earlier)
 * --------------------------
 * @see http://stackoverflow.com/questions/2308134/trim-in-javascript-not-working-in-ie
 */
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

/**
 * Polyfill for Object.keys
 * @see http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html
 */
if( !Object.keys ) {
  Object.keys = function(o) {
    if( o !== Object(o) ) {
      throw new TypeError('Object.keys called on a non-object');
    }
    var k = [];
    for(var p in o) {
      if( Object.prototype.hasOwnProperty.call(o,p) ) {
        k.push(p);
      }
    }
    return k;
  };
}

/**
 * Polyfill for addEventListener/removeEventListener
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener
 */
if (!Element.prototype.addEventListener) {
  var oListeners = {};

  function runListeners(oEvent) {
    if (!oEvent) { oEvent = window.event; }
    for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) {
      if (oEvtListeners.aEls[iElId] === this) {
        for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++) { oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent); }
        break;
      }
    }
  }

  Element.prototype.addEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {
    if (oListeners.hasOwnProperty(sEventType)) {
      var oEvtListeners = oListeners[sEventType];
      for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
        if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
      }
      if (nElIdx === -1) {
        oEvtListeners.aEls.push(this);
        oEvtListeners.aEvts.push([fListener]);
        this["on" + sEventType] = runListeners;
      } else {
        var aElListeners = oEvtListeners.aEvts[nElIdx];
        if (this["on" + sEventType] !== runListeners) {
          aElListeners.splice(0);
          this["on" + sEventType] = runListeners;
        }
        for (var iLstId = 0; iLstId < aElListeners.length; iLstId++) {
          if (aElListeners[iLstId] === fListener) { return; }
        }
        aElListeners.push(fListener);
      }
    } else {
      oListeners[sEventType] = { aEls: [this], aEvts: [ [fListener] ] };
      this["on" + sEventType] = runListeners;
    }
  };
  Element.prototype.removeEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {
    if (!oListeners.hasOwnProperty(sEventType)) { return; }
    var oEvtListeners = oListeners[sEventType];
    for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
      if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
    }
    if (nElIdx === -1) { return; }
    for (var iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
      if (aElListeners[iLstId] === fListener) { aElListeners.splice(iLstId, 1); }
    }
  };
}

/**
 * Polyfill for CustomEvents
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

/**
 * Polyfill for getComputedStyle
 * --------------------------------------------------
 * @see http://www.htmlgoodies.com/html5/css/referencing-css3-properties-using-javascript.html#fbid=WnUHkqQ5h_o
 * @param {element} oElm
 * @param {string} css3Prop
 * @returns {string}
 */
function getElementStyle(oElm, css3Prop){
  var strValue = "";

  // All other browsers
  if( window.getComputedStyle ) {
    strValue = getComputedStyle(oElm).getPropertyValue(css3Prop);
  }
  // IE
  else if( oElm.currentStyle ) {
    try {
      strValue = oElm.currentStyle[css3Prop];
    } catch (e) {
      // Alert
      alert('Browser not supported.');
    }
  }

  return strValue;
}

/**
 * No console? create bogus log methods
 */
if( !console ) { console = { log: function(s) {}, error: function(s) {} }; }

/**
 * Initialization for urlParser (url)
 * --------------------------------------------------
 * @global url
 */
var url = new UrlParser();

/**
 * Initialization for Deval (deval)
 * --------------------------------------------------
 * @global deval
 */
var deval = new Deval();
