$(function () {
    new Mine({
        el: '#content',
        cols: 5,
        rows: 5,
        mines: 5
    });
    $('#model-select').bind('change', function () {
        create();
    });
    $('#reset').click(() => {
        create();
    });
});

function create() {
    var model = +$('#model-select').val();
    model !== 0 && $('#custom').hide(300);
    switch (model) {
        case 0:
            $('#custom').show(300);
            break;
        case 1:
            new Mine({
                el: '#content',
                cols: 5,
                rows: 5,
                mines: 5
            });
            break;
        case 2:
            new Mine({
                el: '#content'
            });
            break;
        case 3:
            new Mine({
                el: '#content',
                cols: 15,
                rows: 15,
                mines: 50
            });
            break;
        default:
            $(this)[0][0].selected = true;
    }
}