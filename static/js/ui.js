// Connect client
socket.on('connect', function () {
    $('#submit').on('click', function() {
        username = $('input#username').val();
        socket.emit('server player login', username);
    });

    // Auth client
    socket.on('client player login', function (id) {
        myID = id;

        $('.sidebar-form').hide();
        $('.user-panel').show();
        $('p#username').html(username);
    });
    
    socket.on('client plane explode', function (id) {
        if(id == myID) {
            $('.sidebar-form').show();
            $('.user-panel').hide();
            delete myID;
        }
    });

    // Disconnect client
    socket.on('client plane delete', function (id) {

    });

    // Ловим событие изменения количества игроков
    $(window).on('planesCountChange', function(event, planesArray) {
        var planesCount = 0;
        var li = '';

        for(var i in planesArray) {
            ++planesCount;
            li = li + '<li><a href="#"><i class="fa fa-users text-aqua"></i> ' + planesArray[i].name + '</a></li>';  
        }

        if(planesCount > 0) {
            $('#clients').find('#list').html(li);
            $('#clients').find('.header').html(planesCount + ' player(s) online');
        } else {
            $('#clients').find('.header').html('Not players');
        }
        $('span.label.label-warning').text(planesCount);
    });
});