var pi=Math.PI;
var sqrt=Math.sqrt;
var random=Math.random;
var round=Math.round;
var deg2rad=pi/180;
var rad2deg=180/pi;

function sin(x)
{
	return Math.sin(x*deg2rad);
}

function cos(x)
{
	return Math.cos(x*deg2rad);
}

function tan(x)
{
	return Math.tan(x*deg2rad);
}

function asin(x)
{
	return rad2deg*Math.asin(x);
}

function acos(x)
{
	return rad2deg*Math.acos(x);
}


function atan(x)
{
	return rad2deg*Math.atan(x);
}
