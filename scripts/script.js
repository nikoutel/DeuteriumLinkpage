const imageDirectory = 'img/';
const backgroundImageDefault = imageDirectory + 'beautiful-branches.jpg';

$(document).ready(function () {

    $('body').css('background-image', 'url(' + getBackgroundImage() + ')');

    $('body').on('click', '[data-toggle="modal"]', function () {
        let title = $(this).data("title");
        $($(this).data("target") + ' .modal-title').text($(this).data("title"));
        $($(this).data("target") + ' .modal-body').load($(this).data("remote"), function () {
            window[title]();
        });
    });
});

function getBackgroundImage() {
    let backgroundImage;
    let backgroundImageStored = localStorage.getItem('backgroundImage');

    if (backgroundImageStored == null) {
        backgroundImage = backgroundImageDefault;
    } else {
        backgroundImage = imageDirectory + backgroundImageStored;
    }
    return backgroundImage;
}

function Configuration() {

    $("#mainModal").data('bs.modal')._config.backdrop = 'static';

}
