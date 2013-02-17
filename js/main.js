(function($, window, undefined) {
    var gameScene = null;
    var inputCanvas = {
        width : 0,
        height : 0
    };

    var CONF = {
        gameScene : {
            width : 800,
            height : 600,
            bgColor : 'grey'
        }
    };

    // Store head position
    var head = {
        x : 0, // %
        y : 0 // %
    };

    // List of "characters" (game elements) on screen
    var characters = [
        new Skier(false, 'red'),
        new Skier(true, 'black')
    ];

    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
    

    /* Characters (game elements) classes */
    function Skier(smoothMovement, bgColor) {
        this.width = 50;
        this.height = 50;
        this.bgColor = (typeof smoothMovement === 'undefined') ? 'black' : bgColor;
        this.smoothMovement = (typeof smoothMovement === 'undefined') ? false : smoothMovement;

        this.x = CONF.gameScene.width / 2 - this.width;
        this.y = CONF.gameScene.height / 2 - this.height;

        this.px = 0;
        this.py = 0;

        this.initialized = false;

        // Calculate skier position
        this.calculatePosition = function() {
            var maxDeltaX = 0.03;
            var maxDeltaY = 0.03;

            var deltaX = this.px - (1 - head.x); // oldPosition - newPosition
            var deltaY = this.py - head.y; // oldPosition - newPosition
            

            // Calculate percentage distance
            this.x = CONF.gameScene.width - (CONF.gameScene.width * head.x); // default behavior
            this.y =  CONF.gameScene.height * head.y;

            // Smooth out movement if required
            if(this.smoothMovement && this.initialized) {
                if(deltaX > maxDeltaX) {
                    this.x = CONF.gameScene.width - (CONF.gameScene.width * (1 - this.px + maxDeltaX));
                }
                if(deltaX < maxDeltaX *(-1)) {
                    this.x = CONF.gameScene.width - (CONF.gameScene.width *  (1 - this.px - maxDeltaX));
                }

                if(deltaY > maxDeltaY) {
                    this.y = CONF.gameScene.height * (this.py - maxDeltaY);
                }
                if(deltaY < maxDeltaY *(-1)) {
                    this.y = CONF.gameScene.height * (this.py + maxDeltaY);
                }
            }
            
            // Store percentages positions
            this.px = this.x / CONF.gameScene.width;
            this.py = this.y / CONF.gameScene.height;

            this.initialized = true;
        };

        this.update = function() {
            this.calculatePosition();
        };

        this.render = function() {
            // Draw skier
            gameScene.fillStyle = this.bgColor;
            gameScene.fillRect(this.x,this.y,this.width,this.height);
        };
    }

    function initHeadTracking() {
        var videoInput = document.getElementById('inputVideo');
        var canvasInput = document.getElementById('inputCanvas');

        var htracker = new headtrackr.Tracker({
            detectionInterval : 30,
            smoothing: true
        });
        htracker.init(videoInput, canvasInput);
        htracker.start();

        // Retrieve input canvas dimensions  in order to calculate head positions
        inputCanvas.width = canvasInput.getAttribute('width');
        inputCanvas.height = canvasInput.getAttribute('height');
    }

    function createScene() {
        // Add game scene
        var c = document.createElement('canvas');
        c.setAttribute('id', 'gameScene');
        c.setAttribute('width', CONF.gameScene.width);
        c.setAttribute('height', CONF.gameScene.height);
        document.body.appendChild(c); // adds the canvas to the body element
        gameScene =  document.getElementById('gameScene').getContext('2d');
    }

    function renderFrame() {
        requestAnimFrame(renderFrame);
        render();
    }

    function initGame() {
        var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        if(!is_chrome) {
            alert("This is an experiment and only work with Chrome !");
            return;
        }

        createScene();
    
        document.addEventListener('facetrackingEvent', function (event) {
        //document.addEventListener('headtrackingEvent', function (event) {
            // Store head position
            head.x = (event.x / inputCanvas.width); //.toFixed(3); // %
            head.y = (event.y / inputCanvas.height); //.toFixed(3); // %
            // Update scene
            update();
        });

        // Game loop
       renderFrame();
    }

    function update() {
        // Update all characters
        for(var i=0, len=characters.length; i < len; i++) {
            if(typeof characters[i].update === 'function' ) {
                characters[i].update();
            }
            
        }
    }

    function render() {
        // Clear content
        gameScene.clearRect(0, 0, CONF.gameScene.width, CONF.gameScene.height);
        // Add background
        gameScene.fillStyle = CONF.gameScene.bgColor;
        gameScene.fillRect(0,0,CONF.gameScene.width,CONF.gameScene.height);
        // Render all characters
        for(var i=0, len=characters.length; i < len; i++) {
            if(typeof characters[i].render === 'function' ) {
                characters[i].render();
            }
        }
       
        
    }

    // DOM READY
    $(function() {
        // Initialization
        initHeadTracking();
        initGame();
    });
    
   
}($, window));
