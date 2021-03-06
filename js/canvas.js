$( function() {

  'strict mode';
  // requestAnimFrame shim
  window.requestAnimFrame = (function()
  {
     return  window.requestAnimationFrame       ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame    ||
             window.oRequestAnimationFrame      ||
             window.msRequestAnimationFrame     ||
             function(callback)
             {
                 window.setTimeout(callback);
             };
  })();

  // get dimensions of window and resize the canvas to fit
  var width = window.innerWidth,
      height = window.innerHeight,
      canvas = document.getElementById("starfield"),
      mousex = width/2, mousey = height/2;

  canvas.width = width;
  canvas.height = height;

  // get 2d graphics context and set global alpha
  var G=canvas.getContext("2d");
  G.globalAlpha=0.25;

  // constants and storage for objects that represent star positions
  var warpZBase = 25,
      warpZ = 25,
      units = 500,
      stars = [],
      Z = 0.025 + (1/25 * 2);

  $( canvas ).bind( 'levelUp', function() {

    if ( warpZ > 4 ) {
      warpZ = warpZ - 2.5;
    }
  });

  $( canvas ).bind( 'levelReset', function() {

    warpZ = warpZBase;
  });

  // function to reset a star object
  function resetstar(a)
  {
     a.x = (Math.random() * width - (width * 0.5)) * warpZ;
     a.y = (Math.random() * height - (height * 0.5)) * warpZ;
     a.z = warpZ;
     a.px = 0;
     a.py = 0;
  }

  // initial star setup
  for (var i=0, n; i<units; i++)
  {
     n = {};
     resetstar(n);
     stars.push(n);
  }

  // star rendering anim function
  var rf = function()
  {
     // clear background
     G.fillStyle = "#000";
     G.fillRect(0, 0, width, height);

     // mouse position to head towards
     var cx = (mousex - width / 2) + (width / 2),
         cy = (mousey - height / 2) + (height / 2);

     // update all stars
     var sat = Math.floor(Z * 500);       // Z range 0.01 -> 0.5
     if (sat > 100) {
      sat = 100;
    }
     for (var i=0; i<units; i++)
     {
        var n = stars[i],            // the star
            xx = n.x / n.z,          // star position
            yy = n.y / n.z,
            e = (1.0 / n.z + 1) * 2;   // size i.e. z

        if (n.px !== 0)
        {
           // hsl colour from a sine wave
           G.strokeStyle = "rgb(255, 255, 255)";
           G.lineWidth = e;
           G.beginPath();
           G.moveTo(xx + cx, yy + cy);
           G.lineTo(n.px + cx, n.py + cy);
           G.stroke();
        }

        // update star position values with new settings
        n.px = xx;
        n.py = yy;
        n.z -= Z;

        // reset when star is out of the view field
        if (n.z < Z || n.px > width || n.py > height)
        {
           // reset star
           resetstar(n);
        }
     }

     window.requestAnimFrame(rf);
  };

  if ( Modernizr.canvas ) {
    window.requestAnimFrame(rf);
  }
});