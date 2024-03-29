const imageDirectory = 'img/';
const ls_linkCardPositionsKey = 'linkCardPositions';
const ls_linkCardKey = 'linkCards';
const ls_backgroundImageKey = 'backgroundImage';
const ls_backgroundImageCenteredKey = 'backgroundImageCentered';
const ls_fontColorKey = 'fontColor';
const ls_colorKey = 'color';
const ls_enableSortingKey = 'enableSorting';
const ls_editMode = 'editMode';
const ls_headingText = 'headingText';
const ls_subheadingText = 'subheadingText';
const draggable = '.link-card';
const draggableTmp = '.card';
const defaults = {
    [ls_backgroundImageKey]: 'beautiful-branches.jpg',
    [ls_backgroundImageCenteredKey]: false,
    [ls_fontColorKey]: 'ghostwhite',
    [ls_colorKey]: '#07689F',
    [ls_enableSortingKey]: true,
    [ls_editMode]: false,
    [ls_headingText]: 'Welcome ...',
    [ls_subheadingText]: 'Deuterium Linkpage',
};
let change = {};
let addDemoCard = true;

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
    $('html').on('click', function (e) {
        if (typeof $(e.target).data('original-title') == 'undefined') {
            $('[data-original-title]').popover('dispose');
        }
    });
    init();

    // $("#fab-btn").trigger('click');
    // $("#add-new").trigger('click');
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
    $.get(imageDirectory, function (data) {
        $(data).find("td > a:contains(.jpg), td > a:contains(.jpeg), td > a:contains(.png)").each(function () {
            $('#selectBackgroundImage').append($('<option>', {
                value: $(this).attr("href"),
                text: $(this).attr("href")
            }));
            $("#selectBackgroundImage").val(backgroundImage);
        });

    }).fail(function (data) {
        $('#labelBackgroundImage').addClass('error-txt').text('Deuterium has no access to '+ imageDirectory + ' [' + data.status + ' : ' + data.statusText + ']')
    });

    $('button#buttonAddNewImg').click(function () {
        $('input#inputBackgroundImage').attr("accept", 'image/*').click();
    });

    $('button#buttonConfigFileLoad').click(function () {
        $('input#inputConfigFile').attr("accept", 'application/json').click();
    });

    // @todo
    $('input#inputBackgroundImage').on('change', function () {
        // const objectURL = window.URL.createObjectURL(this.files[0]);
        let file = this.files[0];
        if (file.type.startsWith('image/')) {
            alert('Sorry, image file upload, not yet supported!');
        } else {
            $('button#buttonAddNewImg').popover({
                placement: 'right',
                html: true,
                content: '<span class="popover-error">Wrong image format<span>',
            }).popover('show')
        }
    });

    $('input#inputConfigFile').on('change', function () {
        // const objectURL = window.URL.createObjectURL(this.files[0]);
        let file = this.files[0];
        if (file.type === 'application/json' || (file.type === '' && file.name.split('.')[1] === 'json')) {
            loadConfigJson(file).then(function () {
                if (!$.isEmptyObject(change)) {
                    $('#labelConfigFileLoad').addClass('changed-txt').text(file.name + ' loaded.');
                    hasChange = true;
                }
            });
        } else {
            $('button#buttonConfigFileLoad').popover({
                placement: 'right',
                html: true,
                content: '<span class="popover-error">Wrong file format<span>',
            }).popover('show');
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
            $('#mainModal').modal('hide');
            hasChange = false;
            change = {};
            $(this).popover('dispose')
        } else {
            $(this).popover({
                placement: 'right',
                content: 'Nothing to save',
            }).popover('show')
        }
    });

    $("#buttonConfigFileSave").click(function () {
        downloadJSON($.extend({}, defaults, localStorage), 'deuterium-config.json', 'application/json');
    });

    $('#resetConfig').click(function (e) {
        const msg = "This will reset all configurations!\n\nAre you sure?";
        if (confirm(msg)) {
            del(false);
            reset(true);
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
            reset(true);
            addLinkCards();
            $('#mainModal').modal('hide');
        }
        $(this).dropdown('dispose');
        e.preventDefault();
    });

    $('#inputHeadingText').val(getConfigurableValue(ls_headingText))
        .on('change keyup', function () {
            $('#heading').html($('#inputHeadingText').val());
            hasChange = true;
            change[ls_headingText] = this.value;
            $('#labelHeadingText').addClass('changed-txt').text('Heading text changed');
        });

    $('#inputSubHeadingText').val(getConfigurableValue(ls_subheadingText))
        .on('change keyup', function () {
            $('#subheading').html($('#inputSubHeadingText').val());
            hasChange = true;
            change[ls_subheadingText] = this.value;
            $('#labelSubHeadingText').addClass('changed-txt').text('Subheading text changed');
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
        $("#main > :header, footer a").css({'color': this.value});
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

    $('#centeredSwitch').prop("checked", JSON.parse(getConfigurableValue(ls_backgroundImageCenteredKey)))
        .change(function () {
            console.log('#');
            if ($(this).prop('checked')) {
                $('body').css('background-position', 'center');
            } else {
                $('body').css('background-position', 'initial');
            }
            $('#changedCenteredSwitch').addClass('changed-txt').text('changed');
            hasChange = true;
            change[ls_backgroundImageCenteredKey] = $(this).prop('checked');
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
    if (change[ls_headingText] != null || init) {
        $('#heading').html(getConfigurableValue(ls_headingText));
    }
    if (change[ls_subheadingText] != null || init) {
        $('#subheading').html(getConfigurableValue(ls_subheadingText));
    }
    if (change[ls_fontColorKey] != null || init) {
        $("#main > :header, footer a").css({'color': getConfigurableValue(ls_fontColorKey)});
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
    if (change[ls_backgroundImageCenteredKey] != null || init) {
        let centered = JSON.parse(getConfigurableValue(ls_backgroundImageCenteredKey));
        if (centered === true) {
            $('body').css('background-position', 'center');
        } else {
            $('body').css('background-position', 'initial');
        }
    }
}

function downloadJSON(content, fileName, contentType) {
    let a = document.createElement("a");
    content = JSON.stringify({'deuteriumConfig': content});
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

        if (JSONObj.deuteriumConfig != null) {
            $.each(JSONObj.deuteriumConfig, function (key, value) {
                change[key] = value;
            });
        } else {
            $('button#buttonConfigFileLoad').popover({
                placement: 'right',
                html: true,
                content: '<span class="popover-error">Not recognizable format<span>',
            }).popover('show')
        }
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
    let labelInputTitle = $('#labelInputTitle');
    let labelInputURL = $('#labelInputURL');
    let inputTitle= $('#inputTitle');
    let inputIcon = $('#inputIcon');
    let inputURL = $('#inputURL');
    mainModal.data('bs.modal')._config.backdrop = 'static';
    mainModal.has('#newlinkcard').find('#save-btn').click(function () {

        $(this).popover('dispose');
        labelInputTitle.text('');
        labelInputURL.text('');
        let title = inputTitle.val();
        let icon = inputIcon.val();
        let url = inputURL.val();
        if (title !== '' && icon !== '' && url !== '') {
            if (!(inputURL[0].checkValidity())) {
                labelInputURL.addClass('error-txt').text('Enter a valid URL');
                return true
            }
            if (id == null) {
                newLinkCard(title, icon, url);
            } else {
                updateLinkCard(id, {id: id, name: title, icon: icon, url: url})
            }
            mainModal.modal('hide');
        } else {
            $(this).popover({
                placement: 'right',
                content: 'There are empty inputs',
            }).popover('show');
            if (title === '') {
                labelInputTitle.addClass('error-txt').text('Title cannot be empty');
            }
            if (url === '') {
                labelInputURL.addClass('error-txt').text('URL cannot be empty');
            }
        }
    });

    mainModal.has('#newlinkcard').on('hidden.bs.modal', function (e) {
        $('#save-btn').off('click');
        mainModal.modal('dispose')
    });

    $('.icp-dropdown').iconpicker({
        hideOnSelect: true,
        templates: {
            search: '<input type="search" class="form-control iconpicker-search" placeholder="Search icon..." />',
        }
    });
    $('.icp').on('iconpickerSelected', function (e) {
        $('#inputIcon-icon .picker-target').get(0).className = 'picker-target fa-2x ' +
            e.iconpickerInstance.options.iconBaseClass + ' ' +
            e.iconpickerInstance.options.fullClassFormatter(e.iconpickerValue);
        $('#inputIcon').val(e.iconpickerInstance.options.fullClassFormatter(e.iconpickerValue));
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
    if (addDemoCard) {
        addDemoCardF(list);
    }
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
    if (linkCardList != null) {
        linkCardList.push(newCard);
    } else {
        linkCardList = [newCard]
    }
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

function addDemoCardF(linkCardList) {
    if (linkCardList == null) {
        newLinkCard('deuterium', 'delta', 'https://github.com/nikoutel/DeuteriumLinkpage');
    }
}

let getCount = (function () {
    let i = 1;
    return function () {
        return i++;
    }
})();