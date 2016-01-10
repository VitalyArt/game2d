var socket = io.connect();
socket.on('connect', function () {
    var canvas = document.getElementById("example");
    var ctx = canvas.getContext('2d');
    
    var keysDown = {};
    var myBulletsArray = {};
    var myBulletsCount = 0;
    var myBulletLast = 0;
    var otherBulletsArray = {};
    var otherBulletsCount = 0;
    var planesArray = {};
    var myID = '';
    var planesCount = 0;
    var oldCount = 0;
    var youDead = false;

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
    
    socket.on('client player login', function (id) {
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
        socket.emit('server plane update', planesArray[myID]);
    });
    socket.on('client bullet update', function (bullet) {
        otherBulletsArray[otherBulletsCount++] = bullet;
    });
    socket.on('client plane update', function (data) {
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
    
    socket.on('client plane explode', function (id) {
        if(id == myID)
            youDead =true;

        console.log(planesArray[id].name + ' подбит.');
        delete planesArray[id];
    });

    // Disconnect client
    socket.on('client plane delete', function (id) {
        delete planesArray[id];
    });

    // Рендер холста
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        planesCount = 0;
        
        // Рисуем задний фон
        if (bgReady) {
            ctx.drawImage(bgImage, 0, 0);
        }
        
        // Рисуем самолеты
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
        }

        // Рисуем пули выпущенные из своего самолёта
        for(var i in myBulletsArray) {
            ctx.beginPath();
            ctx.arc(myBulletsArray[i].x, myBulletsArray[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
        }

        // Рисуем пули выпущенные из чужих самолётов
        for(var i in otherBulletsArray) {
            ctx.beginPath();
            ctx.arc(otherBulletsArray[i].x, otherBulletsArray[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
        }
        
        // Вызываем событие при изменении количества игроков
        if(oldCount != planesCount) {
            $(window).trigger('planesCountChange', planesArray);
            oldCount = planesCount;
        }
        
        // Выводим кол-во игроков
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Players: " + planesCount , 32, 32);

        if(typeof planesArray[myID] === 'undefined' && youDead) {
            ctx.fillStyle = "rgb(250, 250, 250)";
            ctx.font = "60px Helvetica";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText("YOU DEAD !", canvas.width/2, canvas.height/2);
        }
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
                if(Date.now() - myBulletLast > 200) {
                    var x = planesArray[myID].x + planesArray[myID].width/2 - (planesArray[myID].width - 6)/2*Math.cos(planesArray[myID].angle * Math.PI / 180);
                    var y = planesArray[myID].y + planesArray[myID].height/2 - (planesArray[myID].height + 24)/2*Math.sin(planesArray[myID].angle * Math.PI / 180);
                    myBulletsArray[myBulletsCount++] = {
                        id: myID,
                        speed: 1024,
                        angle: planesArray[myID].angle,
                        x: x,
                        y: y
                    };
                    socket.emit('server bullet update', myBulletsArray[myBulletsCount-1]);
                    myBulletLast = Date.now();
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
            socket.emit('server plane update', data);
        }

        // Обнавляем информацию о пулях
        for(var bullet in myBulletsArray) {
            myBulletsArray[bullet].y -= myBulletsArray[bullet].speed * modifier * Math.sin(myBulletsArray[bullet].angle * Math.PI / 180);
            myBulletsArray[bullet].x -= myBulletsArray[bullet].speed * modifier * Math.cos(myBulletsArray[bullet].angle * Math.PI / 180);
            // Обрабатываем попадания пулей            
            for(var plane in planesArray) {
                if (
                       myBulletsArray[bullet].x <= (planesArray[plane].x + planesArray[plane].width)
                    && myBulletsArray[bullet].y <= (planesArray[plane].y + planesArray[plane].width)
                    && planesArray[plane].x <= (myBulletsArray[bullet].x + 4)
                    && planesArray[plane].y <= (myBulletsArray[bullet].y + 4)
                ) {
                    // UPD: Желательно ещё учитывать угол наклона самолёта
                    if(plane != myID) {
                        console.log('Вы убили ' + planesArray[plane].name);
                        socket.emit('server plane explode', plane);
                        delete planesArray[plane];
                    }
                }
            }
        }
        for(var i in otherBulletsArray) {
            otherBulletsArray[i].y -= otherBulletsArray[i].speed * modifier * Math.sin(otherBulletsArray[i].angle * Math.PI / 180);
            otherBulletsArray[i].x -= otherBulletsArray[i].speed * modifier * Math.cos(otherBulletsArray[i].angle * Math.PI / 180);
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