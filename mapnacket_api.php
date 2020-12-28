<?php


session_start();
require_once('tumblroauth/tumblroauth.php');

// Define the needed keys
$consumer_key = "<CONSUMER_KEY>";
$consumer_secret = "<CONSUMER_SECRET>";
$oauth_token = '<OAUTH_TOKEN>';
$oauth_token_secret = '<OAUTH_SECRET>';
$base_hostname = 'mapnacket.info';

//posting URI - http://www.tumblr.com/docs/en/api/v2#posting
$post_URI = 'http://api.tumblr.com/v2/blog/'.$base_hostname.'/post';
$tum_oauth = new TumblrOAuth($consumer_key, $consumer_secret, $oauth_token, $oauth_token_secret);

// Make an API call with the TumblrOAuth instance. For text Post, pass parameters of type, title, and body
  $mape = ''.$_POST['maptext'].'';
list($lat1, $lng1, $lat2, $lng2, $lat3, $lng3, $lat4, $lng4, $lat5, $lng5, $lat6, $lng6, $lat7, $lng7, $lat8, $lng8, $lat9, $lng9, $lat10, $lng10, $lat11, $lng11, $lat12, $lng12, $lat13, $lng13, $lat14, $lng14, $lat15, $lng15, $lat16, $lng16, $lat17, $lng17, $lat18, $lng18, $lat19, $lng19, $lat20, $lng20, $lat21, $lng21, $lat22, $lng22, $lat23, $lng23, $lat24, $lng24, $lat25, $lng25, $lat26, $lng26, $lat27, $lng27, $lat28, $lng28, $lat29, $lng29, $lat30, $lng30, $lat31, $lng31, $lat32, $lng32, $lat33, $lng33, $lat34, $lng34, $lat35, $lng35, $lat36, $lng36, $lat37, $lng37, $lat38, $lng38, $lat39, $lng39, $lat40, $lng40, $lat41, $lng41, $lat42, $lng42, $lat43, $lng43, $lat44, $lng44, $lat45, $lng45, $lat46, $lng46, $lat47, $lng47, $lat48, $lng48, $lat49, $lng49, $lat50, $lng50, $lat51, $lng51, $lat52, $lng52, $lat53, $lng53, $lat54, $lng54, $lat55, $lng55, $lat56, $lng56, $lat57, $lng57, $lat58, $lng58, $lat59, $lng59, $lat60, $lng60, $lat61, $lng61, $lat62, $lng62, $lat63, $lng63, $lat64, $lng64) = explode(',',$mape,10025);
      

$coordinates = array();
$script_coords = array();

array_push($coordinates, $lat1, $lng1, $lat2, $lng2, $lat3, $lng3, $lat4, $lng4, $lat5, $lng5, $lat6, $lng6, $lat7, $lng7, $lat8, $lng8, $lat9, $lng9, $lat10, $lng10, $lat11, $lng11, $lat12, $lng12, $lat13, $lng13, $lat14, $lng14, $lat15, $lng15, $lat16, $lng16, $lat17, $lng17, $lat18, $lng18, $lat19, $lng19, $lat20, $lng20, $lat21, $lng21, $lat22, $lng22, $lat23, $lng23, $lat24, $lng24, $lat25, $lng25, $lat26, $lng26, $lat27, $lng27, $lat28, $lng28, $lat29, $lng29, $lat30, $lng30, $lat31, $lng31, $lat32, $lng32, $lat33, $lng33, $lat34, $lng34, $lat35, $lng35, $lat36, $lng36, $lat37, $lng37, $lat38, $lng38, $lat39, $lng39, $lat40, $lng40, $lat41, $lng41, $lat42, $lng42, $lat43, $lng43, $lat44, $lng44, $lat45, $lng45, $lat46, $lng46, $lat47, $lng47, $lat48, $lng48, $lat49, $lng49, $lat50, $lng50, $lat51, $lng51, $lat52, $lng52, $lat53, $lng53, $lat54, $lng54, $lat55, $lng55, $lat56, $lng56, $lat57, $lng57, $lat58, $lng58, $lat59, $lng59, $lat60, $lng60, $lat61, $lng61, $lat62, $lng62, $lat63, $lng63, $lat64, $lng64);



$i = 0; 
while($i < count($coordinates)) {


   if (!empty($coordinates[($i)])) {
        $content_script= "new VELatLong(".$coordinates[$i].",".$coordinates[$i+1]."),";
        array_push($script_coords, $content_script);
   }
   
$i = $i + 2;
   
}


if (empty($mape)) {
 header('Location: http://mapnacket.info/error1');
die();
}


$parameters = array();
$parameters['type'] = "text";

$parameters['title'] = $mape;

$table_coords = join('',$script_coords);
$sanitize_coords = trim($table_coords, ',');

   $parameters['body'] = "<script>var map;function SetInfoBlock(e) { var lat = e.view.LatLong.Latitude;var long = e.view.LatLong.Longitude;document.getElementById('info').innerHTML ='Latitude = ' + lat + ', Longitude = '  + long + ', Zoom=' + e.view.zoomLevel;} function OnPageLoad() { map = new VEMap('myMap');map.LoadMap();map.AttachEvent('onclick', SetInfoBlock);DrawLine(); }   function DrawLine() { var points = [$sanitize_coords]; var color = new VEColor(255,0,0,1); var width = 9;var id = 'I70';var poly = new VEPolyline(id,points, color, width);map.AddPolyline(poly);map.SetMapView(points); } </script>";




$post = $tum_oauth->post($post_URI,$parameters);


//var_dump($tum_oauth);
echo "<br><br>";
var_dump($post);

// Check for an error.
if (201 == $tum_oauth->http_code) {
  echo $post->meta->msg;

 $zero = $post->response->id;
  echo "<br>id:".$post->response->id;
header("Location:http://mapnacket.info/post/$zero"); 
}
else
{
header("Location:http://mapnacket.info/error2"); 
}
 			
  
?>
