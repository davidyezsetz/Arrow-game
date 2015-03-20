$( function() {

'use strict';

  /**
   * Set up some variables and options
   */
  function Game() {

    // cache the arrow objects
    this.arrows = [
      {
        id: $( '#arrow-left' ),
        dir: 'right'
      },
      {
        id: $( '#arrow-top' ),
        dir: 'bottom'
      },
      {
        id: $( '#arrow-right' ),
        dir: 'left'
      },
      {
        id: $( '#arrow-bottom' ),
        dir: 'top'
      }
    ];

    // colors
    if ( Modernizr.rgba ) {
      this.colors = {
        base: 'rgba( 27, 50, 71, 0.7 )',
        highlight: 'rgba( 148, 225, 255, 0.7 )',
        fail: 'rgba( 255, 0, 0, 0.7 )'
      };
    } else {
      this.colors = {
        base: 'rgb( 20, 37, 53 )',
        highlight: 'rgb( 137, 208, 235 )',
        fail: '#f00'
      };
    }

    // Keymap (left up right down, wasd, hklj)
    this.keyMap = {
      '37': 1,
      '38': 2,
      '39': 3,
      '40': 4,
      '65': 1,
      '87': 2,
      '68': 3,
      '83': 4,
      '72': 1,
      '75': 2,
      '76': 3,
      '74': 4
    };

    // set up the Game
    this.targetKey       = 0;
    this.pressedKey      = 0;
    this.score           = 0;
    this.scoreMultiplier = 100;
    this.duration        = 60;
    this.activeGame      = false;
    this.countdown       = false;
    this.level           = 1;
    this.xp              = 0;
    this.lastInput       = 0;

    // cache the ui components
    this.timer     = $( '#timer' );
    this.scoreUi   = $( '#score' );
    this.levelUi   = $( '#level' );
    this.canvas    = $( '#starfield' );
    this.menu      = $( '#menu' );
    this.endScreen = $( '#end-screen' );

  }

  /**
   * Calculate and highlight a new target
   */
  Game.prototype.setTarget = function() {

    // remove highlight from previous target
    var oldArrow = this.arrows[this.targetKey];
    this.colorize( oldArrow.id, oldArrow.dir, this.colors.base );

    var rnd;
    for ( var x = 1; x < 1000; x++ ) {
      rnd = Math.floor(Math.random() * 4);
      if( rnd !== this.targetKey ) {
        break;
      }
    }
    this.targetKey = rnd;
    // highlight next target
    var newArrow = this.arrows[this.targetKey];
    this.colorize( newArrow.id, newArrow.dir, this.colors.highlight );
  };

  /**
   * color arrow
   * @param  {obj} arrow        arrow variable
   * @param  {string} arrowReverse border-side (e.g. 'left')
   * @param  {string} color        border-color
   * @return {void}
   */
  Game.prototype.colorize = function(arrow, arrowReverse, color) {

    arrow.css( 'border-' + arrowReverse + '-color', color);
  };

  /**
   * calculate and update score
   * @return {[type]} [description]
   */
  Game.prototype.updateScore = function() {

    // add bonus based on time needed for input
    var now = new Date().getTime();
    var inputTime = now - this.lastInput;
    var bonus = ( 10000 - ( inputTime * 10 ) ) / 10;

    // update last Input
    this.lastInput = now;

    // calculate score
    this.score = (this.score + ( ( this.scoreMultiplier * this.level ) ) + bonus);

    // update score
    this.scoreUi.html( this.score );

    // update level
    this.xp++;

    if( this.xp === ( 10 + this.level ) ) {
      this.level++;
      this.xp = 0;
      this.canvas.trigger( 'levelUp' );
      this.levelUi.html( this.level );
    }
  };

  /**
   * track time
   * @return {void}
   */
  Game.prototype.pulse = function() {

    var that = this;
    var timeRemaining = this.duration;

    this.countdown = setInterval( function() {

      if ( timeRemaining === 0 ) {
        that.gameOver( true, false );
      } else {
        timeRemaining--;
        that.timer.html( timeRemaining + 's' );
      }
    }, 1000 );
  };

  /**
   * reset the game
   * @return {void}
   */
  Game.prototype.reset = function() {

    var that = this;
    var lastTarget = this.arrows[this.targetKey];

    // reset the game
    this.colorize( lastTarget.id, lastTarget.dir, this.colors.base );
    this.targetKey = 0;
    this.countdown = false;
    this.activeGame = false;
    this.score = 0;
    this.level = 1;
    this.xp = 0;

    this.menu.removeClass( 'move--up' );
    this.endScreen.removeClass( 'move--up' );

    // remove spacebar and enter eventlistener
    $( document ).unbind( 'keydown' );

    //restart the game
    that.init();
  };

  /**
   * End the Game
   * @param  {int} input last user input
   * @return {void}
   */
  Game.prototype.gameOver = function(win, input) {

    var arrow      = this.arrows[input];
    var that       = this;
    var endMessage = '<h1>Game Over</h1>Score: ' + this.score + '<br/>Press space or enter to play again';

    clearInterval( this.countdown );
    // colorize wrong input
    if ( !win ) {
      this.colorize( arrow.id, arrow.dir, this.colors.fail );
    }

    // reset warpspeed
    this.canvas.trigger( 'levelReset' );

    this.menu.addClass( 'move--up' );
    this.endScreen.html( endMessage ).addClass( 'move--up' );

    // remove eventlisteners
    $( document ).unbind( 'keydown' );

    // listen to enter or spacebar input
    $( document ).bind( 'keydown', function(e) {

      if ( e.keyCode === 32 || e.keyCode === 13 ) {
        // remove error highlighting
        if ( !win ) {
          that.colorize( arrow.id, arrow.dir, that.colors.base );
        }
        that.reset();
      }
    });
  };

  /**
   * initialze the game
   * @return {void}
   */
  Game.prototype.init = function() {

    var that = this;

    // set up the UI
    this.timer.html( this.duration + 's' );
    this.scoreUi.html( this.score );
    this.levelUi.html( this.level );


    // color the first target
    this.colorize( this.arrows[0].id, this.arrows[0].dir, this.colors.highlight );

    // Listen to keypresses
    $( document ).bind( 'keydown', function(e) {

      // map pressed key to left top right or bottom
      var key = that.keyMap[e.keyCode];

      if ( key ) {
        // disable scrolling in smaller windows
        e.preventDefault();

        // start the game
        if ( !that.activeGame ) {
          that.pulse();
          that.activeGame = true;
          that.lastInput = new Date().getTime();
        }

        // check if input matches target
        if ( ( key - 1 ) === that.targetKey ) {
          that.updateScore();
          that.setTarget();
        } else {
          that.gameOver( false, ( key - 1 ) );
        }
      }
    });
  };

  var newGame = new Game();
  newGame.init();
});