var _moves=[];
var _states=[]
var x=0;
var y=0;
var theta=90;
var pen=true;
var show=true;
var _container;
var _canvas;
var _paper=null;
var _events_init=false;
//var _canvas.width;
//var _canvas.height;
var zoom_level=1;
var _x0=0;
var _y0=0;
var _mousedrag=false;
var _mousex=0;
var _mousey=y;
var _minzoom=0.1


function _init_turtle(paper_id)
{
	// Get the container
	_container=document.getElementById("container");
	// Get the canvas
	_canvas=document.getElementById(paper_id);
	// Get the context
	_paper=_canvas.getContext('2d');
	_paper.scale(1,-1); 
	_paper.translate(_canvas.width/2,-_canvas.height/2);
	_x0=-_canvas.width/2;
	_y0=_canvas.height/2;
	// Put the turtle in the middle
	if(!_events_init) { _init_events(); }
	// Clear the state
	_init_state();
	_redraw();
}

function _init_events()
{
	// Register some events
	//_container.addEventListener('mouseup',_container_resize); // We should also make a mutation listener even though Chrome dones't work with it
	_canvas.addEventListener('mousedown', _canvas_mousedown);
	_canvas.addEventListener('mouseup', _canvas_mouseup);
	_canvas.addEventListener('mousemove', _canvas_mousemove);
	_canvas.addEventListener('mousewheel', _canvas_mousewheel);
	_events_init=true;
}


function _init_state()
{
	_moves=[];	
	_states=[];	
	x=0;
	y=0;
	theta=90;
	pen=true;
	_moves.push( "_paper.moveTo("+x+","+y+");" );
}

function _container_resize()
{
	_canvas.width=_container.clientWidth-2;
	_canvas.height=_container.clientHeight-2;
}

function _canvas_xy(e)
{
	var rect = _canvas.getBoundingClientRect();
	var x=_x0+(1+e.clientX-rect.left)/zoom_level;
	var y=_y0-(1+e.clientY-rect.top)/zoom_level;
	return {'x':x,'y':y};
}

function _canvas_mousedown(e)
{
	_mousedrag=true;
    _mousex=e.x;
	_mousey=e.y;
	_canvas.className="dragging";
}

function _canvas_mouseup(e)
{
	_mousedrag=false;
    _mousex=0;
	_mousey=0;
	_canvas.className="";
	_canvas_xy(e);
}

function _canvas_mousemove(e)
{
	if(!_mousedrag) {return;}
	var dx=-(_mousex-e.x)/zoom_level;
	_x0-=dx;
	var dy=(_mousey-e.y)/zoom_level;
	_y0-=dy;
	_paper.translate(dx,dy);
	_redraw();
    _mousex=e.x;
	_mousey=e.y;
}

function _canvas_mousewheel(e)
{
	var p=_canvas_xy(e);
	_clear();
	zoom(Math.max(_minzoom,zoom_level+0.1*e.wheelDelta/Math.abs(e.wheelDelta)),p.x,p.y);
	e.stopPropagation();
	e.preventDefault();
	_redraw();
	_update_status();
}

function zoom(n,x,y)
{ 
	// move the origin to the 
	if( x!=null )
	{
		_paper.translate(x,y);
		_x0-=x;
		_y0-=y;
	}
	// Return to zoom 1:1
	zoom_level=1/zoom_level;
	_x0/=zoom_level;
	_y0/=zoom_level;
	_paper.scale(zoom_level,-zoom_level); 
	// zoom out to n
	zoom_level=n;
	_x0/=zoom_level;
	_y0/=zoom_level;
	_paper.scale(zoom_level,-zoom_level); 
	if( x!=null )
	{
		_paper.translate(-x,-y);
		_x0+=x;
		_y0+=y;
	}
}

function pen_up() { pen=false; }

function pen_down() { pen=true; }

function left(dTheta) { theta=(theta+dTheta)%360; }

function forward(d)
{
	x+=d*cos(theta);
	y+=d*sin(theta);
	var m;
	if( pen )
	{
		m="_paper.lineTo("+x+","+y+");";
	}
	else
	{
		m="_paper.moveTo("+x+","+y+");";
	}
	_moves.push(m);
}

// allows internal command to prevent their state from being stored (like undo)
var _state=null;

function _record_state()
{
	// record the state
	_state = { 'x':x,'y':y,'theta':theta,'pen':pen,'moves':_moves.length};
}

function _save_state()
{
	if( _state!=null )
	{
		_states.push(_state);
	}
}

function undo()
{
	// prevent the recording of the 'undo' state
	_state=null;
	if( _states.length>0 )
	{
		var s=_states.pop();
		x=s.x;
		y=s.y;
		theta=s.theta;
		pen=s.pen;
		_moves=_moves.slice(0,s.moves);
	}
}

function _clear()
{
	w=_canvas.width/zoom_level;
	h=_canvas.height/zoom_level;
	_paper.clearRect(_x0,_y0,w,-h);
}

function clean_up()
{
	_clear();
	_init_state();
	_draw_turtle();
}

function _redraw()
{
	_clear();
	_paper.lineWidth=1/zoom_level;
	_paper.beginPath();
	for( var i in _moves )
	{
		eval(_moves[i]);
	}
	_paper.stroke();
	_draw_turtle();
}

function _draw_turtle()
{
	if( !show ) { return; }
	// Save the current image to the buffer
	var base=10/zoom_level;
	var height=15/zoom_level;
	var a=theta*deg2rad;
	_paper.beginPath();
	_paper.moveTo(x+.5*base*Math.cos(Math.PI/2+a), y+.5*base*Math.sin(Math.PI/2+a));
	_paper.lineTo(x+.5*base*Math.cos(3*Math.PI/2+a), y+.5*base*Math.sin(3*Math.PI/2+a));
	_paper.lineTo(x+height*Math.cos(a), y+height*Math.sin(a));
	_paper.closePath();
	_paper.fill();
	_paper.moveTo(x,y);
}
