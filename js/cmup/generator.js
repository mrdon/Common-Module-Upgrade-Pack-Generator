/**
 * @context atl.general
 */
var conf = require('./confluence');
var $ = require('speakeasy/jquery').jQuery;

function createCommonModuleUpgradePack(start) {

    var end = new Date(start.getTime());
    end.setMonth(start.getMonth() + 1);
    //alert("Between " + start + " and " + end);

    conf.getBlogsInPeriod('DEV', start, end, function(data) {
        var blogs = $.map(data, function(blog) {
                var isCommonModule = false;
                $.each(blog.labels, function(index, label) {
                    if (label.name == "commonmodule") {
                        isCommonModule = true
                    }
                });
                return isCommonModule ? blog : null;
            });
        var modules = $.map(blogs, function(val) {
            var props = extractProperties(["Project", "Version", "Difficulty", "Required", "Summary"], val.content);
            props.id = val.id;
            props.title = val.title;
            props.url = val.url;
            return props.Project ? props : null;
        });

        var form = $("<form/>").attr({
            'method' : "POST",
            id : 'cmup',
            'action' : contextPath + "/pages/createpage.action?spaceKey=DEV&fromPageId=1700136498"
        });
        form.append($('<input/>').attr({
            type : 'hidden',
            name : "title",
            value : 'Common Module Upgrade Pack - ' + start.getFullYear() + "-" + pad(start.getMonth() + 1, 2)
        }));

        var template = require('./report').render({
            "Required" : $.map(modules, function(module) { return module.Required == "Yes" ? module : null;}),
            "Optional" : $.map(modules, function(module) { return module.Required == "No" ? module : null;})
        });
        form.append($('<input/>').attr({
            type : 'hidden',
            name : "wysiwygContent",
            value : template
        }));
        $('body').append(form);
        $('#cmup').submit();
    });
}

function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;
}

function showPackDialog(e) {
    e.preventDefault();
    var dialog = new AJS.Dialog({width:470, height:400, id:'cmup-dialog'});
    dialog.addHeader("Create Common Module Upgrade Pack");
    dialog.addPanel("Details", require('./input').render({}));
    dialog.addButton("Create", function (dialog) {
        var month = $('#cmup-month').val();
        if (parseInt(month) < 1 || parseInt(month) > 12) {
            alert("Month must be between 1 and 12")
        } else {
            var year = $('#cmup-year').val();
            var start = new Date();
            start.setYear(year);
            start.setMonth(parseInt(month) - 1);
            start.setDate(1);
            createCommonModuleUpgradePack(start);
            dialog.remove();
        }
    }, "cmup-submit");
    dialog.addButton("Cancel", function (dialog) {
        dialog.remove();
    }, "cmup-cancel");
    dialog.show();
}

function extractProperties(keys, content) {
    var props = {};
    var page = $('<page>' + content + '</page>');
    page.find('th').each(function(index) {
      var key = $(this).text().trim();

      if ($.inArray(key, keys) > -1) {
        props[key] =  $(this).next().text().trim();
      }
    });
    return props;
}

$(document).ready(function() {
   $('#cmup-create').click(showPackDialog);
});