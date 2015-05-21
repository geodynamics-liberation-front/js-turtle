var _commands=[];
var _cmd_ndx=0;
var _restore=false; // prevents load and save events from being called during a _restore
// The javascript editor
var _editor=null;
// Editor state
var _normal_mode=0;
var _save_mode=1;
var _editor_mode=_normal_mode;
// The _environment memory
var _env=[];
var _env_existing=[];
var _odd=true;

function _init_chrome(restore_local)
{
	// Set the global variables
	_commands=[];
	_cmd_ndx=0;
	_restore=false;
	_editor=null;
	_normal_mode=0;
	_save_mode=1;
	_editor_mode=_normal_mode;
	_env=[];
	_env_existing=[];
	_odd=true;
	document.getElementById('cmd_history').innerHTML='';

	//
	// The editor setup
	//

	// Create the _environment
	_env.push('pen_up');
	_env.push('pen_down');
	_env.push('forward');
	_env.push('left');
	_env.push('undo');
	_env.push('clean_up');
	_env.push('save');
	_env.push('load');
	_env.push('x');
	_env.push('y');
	_env.push('theta');
	_env.push('pen');
	for( var i in window )
	{
		_env_existing.push(i);
	}

	// Java script editor
	_editor = CodeMirror.fromTextArea(document.getElementById("editor"), 
		{
			lineNumbers: true,
			matchBrackets: true,
			extraKeys: {
			"Ctrl-Enter": _submit_editor,
			"Esc": _toggle_view
			}
		});
	if( restore_local && window.localStorage['commands']!==null )
	{
		if( window.confirm("Welcome back, would you like to restore your previous session?") )
		{
			_restore=true;  // knowing functions ignore this
			var cmds = JSON.parse(window.localStorage['commands']);
			for( i=0; i<cmds.length; i++ )
			{
				_execute(cmds[i]);
			}
			_restore=false;
		}
	}
	_update_status();
}

function _update_status()
{
	var status=document.getElementById('status');
	var status_txt=       '<span class="label">X:</span>'+_sigfigs(x,1)+'&nbsp;&nbsp;';
	status_txt=status_txt+'<span class="label">Y:</span>'+_sigfigs(y,1)+'&nbsp;&nbsp;';
	status_txt=status_txt+'<span class="label">&theta;:</span>'+_sigfigs(theta,1)+'&deg;&nbsp;&nbsp;';
	status_txt=status_txt+'<span class="label">Pen:</span>'+(pen?'down':'up')+'&nbsp;&nbsp;';
	status_txt=status_txt+'<span class="label">Zoom:</span>'+_sigfigs(zoom_level*100,1)+'%&nbsp;&nbsp;';
	status.innerHTML=status_txt;
}

/* Wrap setTimeout to redraw */
var _setTimeoutOrig=setTimeout;
function _customTimeout(func,millis)
{
	// If this is called as part of a turtle script then we should
	// always have a caller so we add the _redraw call, otherwise not
	var timeout_id=_setTimeoutOrig(func,millis);
	if(_customTimeout.caller!=null)
	{
		setTimeoutOrig(_redraw,millis+1);
	}
	return timeout_id;
}
setTimeout=_customTimeout;

function _execute(js)
{
	_record_state();
	js=js.trim();
	if( js!=='' )
	{
		try
		{
			var out=window.eval(js);
			// Check for updates to the _environment
			_update_env();
			_write_cmd(js);
			_write_output(out);
			_redraw();
			_save_state();
		}
		catch(err)
		{
			_write_error(err,js);
		}
		_update_status();
		_commands.push(js);
		window.localStorage.setItem('commands',JSON.stringify(_commands));
//		window.localStorage.setItem('moves',JSON.stringify(_moves));
//		window.localStorage.setItem('env','tbd');
		_cmd_ndx=_commands.length;
	}
}

function _sigfigs(f,d)
{
	return Math.round(f*Math.pow(10,d))/Math.pow(10,d);
}

function _toEntity(s)
{
	return s.replace('>','&gt;').replace('<','&lt;');
}

function _fromEntity(s)
{
	return s.replace('&lt;','<').replace('&gt;','>').replace('&amp;','&');
}

function _update_env()
{
	for( var i in window )
	{
		if( _env_existing.indexOf(i)==-1 )
		{
			_env_existing.push(i);
			_env.push(i);
		}
	}
}

function _print(msg) { return msg; }

function _write_output(msg)
{
	if(msg==undefined) { return; }
	msg=new String(msg);
	msg=msg.trim();
	if(msg==='') { return; }
	var cmd=document.createElement('div');
	cmd.className='cmd_history_item output';

/* Create the line number */
	var line_number='00000'+_commands.length;
	var line_number_div=document.createElement('div');
	line_number_div.className='cmd_history_number';
	line_number_div.innerHTML="&gt;&gt;&gt;";
	cmd.appendChild(line_number_div);

/* Create the command  */
	var cmd_text=document.createElement('pre');
	cmd_text.className='cmd_history_text '+(_odd?'odd':'even');
	cmd_text.innerHTML=_toEntity(msg);
	cmd.appendChild(cmd_text);
	_odd=!_odd;

/* Add the command history and scroll to the bottom */
	var cmd_history=document.getElementById('cmd_history');
	cmd_history.appendChild(cmd);	
	cmd_history.scrollTop = cmd_history.scrollHeight;
}

function _write_cmd(js)
{
	var cmd=document.createElement('div');
	cmd.className='cmd_history_item';

/* Create the line number */
	var line_number='00000'+_commands.length;
	var line_number_div=document.createElement('div');
	line_number_div.className='cmd_history_number';
	line_number_div.innerHTML=line_number.substring(line_number.length-5);
	cmd.appendChild(line_number_div);

/* Create the command  */
	var cmd_text=document.createElement('pre');
	cmd_text.className='cmd_history_text '+(_odd?'odd':'even');
	cmd_text.onclick=cmd_history_click;
	cmd_text.innerHTML=_toEntity(js);
	cmd.appendChild(cmd_text);

	_odd=!_odd;
/* Add the command history and scroll to the bottom */
	var cmd_history=document.getElementById('cmd_history');
	cmd_history.appendChild(cmd);	
	cmd_history.scrollTop = cmd_history.scrollHeight;
}

function _write_error(err,js)
{
	var pre_cmd=document.createElement('div');
	var parity=(_odd?'odd':'even');
	var msg='&quot;'+_toEntity(js)+'&quot;\n'+err.name+": "+err.message;
	var line_number='00000'+_commands.length;
	line_number=line_number.substring(line_number.length-5);
	pre_cmd.innerHTML='<div class="cmd_history_number">'+line_number+'</div><pre class="cmd_error '+parity+'">'+msg+'</pre>';
	pre_cmd.className='cmd_history_item';
	_odd=!_odd;
	var cmd_history=document.getElementById('cmd_history');
	cmd_history.appendChild(pre_cmd);	
	cmd_history.scrollTop = cmd_history.scrollHeight;
}

function cmd_history_click(event)
{
	var js=event.target.innerHTML;
	js=_fromEntity(js);
	if( js.indexOf('\n')==-1 )
	{
		_show_cmdline();
		document.getElementById('cmdline').value=js;
	}
	else
	{
		_show_editor();
		_editor.setValue(js);
	}
}

function _cmdline_keydown(event)
{
	// 40 down
	// 38 up
	if(event.keyCode==40) // down
	{
		if(_cmd_ndx<_commands.length)
		{
			_cmd_ndx+=1;
			if(_cmd_ndx==_commands.length)
			{
				document.getElementById('cmdline').value="";
			}
		else
			{
				document.getElementById('cmdline').value=_commands[_cmd_ndx];
			}
		}
		return false;
	}
	else if (event.keyCode==38) //up
	{
		if(_cmd_ndx>0)
		{
			_cmd_ndx-=1;
			document.getElementById('cmdline').value=_commands[_cmd_ndx];
		}
		return false;
	}
	else if ( event.keyCode==69 && event.ctrlKey ) // ctrl-e
	{
		_toggle_view();
		return false;
	}
	else if ( event.keyCode==83 && event.ctrlKey ) // ctrl-s
	{
		_save_commands();
		return false;
	}
	return true;
}

function _cmdline_keypress(event)
{
	if( event.keyCode==13 )
	{
		var cmdline=document.getElementById("cmdline");
		_execute(cmdline.value);
		cmdline.value="";
	}
}

function _submit_editor()
{
	var js=_editor.getValue();
	_editor.setValue('');
	if( _editor_mode==_normal_mode )
	{
		_toggle_view();
		_execute(js);
	}
	else if ( _editor_mode==_save_mode )
	{
		_save_editor(js);
		_toggle_view();
	}
}

/*
Function to switch between the command line and editor
*/

function _toggle_view()
{
	if( document.getElementById("cmdline_view").style.display=="none" )
	{
		if(_editor_mode==_normal_mode && _editor.getValue()!=='')
		{
			if( !confirm('Are you sure you want to leave the editor and lose your work?') )
			{
				return;
			}
		}
		_show_cmdline();
		_editor_mode=_normal_mode;
	}
	else
	{
		_show_editor();
	}
}

function _show_editor()
{
	var cmdline_view=document.getElementById("cmdline_view");
	var editor_view=document.getElementById("editor_view");
	var height=parseInt(getComputedStyle(cmdline_view)['height'],10); 
	cmdline_view.style.display="none";
    editor_view.style.display="block";
	editor_view.style.height=(height-12)+'px';
	//editor.getScrollerElement().style.height=(height-12)+'px'; 
	/* Copy the contents from the cmdline to the editor */
	/* editor.setValue(document.getElementById('cmdline').value);  */
	document.getElementById('cmdline').value='';
	_editor.focus();
	_editor.refresh();
}

function _show_cmdline()
{
	var cmdline_view=document.getElementById("cmdline_view");
	var editor_view=document.getElementById("editor_view");
	var height=parseInt(getComputedStyle(editor_view)['height'],10);

    editor_view.style.display="none";
	cmdline_view.style.display="block";
	cmdline_view.style.height=(height+12)+'px';
	
	var cmdline=document.getElementById('cmdline');
	/* cmdline.value=editor.getValue(); */
	cmdline.focus();
	_editor.setValue('');
}
/* 
file save functions
*/

function save(js)
{
	if( _restore ) { return; }
	_editor_mode=_save_mode;
	_show_editor();
	if( js==null )
	{	
		_editor.setValue(_commands.join('\n'));
	}
	else
	{	
		_editor.setValue(String(window.eval(js)));
	}
}

function _save_editor(js)
{
	var uri= "data:application/octet-stream," + encodeURIComponent(js.trim());
	open(uri,'turtle_commands');
	_editor_mode=_normal_mode;
	_editor.setValue('');
}

function _save_editor(js)
{
	var uri= "data:application/octet-stream," + encodeURIComponent(js.trim());
	open(uri,'turtle_commands');
	_editor_mode=_normal_mode;
	_editor.setValue('');
}

/* 
file read functions
*/
function load()
{
	if( _restore ) { return; }
	var file_btn=document.getElementById('files'); 
	file_btn.style.display=""; 
	file_btn.focus(); 
	file_btn.click();
	file_btn.style.display="none";
	file_btn.value="";
}

function load_file_change(event)
{
	var file=event.target.files[0];
	var reader=new FileReader();
    reader.onload = function(e) 
	{
		_show_editor();
		_editor.setValue(e.target.result);
    };
    reader.onerror = function(stuff) 
	{
		console.log("error", stuff);
		console.log (stuff.getMessage());
	};
	reader.readAsText(file);
}

