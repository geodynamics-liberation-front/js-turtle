function right(a)
{
  left(-a);
}

function shape(l,s)
{
  for(var i=0;i<s;i++)
  {
  	forward(l);
	left(360/s);
  }
}

function circle(d)
{
	shape(pi*d/100,100);
}

function square(l)
{
	shape(l,4);
}

function rectangle(l,w)
{
  for(var i=0;i<2;i++)
  {
  	forward(l);
	left(90);
  	forward(w);
	left(90);
  }
}

function many_shapes(n)
{
	for(var i=3; i<n; i++) 
	{ 
		shape(pi*10,i); 
	}
}
