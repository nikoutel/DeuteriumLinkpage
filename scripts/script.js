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

    $('button#up').click(function () {
        $('input#bg-upload').attr("accept", 'application/json').click();
    });

    // @todo
    $('input#bg-upload').on('change', function () {
        // const objectURL = window.URL.createObjectURL(this.files[0]);
        let file = this.files[0];
        if (file.type.startsWith('image/')) {
            alert('Sorry, upload files not yet supported!');
        } else if (file.type === 'application/json') {
            loadConfigJson(file).then(function () {
                if (!$.isEmptyObject(change)) {
                    $('#up-txt').addClass('changed-txt').text(file.name + ' loaded.');
                    hasChange = true;
                }
            });
        } else {

        }
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

    $("#down").click(function () {
        downloadJSON(localStorage, 'deuterium-config.json', 'application/json');
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

function downloadJSON(content, fileName, contentType) {
    var a = document.createElement("a");
    content = JSON.stringify(content);
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    //   a.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
}

function loadConfigJson(file) {
    let JSONContents = loadJSONFile(file);
    return JSONContents.then(function (contents) {
        let JSONObj = JSON.parse(contents);

        $.each(JSONObj, function (key, value) {
            change[key] = value;
        });
    });
}

async function loadJSONFile(file) {
    return await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (e) => resolve(reader.result);
        reader.readAsText(file);
    });
}