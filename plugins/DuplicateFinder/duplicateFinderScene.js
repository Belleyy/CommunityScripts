"use strict";
log.Debug("--Starting Plugin: DuplicateFinderScene [JS]--");

/* Global */

var FRAGMENT = input;
var FRAGMENT_SERVER = FRAGMENT["server_connection"];
var PLUGINS_ARGS = FRAGMENT["args"]["mode"];

/*
{
    "server_connection":{
        "Scheme":"http","Host":"0.0.0.0","Port":9999,"SessionCookie":{
            "Name":"session","Value":"COOKIEVALUE","Path":"","Domain":"","Expires":"0001-01-01T00:00:00Z","RawExpires":"","MaxAge":0,"Secure":false,"HttpOnly":false,"SameSite":0,"Raw":"","Unparsed":null
        },
        "Dir":"C:\\Users\\Winter\\.stash","PluginDir":"C:\\Users\\Winter\\.stash\\plugins\\Task\\DuplicateFinder"
    },"args":{
        "mode":"medium"
    }
}
*/
function main(){
    var dist = get_Distance(PLUGINS_ARGS);
    if (dist === null) {
        return exit_plugin(null, "Incorrect Argument");
    }
    var duplicate_list = graphql_duplicateScenes(dist);
    log.Info("[" + dist + "] There is " + duplicate_list.length + " sets of duplicates found.");
    for (var i = 0; i < duplicate_list.length; i++) {
        var group_duplicate = duplicate_list[i];
        log.Info("==========");
        for (var j = 0; j < group_duplicate.length; j++) {
            var scene = duplicate_list[i][j];
            log.Info("[" + scene["id"] + "] " + scene["title"] + " - " + humanFileSize(scene["file"]["size"]));
        }
    }
    return exit_plugin("Plugin ended correctly");
}


function MultiString(f) {
    return f.toString().split("\n").slice(1, -1).join("\n");
}

function humanFileSize(size) {
    // https://stackoverflow.com/a/20732091
    var i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

function exit_plugin(msg, err) {
    if ((msg === null && err === null) || (msg === "undefined" && err === "undefined")) {
        msg = "plugin ended";
    }
    var output_json = { Output: msg, Error: err };
    return output_json;
}

function callGraphQL(query, variables) {
    if (variables === "undefined") {
        variables = null;
    }
    return gql.Do(query, variables);
}

function graphql_duplicateScenes(distance) {
    var query = MultiString(function () {/**
        query FindDuplicateScenes($distance: Int) {
            findDuplicateScenes(distance: $distance) {
                ...SlimSceneData
            }
        }
        fragment SlimSceneData on Scene {
            id
            title
            file {
                size
                duration
                video_codec
                audio_codec
                width
                height
                framerate
                bitrate
            }
        }
    **/});
    var variables = { "distance": distance };
    var result = callGraphQL(query, variables);
    return result["findDuplicateScenes"];
}

function get_Distance(arg) {
    if (arg === "exact") {
        return 0;
    }
    if (arg === "high") {
        return 4;
    }
    if (arg === "medium") {
        return 8;
    }
    if (arg === "low") {
        return 10;
    }
    return null;
}

main();
