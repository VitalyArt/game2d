var socket = io.connect();
socket.on('connect', function () {
    var canvas = document.getElementById("example");
    var ctx = canvas.getContext('2d');
    
    var keysDown = {};
    var bulletsArray = {};
    var bulletsCount = 0;
    var bulletLast = 0;
    var planesArray = {};
    var myID = '';
    var planesCount = 0;
    var oldCount = 0;

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
    
    planeImage.onload = function () {
        planeReady = true;
    };

    bgImage.onload = function () {
        bgReady = true;
    };
    
    bgImage.src = "images/background.png";
    planeImage.src = "images/plane.png";
    
    socket.on('auth', function (id) {
        myID = id;
        planesArray[myID] = {
            name: username,
            speed: 256, // movement in pixels per second
            angle: 0,
            x: 0,
            y: 0,
            width: 226/4,
            height: 94/4
        };
        socket.emit('updateServer', planesArray[myID]);
    });
    socket.on('updateClient', function (data) {
        planesArray[data.id] = {
            name: data.name,
            speed: data.speed, // movement in pixels per second
            angle: data.angle,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height
        };
    });
    
    socket.on('delPlane', function (id) {
        delete planesArray[id];
    });
    
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        planesCount = 0;
        
        if (bgReady) {
            ctx.drawImage(bgImage, 0, 0);
        }
        
        for(var i in planesArray) {
            ++planesCount;

            if (planeReady) {
                ctx.save();
                ctx.fillStyle = "rgb(250, 250, 250)";
                ctx.font = "16px Helvetica";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText(planesArray[i].name, planesArray[i].x, planesArray[i].y - planesArray[i].width/2);
                ctx.translate(planesArray[i].x + planesArray[i].width/2, planesArray[i].y + planesArray[i].height/2);
                ctx.rotate(planesArray[i].angle * Math.PI/180);
                ctx.drawImage(planeImage, -(planesArray[i].width/2), -(planesArray[i].height/2), planesArray[i].width, planesArray[i].height);
                ctx.restore();
            }

            /*
            // Обрабатываем столкновения
            if(typeof planesArray[myID] != undefined) {
                if (
                    i != myID
                    && planesArray[myID].x <= (planesArray[i].x + planesArray[i].width)
                    && planesArray[i].x <= (planesArray[myID].x + planesArray[myID].width)
                    && planesArray[myID].y <= (planesArray[i].y + planesArray[i].width)
                    && planesArray[i].y <= (planesArray[myID].y + planesArray[myID].width)
                ) {
                    // Тут код для обработки столкновений
                }
            }
            */
        }

        for(var i in bulletsArray) {
            ctx.beginPath();
            ctx.arc(bulletsArray[i].x, bulletsArray[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
        }
        
        // Вызываем событие при изменении количества игроков
        if(oldCount != planesCount) {
            $(window).trigger('planesCountChange', planesArray);
            oldCount = planesCount;
        }
        
        // Score
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Players: " + planesCount , 32, 32);
    }
    
    // Update game objects
    var update = function (modifier) {
        if(planesArray[myID] !== undefined) {
            // Если самолет залетел за левую границу
            if(planesArray[myID].x < -planesArray[myID].width)
                planesArray[myID].x = canvas.width;

            // Если самолет залетел за правую границу
            if(planesArray[myID].x > canvas.width + planesArray[myID].width)
                planesArray[myID].x = -planesArray[myID].width;

            // Если самолет залетел за нижнюю границу
            if(planesArray[myID].y < -planesArray[myID].height)
                planesArray[myID].y = canvas.height;

            // Если самолет залетел за верхнюю границу
            if(planesArray[myID].y > canvas.height + planesArray[myID].height)
                planesArray[myID].y = -planesArray[myID].height;

            // Стреляем по нажатию на пробел
            if (32 in keysDown) {
                if(Date.now() - bulletLast > 200) {
                    var x = planesArray[myID].x + planesArray[myID].width/2 - (planesArray[myID].width - 6)/2*Math.cos(planesArray[myID].angle * Math.PI / 180);
                    var y = planesArray[myID].y + planesArray[myID].height/2 - (planesArray[myID].height + 24)/2*Math.sin(planesArray[myID].angle * Math.PI / 180);
                    bulletsArray[bulletsCount++] = {
                        speed: 1024,
                        angle: planesArray[myID].angle,
                        x: x,
                        y: y
                    };
                    bulletLast = Date.now();
                }
            }
            if (37 in keysDown) { // Обрабатываем нажатия на левую стрелку
                planesArray[myID].angle -= 0.8 * planesArray[myID].speed * modifier;
            }
            if (39 in keysDown) { // Обрабатываем нажатия на правую стрелку
                planesArray[myID].angle += 0.8 * planesArray[myID].speed * modifier;
            }

            if(planesArray[myID].angle < 0)
                planesArray[myID].angle = planesArray[myID].angle + 360;

            if(planesArray[myID].angle >= 360)
                planesArray[myID].angle = planesArray[myID].angle - 360;

            planesArray[myID].y -= planesArray[myID].speed * modifier * Math.sin(planesArray[myID].angle * Math.PI / 180);
            planesArray[myID].x -= planesArray[myID].speed * modifier * Math.cos(planesArray[myID].angle * Math.PI / 180);

            data = {
                speed: 256, // movement in pixels per second
                angle: planesArray[myID].angle,
                x: planesArray[myID].x,
                y: planesArray[myID].y,
                width: planesArray[myID].width,
                height: planesArray[myID].height
            };
            socket.emit('updateServer', data);
        }

        // Обнавляем информацию о пулях
        for(var i in bulletsArray) {
            bulletsArray[i].y -= bulletsArray[i].speed * modifier * Math.sin(bulletsArray[i].angle * Math.PI / 180);
            bulletsArray[i].x -= bulletsArray[i].speed * modifier * Math.cos(bulletsArray[i].angle * Math.PI / 180);
        }
    };
    
    // The main game loop
    var main = function () {
        var now = Date.now();
        var delta = now - then;

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