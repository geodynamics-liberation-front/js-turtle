function A(s)
{
  var l=s/4;
  var h=Math.sqrt(5)*l;
  var alpha=asin(1/Math.sqrt(5));
  pen_down();
  left(90);
  forward(2*l);
  right(alpha);
  forward(h);
  right(180-2*alpha);
  forward(h);
  right(90+alpha);
  forward(l*2);
  pen_up();
  forward(-2*l);
  pen_down();
  left(90);
  forward(2*l);
  left(90);
  pen_up()
  forward(l);
  pen_down();
}
function B(s)
{
  var l=s/4;
  var h=Math.sqrt(2)*l;
  var alpha=asin(1/Math.sqrt(5));
  pen_down(); // Make sure we are writing
  left(90); // Point up
  forward(4*l);
  right(90);
  forward(l);
  right(45);
  forward(h);
  right(90);
  forward(h);
  right(45);
  forward(l);
  pen_up;
  forward(-l);//use asP and finsh
  left(135);
  forward(h);
  right(90);
  forward(h);
  right(45);
  forward(l);
  pen_up;
  forward(-l);
  right(180);
  pen_up();
  forward(2*l);
  pen_down();
}

