// Connect client
socket.on('connect', function () {
    $('#submit').on('click', function(){
        username = $('input#username').val();
        socket.emit('auth', username);
    });

    // Auth client
    socket.on('auth', function (id) {
        myID = id;

        $('.sidebar-form').hide();
        $('.user-panel').show();
        $('p#username').html(username);
    });

    // Disconnect client
    socket.on('delPlane', function (id) {

    });

    $(window).on('planesCountChange', function(id, plane){
        var planesCount = 0;
        var li = '';
        console.log(id);

        for(var i in plane) {
            ++planesCount;
            li = li + '<li><a href="#"><i class="fa fa-users text-aqua"></i> ' + plane[i].name + '</a></li>';  
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