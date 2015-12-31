var socket = io.connect('192.168.0.159:80');
socket.on('connect', function () {
    var canvas = document.getElementById("example");
    var ctx = canvas.getContext('2d');
    
    // Handle keyboard controls
    var keysDown = {};

    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
    }, false);
    
    // Images
    var bgReady = false;
    var planeReady = false;
    
    var bgImage = new Image();
    var planeImage = new Image();
    
    planeImage.onload = function () {planeReady = true;};
    bgImage.onload = function () {bgReady = true;};
    
    bgImage.src = "images/background.png";
    planeImage.src = "images/plane.png";
    
    var plane = [];
    var myID = '';
    
    $('#submit').on('click', function(){
        username = $('#username').val();
        socket.emit('auth', username);
    });
    socket.on('auth', function (id) {
        myID = id;
        plane[myID] = {
            name: username,
            speed: 256, // movement in pixels per second
            angle: 0,
            x: 0,
            y: 0,
            width: 226/4,
            height: 94/4
        };
        socket.emit('updateServer', plane[myID]);
        
        $('#auth').hide();
        $('canvas').show();
    });
    socket.on('updateClient', function (data) {
        plane[data.id] = {
            name: data.name,
            speed: 256, // movement in pixels per second
            angle: data.angle,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height
        };
    });
    
    socket.on('delPlane', function (id) {
        delete plane[id];
    });
    
    function render() {
        planesCount = 0;
        if (bgReady) {
            ctx.drawImage(bgImage, 0, 0);
        }
        
        for(var i in plane) {
            ++planesCount;

            if (planeReady) {
                ctx.save();
                ctx.fillStyle = "rgb(250, 250, 250)";
                ctx.font = "16px Helvetica";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText(plane[i].name, plane[i].x, plane[i].y - plane[i].width/2);
                ctx.translate(plane[i].x + plane[i].width/2, plane[i].y + plane[i].height/2);
                ctx.rotate(plane[i].angle * Math.PI/180);
                ctx.drawImage(planeImage, -(plane[i].width/2), -(plane[i].height/2), plane[i].width, plane[i].height);
                ctx.restore();
            }

            if(plane[i].angle < 0)
                plane[i].angle = plane[i].angle + 360;

            if(plane[i].angle >= 360)
                plane[i].angle = 360 - plane[i].angle;
            
            /*
            // Обрабатываем столкновения
            if(typeof plane[myID] != undefined) {
                if (
                    i != myID
                    && plane[myID].x <= (plane[i].x + plane[i].width)
                    && plane[i].x <= (plane[myID].x + plane[myID].width)
                    && plane[myID].y <= (plane[i].y + plane[i].width)
                    && plane[i].y <= (plane[myID].y + plane[myID].width)
                ) {
                    // Тут код для обработки столкновений
                }
            }
            */
        }
        
        // Score
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Игроков: " + planesCount , 32, 32);
    }
    
    // Update game objects
    var update = function (modifier) {
        if(plane[myID] !== undefined) {
            // Если самолет залетел за левую границу
            if(plane[myID].x < -plane[myID].width)
                plane[myID].x = canvas.width;

            // Если самолет залетел за правую границу
            if(plane[myID].x > canvas.width + plane[myID].width)
                plane[myID].x = -plane[myID].width;

            // Если самолет залетел за нижнюю границу
            if(plane[myID].y < -plane[myID].height)
                plane[myID].y = canvas.height;

            // Если самолет залетел за верхнюю границу
            if(plane[myID].y > canvas.height + plane[myID].height)
                plane[myID].y = -plane[myID].height;

            plane[myID].y -= plane[myID].speed * modifier * Math.sin(plane[myID].angle * Math.PI / 180);
            plane[myID].x -= plane[myID].speed * modifier * Math.cos(plane[myID].angle * Math.PI / 180);

            if (38 in keysDown) { // Player holding up
                plane[myID].y -= plane[myID].speed * modifier;
            }
            if (40 in keysDown) { // Player holding down
                plane[myID].y += plane[myID].speed * modifier;
            }
            if (37 in keysDown) { // Player holding left
                plane[myID].angle -= 3;
            }
            if (39 in keysDown) { // Player holding right
                plane[myID].angle += 3;
                //plane[i].x += plane[i].speed * modifier;
            }
            data = {
                speed: 256, // movement in pixels per second
                angle: plane[myID].angle,
                x: plane[myID].x,
                y: plane[myID].y,
                width: plane[myID].width,
                height: plane[myID].height
            };
            socket.emit('updateServer', data);
        }
    };
    
    // The main game loop
    var main = function () {
        var now = Date.now();
        var delta = now - then;

        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        render();
        update(delta / 1000);

        then = now;

        // Request to do this again ASAP
        requestAnimationFrame(main);
    };

    // Cross-browser support for requestAnimationFrame
    var w = window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
    var then = Date.now();
    main();
});