const imageDirectory = 'img/';
const backgroundImageDefault = imageDirectory + 'beautiful-branches.jpg';
let change = {};

$(document).ready(function () {

    let body = $('body');
    body.css('background-image', 'url(' + getBackgroundImage() + ')');

    addLinkCards();

    body.on('click', '[data-toggle="modal"]', function () {
        let action = $(this).data("action");
        $($(this).data("target") + ' .modal-title').text($(this).data("title"));
        $($(this).data("target") + ' .modal-body').load($(this).data("remote"), function () {
            window[action]();
        });
    });

    $('#link-card-grid').sortable({
        animation: 150,
        filter: ".hidden, .lock",
        draggable: '.link-card',
        onMove:function (evt) {
            if (evt.related)
            {
                if (evt.related.classList.contains('grid-lock')) return false;
                if ($(evt.originalEvent.target).hasClass( "grid-lock" )) return false;
            }
        },
        group: "linkCardPositions",
        store: {
            get: function (sortable) {
                sortable.options.draggable = '.card';
                let order = localStorage.getItem(sortable.options.group.name);
                return order ? JSON.parse(order) : [];
            },
            set: function (sortable) {
                sortable.options.draggable = '.card';
                let order = sortable.toArray();
                localStorage.setItem(sortable.options.group.name, JSON.stringify(order));
                sortable.options.draggable = '.link-card';
            }
        }
    });
    $('#link-card-grid').sortable('widget').options.draggable='.link-card';
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
    let mainModal = $('#mainModal');
    mainModal.has('#configuration').on('hidden.bs.modal', function (e) {
        reset();
        $('#save-btn').off('click');
    });

    mainModal.has('#configuration').find('#save-btn').click(function () {
        if (hasChange) {
            saveConfig(change);
            if (change.linkCards !== null) {
                addLinkCards();
            }
            hasChange = false;
            change = {};
            $('#mainModal').modal('hide');
        }
    });

    $("#down").click(function () {
        downloadJSON(localStorage, 'deuterium-config.json', 'application/json');
    });

}

function saveConfig(configObj) {
    $.each(configObj, function (key, value) {
        localStorage.setItem(key, value);
    });
}

function reset() {
    $('body').css('background-image', 'url(' + getBackgroundImage() + ')');
}

function downloadJSON(content, fileName, contentType) {
    let a = document.createElement("a");
    content = JSON.stringify(content);
    let file = new Blob([content], {type: contentType});
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

function LinkCard() {
    let mainModal = $('#mainModal');
    mainModal.has('#newlinkcard').find('#save-btn').click(function () {
        let tile = $('#inputTitle').val();
        let icon = $('#inputIcon').val();
        let url = $('#inputURL').val();
        if (tile !== '' && icon !== '' && url !== '') {
            newLinkCard(tile, icon, url);
            $('#mainModal').modal('hide')
        }
    });

    mainModal.has('#newlinkcard').on('hidden.bs.modal', function (e) {
        $('#save-btn').off('click');
    });
}

function getLinkCardList() {
    return JSON.parse(localStorage.getItem('linkCards'));
}

function setLinkCardList(linkCardList) {
    localStorage.setItem('linkCards', JSON.stringify(linkCardList));
}

function addLinkCards() {
    $('.link-card').not(':first').remove();
    let list = getLinkCardList();
    $.each(list, function (key, value) {
        cloneLinkCard(value.name, value.icon, value.url, value.id);
    });
}

function cloneLinkCard(name, iconClass, url, id) {
    let count = getCount();
    if (id == null) {
        id = 'card' + (name).replace(/[^A-Za-z0-9]/g, '') + count;
    }
    let cardClone = $('#clone-me').clone();
    cardClone.attr('id', id);
    cardClone.attr('data-id', id);
    cardClone.find('h6').text(name);
    cardClone.find('.icon').removeClass().addClass("icon fa-2x " + iconClass);
    cardClone.insertAfter($('.link-card').last()).show();
    return id;
}

function newLinkCard(name, iconClass, url) {
    let id = cloneLinkCard(name, iconClass, url);
    saveLinkCard(name, iconClass, url, id);
    addToLinkCardPosition(id);
}

function addToLinkCardPosition(id) {
    let positionsJson = localStorage.getItem('linkCardPositions');
    let positions = JSON.parse(positionsJson);
    positions.splice(positions.length - 4 , 0 ,id);
    console.log(positions);
    localStorage.setItem('linkCardPositions', JSON.stringify(positions));
}

function saveLinkCard(name, iconClass, url, id) {
    let linkCardList = getLinkCardList();
    let newCard = {};
    newCard.id = id;
    newCard.name = name;
    newCard.icon = iconClass;
    newCard.url = url;
    linkCardList.push(newCard);
    setLinkCardList(linkCardList);
}

function removeLinkCard(id) {
    let linkCardList = getLinkCardList();
    linkCardList = linkCardList.filter(elememt => elememt.id !== id);
    setLinkCardList(linkCardList);
}

let getCount = (function () {
    let i = 1;
    return function () {
        return i++;
    }
})();