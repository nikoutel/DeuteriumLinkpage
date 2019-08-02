const imageDirectory = 'img/';
const backgroundImageDefault = imageDirectory + 'beautiful-branches.jpg';

$(document).ready(function () {
    $('body').on('click', '[data-toggle="modal"]', function(){
        $($(this).data("target")+' .modal-title').text($(this).data("title"));
        $($(this).data("target")+' .modal-body').load($(this).data("remote"));
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