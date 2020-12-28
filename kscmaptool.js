// *****************************************************************************************
// Map polyline tool for creating bing custom map of campus. -- bcaulfield@keene.edu
// *****************************************************************************************


maptool = {}
maptool.instance = undefined;
maptool.initial_zoom = 18;
maptool.controls = $('#controls');
maptool.polygon = {};
maptool.mousedown = false;
maptool.polygon.instance = undefined;
maptool.polygon.points = [];
maptool.polygon.properties = {
    fillColor: new Microsoft.Maps.Color(0, 0, 0, 0),
    strokeColor: new Microsoft.Maps.Color(255, 206, 17, 38),
    strokeThickness: 7
};

// *****************************************************************************************

maptool.polygon.string_coordinates = function() {
    // return coordinates as lon,lat list    
    var coords = [];
    for(var i=0;i<maptool.polygon.points.length;i++){
        var point = maptool.polygon.points[i];
        // note that these go into a Location as lat,lon - but are entered as lon, lat
      coords.push([point.latitude.toFixed(6),point.longitude.toFixed(6)]);
    
   
			document.getElementById("points").value = coords + ",\n";
		


    }
    return coords.join("<br/> ");
    
}


// *****************************************************************************************

maptool.polygon.close = function() {
    var polygon_length = maptool.polygon.points.length;
    if (maptool.polygon.is_closed() == false && polygon_length > 2){
        maptool.polygon.points.push(maptool.polygon.points[0]);
        maptool.polygon.edit();
    }
}

// *****************************************************************************************

maptool.polygon.undo_last = function() {
    maptool.polygon.points.pop();
    maptool.polygon.edit();
}

// *****************************************************************************************

maptool.polygon.is_closed = function() {
    var polygon_length = maptool.polygon.points.length
    if (polygon_length > 2 && maptool.polygon.points[0] == maptool.polygon.points[polygon_length-1]){
        return true;   
    }else{
        return false;   
    }
}
    
// *****************************************************************************************

maptool.polygon.render = function() {
    
    // draw entities and update controls
    maptool.instance.entities.clear()
    maptool.polygon.instance = new Microsoft.Maps.Polyline(maptool.polygon.points, maptool.polygon.properties);    
    maptool.instance.entities.push(maptool.polygon.instance);
    
    var polygon_length = maptool.polygon.points.length;
    
    maptool.controls.html($([
        '<div class="options">',
            '<a class="rounder_4" href="javascript:maptool.polygon.import();"><span class="shortcut_key">I</span>mport</a>',
            polygon_length > 0 ? '<a class="rounder_4" href="javascript:maptool.polygon.clear();"><span class="shortcut_key">R</span>eset</a>' : '',
            polygon_length > 0 ? '<a class="rounder_4" href="javascript:maptool.polygon.undo_last();"><span class="shortcut_key">U</span>ndo Last Point</a>' : '',
            maptool.polygon.is_closed() == false && polygon_length > 2 ? '<a class="rounder_4" href="javascript:maptool.polygon.close();">Close <span class="shortcut_key">S</span>hape</a>' : '',
        '</div>',
        '<div class="clear"></div>',
        '<form id="import_form"><h3>Import Coordinates</h3><textarea id="import_form_textarea">longitude1, latitude1\nlongitude2, latitude2\netc.</textarea><input id="import_form_submit" type="submit" value="Import"></input></form>',
        '<h3>Polyline Coordinates</h3>',
        '<div class="information">', maptool.polygon.string_coordinates(),'</div>',
        maptool.polygon.points.length === 0 ? '<div class="information clutch"><blink>Right click on map to set point.</blink></div>' : ''
    ].join('')));
    
}

// *****************************************************************************************

maptool.polygon.clear = function() {
    // remove entities
    maptool.polygon.points = [];
    maptool.instance.entities.clear();
    maptool.polygon.instance = undefined;
    maptool.polygon.render();
}

// *****************************************************************************************

maptool.polygon.edit = function() {
    
    var points_length = maptool.polygon.points.length;
    var next_point_location;
    var icon_width = 14;
    var icon_height = 14;
    
    var pin_options = {
        draggable: true, 
        icon: 'http://impeccable-operabil.000webhostapp.com/toolpin.png', 
        height: icon_height, 
        width: icon_width, 
        anchor: new Microsoft.Maps.Point(7, 7) 
    }
    
    var splitter_options = $.extend({},pin_options);
    splitter_options.icon =  'http://impeccable-operabil.000webhostapp.com/toolbox.png';
    
    function add_splitter(point_location, next_point_location, iref){
        
        // one point, no splitter to add
        if (typeof(next_point_location) == 'undefined'){
            return;
        }
        // add splitter point
        var next_point_longitude = next_point_location.longitude;
        var next_point_latitude = next_point_location.latitude;
        var mid_point_longitude = (next_point_longitude + point_longitude)/2;
        var mid_point_latitude = (next_point_latitude + point_latitude)/2;        
        var splitter_location = new Microsoft.Maps.Location(mid_point_latitude, mid_point_longitude);
        var splitter_pin = new Microsoft.Maps.Pushpin(splitter_location, splitter_options); 
        splitter_pin.iref = iref; 
        maptool.instance.entities.push(splitter_pin);
        Microsoft.Maps.Events.addHandler(splitter_pin, 'mouseup', maptool.polygon.edit_update_splitter);
        Microsoft.Maps.Events.addHandler(splitter_pin, 'mouseover', maptool.cursor.move);
    }
    
    maptool.polygon.render();
    
    for(var i=0;i<points_length;i++){
        
        var point_location = maptool.polygon.points[i];
        var point_longitude = point_location.longitude;
        var point_latitude = point_location.latitude;
        
        // closed polyline has 2 identical points at 0 and length -1
        if (i > 1 ){
            var point0_location = maptool.polygon.points[0];
            if (String(point0_location) === String(point_location)){
                continue;
            }
        }
        
        var mm_location = new Microsoft.Maps.Location(point_latitude, point_longitude);
        var edit_pin = new Microsoft.Maps.Pushpin(mm_location, pin_options);         
        edit_pin.iref = i;        
        maptool.instance.entities.push(edit_pin);        
        Microsoft.Maps.Events.addHandler(edit_pin, 'mouseup', maptool.polygon.edit_update_pin);
        Microsoft.Maps.Events.addHandler(edit_pin, 'mouseover', maptool.cursor.move);
        
        var splitter_ref = i+1;
        var next_point_location = maptool.polygon.points[splitter_ref];
        add_splitter(point_location, next_point_location, splitter_ref);
    }
}

// *****************************************************************************************

maptool.polygon.edit_update_pin = function(e) {
    
    // only delete with shift key down
   if (e.originalEvent.shiftKey){
        var point_ref = maptool.polygon.points[e.target.iref];
        var point_ref_latitude = point_ref.latitude;
        var point_ref_longitude = point_ref.longitude;        
        var points = maptool.polygon.points;
        var points_length = points.length;    
        
        // a shape close point can occupy 2 points, start and end - so loop
        for (var i=points_length-1;i>=0; i--){
            var point = points[i];
            if(point.longitude == point_ref_longitude && point.latitude == point_ref_latitude){
                var spliced = maptool.polygon.points.splice(i,1);
            }
        }
        
   }else{
    
        var pin_location = e.target.getLocation();
        var pin_longitude = pin_location.longitude;
        var pin_latitude = pin_location.latitude;
        var point_ref = e.target.iref;     
        
        // maptool.polygon.points[point_ref is a reference, will update a close point
        maptool.polygon.points[point_ref].latitude = pin_latitude;
        maptool.polygon.points[point_ref].longitude = pin_longitude;
        
    }
    
    maptool.polygon.edit();
    
}

// *****************************************************************************************

maptool.polygon.edit_update_splitter = function(e) {
    if (e.targetType == 'pushpin'){
        var pin_location = e.target.getLocation();
        var pin_longitude = pin_location.longitude;
        var pin_latitude = pin_location.latitude;
        var point_ref = e.target.iref;        
        var mm_point = new Microsoft.Maps.Location(pin_latitude, pin_longitude)
        maptool.polygon.points.splice(point_ref,0,mm_point);        
        maptool.polygon.edit();
        
    }
}

// *****************************************************************************************

maptool.cursor = {}

maptool.cursor.crosshairs = function(e) {
    if (!(maptool.mousedown)){
         $('.MicrosoftMap').css('cursor', 'crosshair')
    }
}
maptool.cursor.pointer = function(e) {
    if (!(maptool.mousedown)){
         $('.MicrosoftMap').css('cursor', 'pointer')
    }
}

maptool.cursor.move = function(e) {
    if (!(maptool.mousedown)){
         $('.MicrosoftMap').css('cursor', 'move')
    }
}

// *****************************************************************************************

maptool.keydown = function(e) {
    // shortcut keys
    switch(e.keyCode){
        case 83: // "S"
            maptool.polygon.close();
            break;
        case 73: // "I"
            maptool.polygon.import();
            break;
        case 85: // "U"
            maptool.polygon.undo_last();
            break;
        case 82: // "R"
            maptool.polygon.clear();
            break;
        default:
            break;
    }
}

// *****************************************************************************************

maptool.key_is_down = function(key_code) {    
    if (key_code in maptool.keysdown && maptool.keysdown[key_code]){
        return true;
    }else{
        return false;
    }   
}

// *****************************************************************************************

maptool.click = function(e) {
    
    var point = new Microsoft.Maps.Point(e.getX(), e.getY());
    try{
        var point_location = e.target.tryPixelToLocation(point);
    }catch(e){
        console.error('could not resolve click point');
        return;
    }
    var point_longitude = point_location.longitude;
    var point_latitude = point_location.latitude;
    
    // remove close point if polygon is closed
    if (maptool.polygon.is_closed()){
        maptool.polygon.points.pop();
    }
    
    var mm_location = new Microsoft.Maps.Location(point_latitude, point_longitude);
    maptool.polygon.points.push(mm_location);
    maptool.polygon.edit();
    
}

// *****************************************************************************************

maptool.change = function() {
    // placeholder, perhaps useful in force polygon redraw on Chrome/FF?
}

// *****************************************************************************************

maptool.polygon.import = function() {
    
    var import_form = $('#import_form'); 
    var input_textarea = $('#import_form_textarea');
    
    import_form.toggle();
    input_textarea.select();
    
    import_form.submit(function(){
        
        var input = input_textarea.val();
        var lines = $.trim(input).split("\n");
        
        if (lines == ''){
            return false;
        }
        
        maptool.polygon.clear();
        maptool.polygon.points = [];
        
        
        for(var i=0;i<lines.length;i++){
            var line = $.trim(lines[i]);
            if (line == ''){
                continue;
            }
            var dimensions = line.split(",");
            var point_longitude = $.trim(dimensions[0]);
            var point_latitude = $.trim(dimensions[1]);
            if (isNaN(point_longitude) || isNaN(point_longitude)){
                continue;
            }            
            var mm_location = new Microsoft.Maps.Location(point_latitude, point_longitude);            
            maptool.polygon.points.push(mm_location);
            
        }
        
        maptool.polygon.edit();
        import_form.hide();
        input_textarea.val('');
        
        maptool.instance.setView({center:mm_location, animate: true});
        
        return false;
                
    });
}

// *****************************************************************************************


var rd = 350022666/4713600;
var u = Math.random();
var w = rd * Math.sqrt(u);
var vvvv = Math.random();
var tttt = 2 * Math.PI * vvvv;
var xxxx = w * Math.cos(tttt);
var yyyy = w * Math.sin(tttt);

maptool.init_map = function() {
    

    maptool.instance = new Microsoft.Maps.Map(document.getElementById("map_canvas"), {
        credentials:"AmY05j27qDvcW8z3__5bSPkX4vNLisClvmfdCsoz_w1F4VOxygCIm__0qpwZ82aG",
        center: new Microsoft.Maps.Location(40.853081,20.763935),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 10,
        enableSearchLogo: false,
        showDashboard: false,
        enableClickableLogo: false,
        showCopyright: false,
        tileBuffer: 2,

    });
    
    Microsoft.Maps.Events.addHandler(maptool.instance, 'viewchange', maptool.change);
    Microsoft.Maps.Events.addHandler(maptool.instance, 'rightclick', maptool.click);
    Microsoft.Maps.Events.addHandler(maptool.instance, 'keydown', maptool.keydown);
    Microsoft.Maps.Events.addHandler(maptool.instance, 'mousemove', maptool.cursor.crosshairs);
    Microsoft.Maps.Events.addHandler(maptool.instance, 'mousedown', function(e){maptool.mousedown = true;});
    Microsoft.Maps.Events.addHandler(maptool.instance, 'mouseup', function(e){maptool.mousedown = false;});
    
    maptool.polygon.render();
    
}

// *****************************************************************************************

maptool.init_map();