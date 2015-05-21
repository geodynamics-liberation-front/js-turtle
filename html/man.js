function man(b)
{
// body
  forward(b);
// left arm
  left(90);
  forward(b/2);
// right arm
  right(180);
  pen_up();
  forward(b/2);
  pen_down();
  forward(b/2);
  pen_up();
  forward(-b/2);
  pen_down();
// neck
  left(90);
  forward(b/4);
// head
  right(90);
  circle(b/2);
// back_down
  left(90);
  forward(-5*b/4);
// left leg
  left(135);
  forward((b/2)*Math.sqrt(2));
  pen_up();
  forward(-(b/2)*Math.sqrt(2));
  pen_down();
// right leg
  left(90);
  forward((b/2)*Math.sqrt(2));
  pen_up();
  forward(-(b/2)*Math.sqrt(2));
  left(135);
  pen_down();
}
