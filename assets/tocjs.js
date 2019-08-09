function addIDs(match, hLvl, hTags, hContent, offset, string) {
    // Strip the whitespaces to prevent error where obviously the hContentClean is returned with none
    hContentClean = hContent.replace(/<[\s\S]*?>/g, '');
    if ( ! hTags.match('id=') ) {
        hTags += ' id="' + normalizeString(hContentClean) + '"';
    }
    return '<h' + hLvl + hTags + '>' + hContent + '</h' + hLvl + '>';
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
        finTOC += ('<' + listElement + '>').repeat(diff);
    }
    if (diff < 0) {
        // the current list needs to be closed
        finTOC += ('</' + listElement + '>').repeat(Math.abs(diff));
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
        // var tocCount = 0;
        var docWithIDs = input.replace(/<h([1-6])([\s\S]*?)>([\s\S]*?)(<br\/?>)?<\/h[1-6]>/g, addIDs);
        var headings = docWithIDs.match(/<h[1-6][\s\S]*?<\/h[1-6]>/g);
        var headLvl = 0;
        var finTOC = "";
        var listType = $("input[type=radio][name=list-type]:checked").val();
        for (i = 0; i < headings.length; i++ ) {
            headings[i] = headings[i].replace(/[\r\n]*/g, '');
            var hID = headings[i].match(/id="(.*?)"/)
            var hLvl = headings[i].match(/<h([1-6])/)
            var hContent = headings[i].match(/<h[1-6].*?">([\s\S]*?)<\/h[1-6]>/);
            var anchorPrepend = $('input[type=text][name=anchor-prepend]').val();
            hContent[1] = hContent[1].replace(/<[\s\S]*?>/g, '');
            finTOC = openCloseList(finTOC, hLvl[1], headLvl, listType);
            finTOC += '<li><a href="'+ anchorPrepend + '#' + hID[1] + '">' + hContent[1] + '</a></li>';
            headLvl = hLvl[1];
        }
    }
    catch(err) {
        alert('The script failed to complete with the following error:\n\n' + err + '\n\nThe error stack:\n' + err.stack);
        console.log('The script failed to complete with the following error:\n\n' + err + '\n\nThe error stack:\n' + err.stack);
    }
    finTOC = prettifyHTML(finTOC);
    $('#output-html').html(finTOC);
    $('#output-src').val(finTOC);
    $('#output-doc-src').val(finTOC + '\n' + prettifyHTML(docWithIDs))
}

// Docs
// zobacky musi byt &lt; a &gt; (min. v nadpisech), jinak se to rozbije 
// validni html je podminkou, aspon v nadpisech
// vic nez sest urovni nadpisu nepodporujeme :)
// existujici ID se zachovava, klasy a ostatni sracky v h-tags se taky zachovaji, 
// viceradkovy obsah hacek se taky zachovava
// dva nadpisy nesmi mit stejny obsah, jinak jejich anchor bude skakat na prvni vyskyt
