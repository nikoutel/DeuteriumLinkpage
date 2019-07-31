$(document).ready(function () {
    $('body').on('click', '[data-toggle="modal"]', function(){
        $($(this).data("target")+' .modal-title').text($(this).data("title"));
        $($(this).data("target")+' .modal-body').load($(this).data("remote"));
    });
});