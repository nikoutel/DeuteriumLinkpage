const imageDirectory = 'img/';
const backgroundImageDefault = imageDirectory + 'beautiful-branches.jpg';
const ls_linkCardPositionsKey = 'linkCardPositions';
const ls_linkCardKey = 'linkCards';
const ls_backgroundImageKey = 'backgroundImage';
let change = {};
const draggable = '.link-card';
const draggableTmp = '.card';

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
        draggable: draggable,
        delay: 200,
        delayOnTouchOnly: true,
        supportPointer: false,
        onMove: function (evt) {
            console.log(evt);
            console.log(evt.related.classList);
            console.log($(evt.originalEvent.target));
            if (evt.related) {
                if (evt.related.classList.contains('grid-lock')) return false;
                if (evt.related.classList.contains('lock')) return false;
                if ($(evt.originalEvent.target).hasClass("grid-lock")) return false;
            }
        },
        onStart: function () {
            $('.card-href').removeClass('stretched-link');
        },
        onUnchoose: function () {
            $('.card-href').addClass('stretched-link');
        },
        group: ls_linkCardPositionsKey,
        store: {
            get: function (sortable) {
                sortable.options.draggable = draggableTmp;
                let order = load(sortable.options.group.name);
                return order ? JSON.parse(order) : [];
            },
            set: function (sortable) {
                sortable.options.draggable = draggableTmp;
                let order = sortable.toArray();
                save({[sortable.options.group.name]: JSON.stringify(order)});
            }
        }
    }).sortable('widget').options.draggable = draggable;
});

function getBackgroundImage() {
    let backgroundImage;
    let backgroundImageStored = load(ls_backgroundImageKey);

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
            $('#selectBackgroundImage').append($('<option>', {
                value: $(this).attr("href"),
                text: $(this).attr("href")
            }));
            $("#selectBackgroundImage").val(backgroundImage);
        });

    });

    $('button#buttonAddNewImg').click(function () {
        $('input#inputBackgroundImage').attr("accept", 'image/*').click();
    });

    $('button#buttonConfigFileLoad').click(function () {
        $('input#inputBackgroundImage').attr("accept", 'application/json').click();
    });

    // @todo
    $('input#inputBackgroundImage').on('change', function () {
        // const objectURL = window.URL.createObjectURL(this.files[0]);
        let file = this.files[0];
        if (file.type.startsWith('image/')) {
            alert('Sorry, upload files not yet supported!');
        } else if (file.type === 'application/json') {
            loadConfigJson(file).then(function () {
                if (!$.isEmptyObject(change)) {
                    $('#labelConfigFileLoad').addClass('changed-txt').text(file.name + ' loaded.');
                    hasChange = true;
                }
            });
        } else {

        }
    });

    $('#selectBackgroundImage').on('change', function () {
        $('body').css('background-image', 'url(' + imageDirectory + this.value + ')');
        $('#selectBackgroundImage').addClass('changed');
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
            save(change);
            if (change[ls_linkCardKey] != null) {
                addLinkCards();
            }
            if (change[ls_linkCardPositionsKey] != null) {
                reorderLinkCards(change[ls_linkCardPositionsKey]);
            }
            hasChange = false;
            change = {};
            $('#mainModal').modal('hide');
        }
    });

    $("#down").click(function () {
        downloadJSON(localStorage, 'deuterium-config.json', 'application/json');
    });

    $('#resetConfig').click(function (e) {
        let msg = "This will reset all configurations!\n\nAre you sure?";
        if (confirm(msg)) {
            del(false);
            reset();
            $('#mainModal').modal('hide');
        }
        $(this).dropdown('dispose');
        e.preventDefault();
    });

    $('#resetAll').click(function (e) {
        let msg = "This will reset all configurations\n" +
            "and the link cards!\n\nAre you sure?";
        if (confirm(msg)) {
            del(true);
            reset();
            addLinkCards();
            $('#mainModal').modal('hide');
        }
        $(this).dropdown('dispose');
        e.preventDefault();
    });
}

function save(obj) {
    if (typeof localStorage !== "undefined") {
        $.each(obj, function (key, value) {
            localStorage.setItem(key, value);
        });
    }
}

function load(key) {
    if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
    }
}

function del(all) {
    if (typeof localStorage !== "undefined") {
        if (all) {
            localStorage.clear();
        } else {
            for (let i = 0; i <= localStorage.length - 1; i++) {
                let key = localStorage.key(i);
                if (key !== ls_linkCardKey && key !== ls_linkCardPositionsKey) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
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
    return JSON.parse(load([ls_linkCardKey]));
}

function setLinkCardList(linkCardList) {
    save({[ls_linkCardKey]: JSON.stringify(linkCardList)});
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
    cardClone.find('.card-href').attr("href", url);
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
    let positionsJson = load(ls_linkCardPositionsKey);
    if (positionsJson != null) {
        let positions = JSON.parse(positionsJson);
        positions.splice(positions.length - 4, 0, id);
        save({[ls_linkCardPositionsKey]: JSON.stringify(positions)});
    }
}

function reorderLinkCards(linkCardPositions) {
    let position = JSON.parse(linkCardPositions);
    let sortable = $('#link-card-grid').sortable('widget');
    sortable.options.draggable = draggableTmp;
    sortable.sort(position);
    sortable.options.draggable = draggable;
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