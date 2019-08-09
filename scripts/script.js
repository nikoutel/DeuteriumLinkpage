const imageDirectory = 'img/';
const ls_linkCardPositionsKey = 'linkCardPositions';
const ls_linkCardKey = 'linkCards';
const ls_backgroundImageKey = 'backgroundImage';
const ls_fontColorKey = 'fontColor';
const ls_colorKey = 'color';
const ls_enableSortingKey = 'enableSorting';
const ls_editMode = 'editMode';
const draggable = '.link-card';
const draggableTmp = '.card';
const defaults = {
    [ls_backgroundImageKey]: 'beautiful-branches.jpg',
    [ls_fontColorKey]: 'ghostwhite',
    [ls_colorKey]: '#07689F',
    [ls_enableSortingKey]: true,
    [ls_editMode]: false,
};
let change = {};


$(document).ready(function () {

    addLinkCards();

    $('body').on('click', '[data-toggle="modal"]', function () {
        let action = $(this).data("action");
        $($(this).data("target") + ' .modal-title').text($(this).data("title"));
        $($(this).data("target") + ' .modal-body').load($(this).data("remote"), function () {
            window[action]();
        });
    });
    $('.deleteCard').click(function () {

        const id = $(this).closest('.link-card').attr('id');
        const title = $('#' + id).find('h6').text();
        const msg = "Delete " + title + '?';
        if (confirm(msg)) {
            removeLinkCard(id);
            addLinkCards();
            reorderLinkCards(load(ls_linkCardPositionsKey));
        }
    });
    $('.editCard').click(function () {
        const id = $(this).closest('.link-card').attr('id');
        const title = $('#' + id).find('h6').text();
        let cardList = getLinkCardList();
        let cardData = cardList.find(card => card.id === id);

        $('#mainModal').modal('show');
        $('#mainModal .modal-title').text('Edit ' + title);
        $('#mainModal .modal-body').load($('#add-new').data("remote"), function () {
            $('#newlinkcard #inputTitle').val(cardData.name);
            $('#newlinkcard #inputIcon').val(cardData.icon);
            $('#newlinkcard #inputURL').val(cardData.url);
            window[$('#add-new').data("action")](id);
        });


    });
    $('#link-card-grid').sortable({
        animation: 150,
        draggable: draggable,
        delay: 200,
        delayOnTouchOnly: true,
        supportPointer: false,
        onMove: function (evt) {
            if (evt.related) {
                if (evt.related.classList.contains('grid-lock')) return false;
                if (evt.related.classList.contains('lock')) return false;
                if ($(evt.originalEvent.target).hasClass("grid-lock")) return false;
            }
        },
        onStart: function () {
            $('.has-stretched-link').removeClass('stretched-link');
        },
        onUnchoose: function () {
            $('.has-stretched-link').addClass('stretched-link');
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
    init();
});

function init() {
    const init = true;
    reset(init);
}

function getConfigurableValue(key) {
    let value;
    let storedValue = load(key);
    if (storedValue == null) {
        value = defaults[key];
    } else {
        value = storedValue;
    }
    return value;
}

function Configuration() {

    let hasChange = false;

    const backgroundImage = getConfigurableValue(ls_backgroundImageKey);


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
        $('#labelBackgroundImage').addClass('changed-txt').text('Background image changed');
        hasChange = true;
        change[ls_backgroundImageKey] = this.value;
    });
    let mainModal = $('#mainModal');
    mainModal.has('#configuration').on('hidden.bs.modal', function (e) {
        if (hasChange) {
            reset();
        }
        $('#save-btn').off('click');
        $(this).find("*").off();
        mainModal.modal('dispose')
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
        const msg = "This will reset all configurations!\n\nAre you sure?";
        if (confirm(msg)) {
            del(false);
            reset();
            $('#mainModal').modal('hide');
        }
        $(this).dropdown('dispose');
        e.preventDefault();
    });

    $('#resetAll').click(function (e) {
        const msg = "This will reset all configurations\n" +
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

    const color = getConfigurableValue(ls_colorKey);
    $('#colorBlue, #colorRed, #colorGreen').removeClass('active');
    if (color === '#07689F') {
        $("input[name='color'][value='#07689F']").prop("checked", true);
        $('#colorBlue').addClass('active');

    } else if (color === '#92060c') {
        $("input[name='color'][value='#92060c']").prop("checked", true);
        $('#colorRed').addClass('active');

    } else if (color === '#086e3f') {
        $("input[name='color'][value='#086e3f']").prop("checked", true);
        $('#colorGreen').addClass('active');
    }

    $('input[name="color"]').change(function () {
        $(".fab-btn").css({'background-color': this.value});
        $(".card").css({'border-bottom-color': this.value}).css({'color': this.value});
        $('#labelColor').addClass('changed-txt').text('Color changed');
        hasChange = true;
        change[ls_colorKey] = this.value;
    });


    const fontColor = getConfigurableValue(ls_fontColorKey);
    if (fontColor === 'white') {
        $("input[name='fontcolor'][value='white']").prop("checked", true);
        $('#fontWhite').addClass('active');
        $('#fontBlack').removeClass('active');
    } else if (fontColor === 'black') {
        $("input[name='fontcolor'][value='black']").prop("checked", true);
        $('#fontWhite').removeClass('active');
        $('#fontBlack').addClass('active');
    }

    $('input[name="fontcolor"]').change(function () {
        $("#main > :header").css({'color': this.value});
        $('#labelFontColor').addClass('changed-txt').text('Font color changed');
        hasChange = true;
        change[ls_fontColorKey] = this.value;
    });


    $('#enableSortingSwitch').prop("checked", JSON.parse(getConfigurableValue(ls_enableSortingKey)))
        .change(function () {
            $('#link-card-grid').sortable('disabled', !$(this).prop('checked'));
            $('#changedTxtSorting').addClass('changed-txt').text('changed');
            hasChange = true;
            change[ls_enableSortingKey] = $(this).prop('checked');
        });

    $('#enableEditSwitch').prop("checked", JSON.parse(getConfigurableValue(ls_editMode)))
        .change(function () {
            editMode($(this).prop('checked'));
            $('#changedTxtEdit').addClass('changed-txt').text('changed');
            hasChange = true;
            change[ls_editMode] = $(this).prop('checked');
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
            $.each(defaults, function (key, value) {
                localStorage.removeItem(key);
            });
        }
    }
}

function reset(init) {
    if (change[ls_backgroundImageKey] != null || init) {
        $('body').css('background-image', 'url(' + imageDirectory + getConfigurableValue(ls_backgroundImageKey) + ')');
    }
    if (change[ls_fontColorKey] != null || init) {
        $("#main > :header").css({'color': getConfigurableValue(ls_fontColorKey)});
    }
    if (change[ls_colorKey] != null || init) {
        $(".fab-btn").css({'background-color': getConfigurableValue(ls_colorKey)});
        $(".card").css({'border-bottom-color': getConfigurableValue(ls_colorKey)})
            .css({'color': getConfigurableValue(ls_colorKey)});
    }
    if (change[ls_enableSortingKey] != null || init) {
        $('#link-card-grid').sortable('disabled', !JSON.parse(getConfigurableValue(ls_enableSortingKey)));
    }
    if (change[ls_editMode] != null || init) {
        editMode(JSON.parse(getConfigurableValue(ls_editMode)));
    }
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

function LinkCard(id) {
    let mainModal = $('#mainModal');
    mainModal.has('#newlinkcard').find('#save-btn').click(function () {
        let title = $('#inputTitle').val();
        let icon = $('#inputIcon').val();
        let url = $('#inputURL').val();
        if (title !== '' && icon !== '' && url !== '') {
            if (id == null) {
                newLinkCard(title, icon, url);
            } else {
                updateLinkCard(id, {id: id, name: title, icon: icon, url: url})
            }
            $('#mainModal').modal('hide')
        }
    });

    mainModal.has('#newlinkcard').on('hidden.bs.modal', function (e) {
        $('#save-btn').off('click');
        mainModal.modal('dispose')
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
    let cardClone = $('#clone-me').clone(true);
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

function updateLinkCard(id, cardData) {
    let cardList = getLinkCardList();
    let obj = cardList.find((o, i) => {
        if (o.id === id) {
            cardList[i] = cardData;
            return true;
        }
    });
    setLinkCardList(cardList);
    addLinkCards();
    reorderLinkCards(load(ls_linkCardPositionsKey))
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

function editMode(enabled) {
    if (enabled) {
        $('.editCardMode').css('display', 'block');
        $('.link-card').removeClass('pt-3').css('height', '178px').find('a').removeClass('has-stretched-link stretched-link');
    } else {
        $('.editCardMode').css('display', 'none');
        $('.link-card').addClass('pt-3').css('height', '150px').find('a').addClass('has-stretched-link stretched-link');
    }
}

let getCount = (function () {
    let i = 1;
    return function () {
        return i++;
    }
})();