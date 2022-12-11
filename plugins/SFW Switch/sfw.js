/*
//https://stackoverflow.com/a/56825511
const addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML=css;
const BUTTON_CSS = `
#plugin_sfw{
    background: none;
    color: #f5f8fa;
    transition: none;
    border: none;
    margin: 0;
    padding: .375rem .75rem;
    border-radius: .25rem;
    max-height: 35px;
    max-width: 35px;
}
#plugin_sfw:hover{
    background: rgba(138,155,168,.15);
    border-radius: .25rem;
}
`;
*/

function create_sfwswitch_button() {
    if (!document.getElementById("plugin_sfw")) {
        var plugin_div = document.createElement('a');
        plugin_div.className = "mr-2";
        plugin_div.innerHTML = '<button id="plugin_sfw" type="button" class="minimal d-flex align-items-center h-100 btn btn-primary" title="Turn SFW Mode"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="svg-inline--fa fa-cog fa-w-16 fa-icon undefined" viewBox="1.5 1.5 13 13">  <path d="m7.646 9.354-3.792 3.792a.5.5 0 0 0 .353.854h7.586a.5.5 0 0 0 .354-.854L8.354 9.354a.5.5 0 0 0-.708 0z"></path><path d="M11.414 11H14.5a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h3.086l-1 1H1.5A1.5 1.5 0 0 1 0 10.5v-7A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v7a1.5 1.5 0 0 1-1.5 1.5h-2.086l-1-1z"></path></svg></button>';
        waitForElementClass("navbar-buttons", function () { //#CSS
            var main_Div = document.getElementsByClassName("navbar-buttons")[0]; //#CSS
            main_Div.insertBefore(plugin_div, main_Div.childNodes[0]);
            document.getElementById("plugin_sfw").addEventListener("click", sfw_mode, false);
            sfw_mode();
        });
    }
}

function sfw_switch() {
    var stash_css = find_stashcss();
    if (stash_css.disabled) {
        console.log("Enable SFW");
        document.getElementById("plugin_sfw").style.color = "#5cff00";
    } else {
        document.getElementById("plugin_sfw").style.color = "#f5f8fa";
    }
    stash_css.disabled = !stash_css.disabled;
}

function find_stashcss() {
    for (let i = 0; i < document.styleSheets.length; i++) {
        if (!document.styleSheets[i].href) {
            continue;
        }
        //console.debug(document.styleSheets[i]);
        if (document.styleSheets[i].href.includes("/css")) {
            var stash_css = document.styleSheets[i];
        }
    }
    return stash_css;
}

function waitForElementClass(elementId, callBack, time) {
    time = (typeof time !== 'undefined') ? time : 100;
    window.setTimeout(function () {
        var element = document.getElementsByClassName(elementId);
        if (element.length > 0) {
            callBack(elementId, element);
        } else {
            waitForElementClass(elementId, callBack);
        }
    }, time);
}

//addCSS(BUTTON_CSS);
create_sfwswitch_button();
