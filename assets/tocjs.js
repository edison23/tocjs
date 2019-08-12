function addIDs(match, curHeadLvl, hTags, hContent, offset, string) {
    // checkbox whether to overwrite existing heading IDs - returns either false (if don't overwrite) or true (if overwrite)
    var overWriteExistingIDs = $("input[type=checkbox][name=h-overwrite]").is(':checked');
    
    // Strip the whitespaces to prevent error where obviously the hContentClean is returned with none
    hContentClean = hContent.replace(/<[\s\S]*?>/g, '');

    // if the ID is not in the heading or we're instructed to overwrite it, delete the potentially existing ID and add a newly generated one
    if ( ! hTags.match('id=') || overWriteExistingIDs == true ) {
        hTags = hTags.replace(/id=".*?"/g, '');
        hTags += ' id="' + normalizeString(hContentClean) + '"';
    }

    return '<h' + curHeadLvl + hTags + '>' + hContent + '</h' + curHeadLvl + '>';
}

function normalizeString(str) {
    // var normalized = str.replace(/[^\w]/g, "-");
    var normalized = str.replace(/[\;\ \/\?\:\@\&\=\+\$\,\{\}\\\^\[\]\`\%\&\#\!\)\()]/g, "-");
    normalized = normalized.toLowerCase();
    return normalized;
}

// finTOC: the variable which is to be writtent to; curLvl: heading level we've just reached; prevLvl: heading level we've been at with the last heading; listType: sorted or unsorted
// logic: if curLvl is higher than prevLvl, a new list needs to be opened; if lower, than the current list needs to be closed;
function openCloseList(finTOC, curLvl, prevLvl, listElement) {
    // cur-prev = + --> new nested list needed
    // cur-prev = - --> close current list
    // cur-prev = 0 --> no action needed
    diff = curLvl - prevLvl;
    if (diff > 0) {
        // a new list needs to be opened
        finTOC += ('<' + listElement + '></li>').repeat(diff);
    }
    if (diff < 0) {
        // the current list needs to be closed
        finTOC += ('</' + listElement + '></li>').repeat(Math.abs(diff));
    }
    return finTOC;
}

// This function was taken from https://codepen.io/davidkacha/pen/zzNBxq 
// It not only prettifies the HTML (in terms of the indentation), but also
// closes the tags at the end of the DOM so we don't need to do it ourselves.
function prettifyHTML(html) {
    function parse(html, tab = 0) {
        var tab;
        var html = $.parseHTML(html);
        var formatHtml = new String();   

        function setTabs () {
            var tabs = new String();

            for (i=0; i < tab; i++){
              tabs += '    ';
            }
            return tabs;    
        };


        $.each( html, function( i, el ) {
            if (el.nodeName == '#text') {
                if (($(el).text().trim()).length) {
                    formatHtml += setTabs() + $(el).text().trim() + '\n';
                }    
            } else {
                // this condition was an attempt to exclude the contents of <pre> tags from processing but it turns out the innerHTML of the tag 
                // is already stripped from the newlines and whitespace.. and I don't really know what to do about it so I'll temporarily
                // just disable the whole prettifying function and won't process the document with it at all (except for the new TOC)
                if (el.nodeName != 'PRE') {
                    var innerHTML = $(el).html().trim();
                    $(el).html(innerHTML.replace('\n', '').replace(/ +(?= )/g, ''));
                    

                    if ($(el).children().length) {
                        $(el).html('\n' + parse(innerHTML, (tab + 1)) + setTabs());
                        var outerHTML = $(el).prop('outerHTML').trim();
                        formatHtml += setTabs() + outerHTML + '\n'; 

                    } else {
                        var outerHTML = $(el).prop('outerHTML').trim();
                        formatHtml += setTabs() + outerHTML + '\n';
                    } 
                }  
                else {
                    var innerHTML = el.innerHTML;
                    // var outerHTML = $(el).prop('outerHTML');
                    formatHtml += innerHTML + '\n';
                }
            }
        });

        return formatHtml;
    };   
    
    return parse(html.replace(/(\r\n|\n|\r)/gm," ").replace(/ +(?= )/g,''));
}; 

function createTOC() {
    try {
        if ( !$('#input').val() ) {
            $('#output-html').html('<p class="warning">Please insert your document into the input text area first.');
            return null;
        }
        var input = $("#input").val();
        var anchorPrepend = $('input[type=text][name=anchor-prepend]').val();
        var docWithIDs = input.replace(/<h([1-6])([\s\S]*?)>([\s\S]*?)(<br\/?>)?<\/h[1-6]>/g, addIDs);
        var headings = docWithIDs.match(/<h[1-6][\s\S]*?<\/h[1-6]>/g);
        var prevHeadLvl = 0;
        // Optional heading a user can desire for the TOC
        var tocHeading = "";
        if ($("#toc-heading").val()) {
            tocHeading = "<h1>" + $("#toc-heading").val() + "</h1>";
        }
        var finTOC = tocHeading;
        // gets the value of the select radio button to choose list type (returns 'ol' or 'ul')
        var listType = $("input[type=radio][name=list-type]:checked").val();
        for (i = 0; i < headings.length; i++ ) {
            headings[i] = headings[i].replace(/[\r\n]*/g, '');
            var hID = headings[i].match(/id="(.*?)"/)
            var endListItem = '';
            var curHeadLvl = headings[i].match(/<h([1-6])/)
            var hContent = headings[i].match(/<h[1-6].*?">([\s\S]*?)<\/h[1-6]>/);
            hContent[1] = hContent[1].replace(/<[\s\S]*?>/g, '');
            finTOC = openCloseList(finTOC, curHeadLvl[1], prevHeadLvl, listType);
            // this ensures no <li> item is closed when there are child lists to be closed; in case sublists 
            // are to be closed, closing the <li> item is handled in openCloseList, in case of new sublists, 
            // the <li> item doesn't get closed until the child list is closed too (all child lists must be 
            // childern of the parent <li> item)
            if (curHeadLvl == prevHeadLvl) {
                endListItem = '</li>'
            }
            finTOC += endListItem + '<li><a href="'+ anchorPrepend + '#' + hID[1] + '">' + hContent[1] + '</a>';
            prevHeadLvl = curHeadLvl[1];
        }
    }
    catch(err) {
        alert('The script failed to complete with the following error:\n\n' + err + '\n\nThe error stack:\n' + err.stack);
        console.log('The script failed to complete with the following error:\n\n' + err + '\n\nThe error stack:\n' + err.stack);
    }

    var YYYYmmDD = new Date();
    var today = YYYYmmDD.getFullYear() + '/' + (YYYYmmDD.getMonth()+1) + '/' + YYYYmmDD.getDate()
    var commentAroundTOCstart = '<!-- ======= START OF TOC GENERATED ON '+ today + ' ======= -->'
    var commentAroundTOCend = '<!-- ======= END OF TOC GENERATED ON '+ today + ' ======= -->'

    finTOC = prettifyHTML(finTOC);
    $('#output-html').html(finTOC);
    $('#output-src').val(finTOC);
    // disabled the prettifier here because it was screwing up the <pre> tags (details in the function definition above)
    // $('#output-doc-src').val(finTOC + '\n' + prettifyHTML(docWithIDs));

    $('#output-doc-src').val(commentAroundTOCstart + '\n\n' + finTOC + '\n' + commentAroundTOCend + '\n\n' + docWithIDs);
}

// Docs
// zobacky musi byt &lt; a &gt; (min. v nadpisech), jinak se to rozbije 
// validni html je podminkou, aspon v nadpisech
// vic nez sest urovni nadpisu nepodporujeme :)
// existujici ID se zachovava, klasy a ostatni sracky v h-tags se taky zachovaji, 
// viceradkovy obsah hacek se taky zachovava
// dva nadpisy nesmi mit stejny obsah, jinak jejich anchor bude skakat na prvni vyskyt
