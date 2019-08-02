const imageDirectory = 'img/';
const backgroundImageDefault = imageDirectory + 'beautiful-branches.jpg';
let change = {};

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

    let hasChange = false;
    let backgroundImageURL = $('body').css('backgroundImage');
    let backgroundImage = backgroundImageURL.slice(backgroundImageURL.lastIndexOf('/') + 1, backgroundImageURL.length - 2);

    $("#mainModal").data('bs.modal')._config.backdrop = 'static';

    //@todo if directory listing, no  403; prepare for server side script
    $.get(imageDirectory, function (data) {
        $(data).find("td > a:contains(.jpg), td > a:contains(.jpeg), td > a:contains(.png)").each(function () {
            $('#bg-img-s').append($('<option>', {
                value: $(this).attr("href"),
                text: $(this).attr("href")
            }));
            $("#bg-img-s").val(backgroundImage);
        });

    });

    $('button#bg-img-btn').click(function () {
        $('input#bg-upload').attr("accept", 'image/*').click();
    });



    $('#bg-img-s').on('change', function () {
        $('body').css('background-image', 'url(' + imageDirectory + this.value + ')');
        $('#bg-img-s').addClass('changed');
        hasChange = true;
        change.backgroundImage = this.value;
    });

    $('#mainModal').has('#configuration').on('hidden.bs.modal', function (e) {
        reset();
    });

    $('#mainModal').has('#configuration').find('#save-btn').click(function () {
        if (hasChange) {
            saveConfig(change);
            hasChange = false;
            change = {};
            $('#mainModal').modal('hide')
        }
    });


}

function saveConfig(change) {
    $.each(change, function (key, value) {
        localStorage.setItem(key, value);
    });
}

function reset() {
    $('body').css('background-image', 'url(' + getBackgroundImage() + ')');
}