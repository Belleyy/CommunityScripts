import json
import sys
import os
import requests

import log

FRAGMENT = json.loads(sys.stdin.read())
FRAGMENT_SERVER = FRAGMENT["server_connection"]
PLUGINS_ARGS = FRAGMENT['args']['mode']


def callGraphQL(query, variables=None, raise_exception=True):
    # Session cookie for authentication
    graphql_port = FRAGMENT_SERVER['Port']
    graphql_scheme = FRAGMENT_SERVER['Scheme']
    graphql_cookies = {
        'session': FRAGMENT_SERVER.get('SessionCookie').get('Value')
    }
    graphql_headers = {
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Connection": "keep-alive",
        "DNT": "1"
    }
    graphql_domain = 'localhost'
    # Stash GraphQL endpoint
    graphql_url = graphql_scheme + "://" + graphql_domain + ":" + str(
        graphql_port) + "/graphql"

    json = {
        'query': query
    }
    if variables is not None:
        json['variables'] = variables
    try:
        response = requests.post(
            graphql_url,
            json=json,
            headers=graphql_headers,
            cookies=graphql_cookies,
            timeout=20)
    except Exception as e:
        exit_plugin(err="[FATAL] Exception with GraphQL request. {}".format(e))
    if response.status_code == 200:
        result = response.json()
        if result.get("error"):
            for error in result["error"]["errors"]:
                if raise_exception:
                    raise Exception("GraphQL error: {}".format(error))
                else:
                    log.LogError("GraphQL error: {}".format(error))
            return None
        if result.get("errors"):
            for error in result["errors"]:
                if raise_exception:
                    raise Exception("GraphQL error: {}".format(error))
                else:
                    log.LogError("GraphQL error: {}".format(error))
            return None
        if result.get("data"):
            return result.get("data")
    elif response.status_code == 401:
        exit_plugin(err="HTTP Error 401, Unauthorised.")
    else:
        raise ConnectionError("GraphQL query failed:{} - {}".format(response.status_code, response.content))


def graphql_duplicateScenes(distance: int) -> list:
    query = """
    query FindDuplicateScenes($distance: Int) {
        findDuplicateScenes(distance: $distance) {
            ...SlimSceneData
        }
    }
    fragment SlimSceneData on Scene {
        id
        checksum
        oshash
        title
        details
        url
        date
        rating
        o_counter
        organized
        path
        phash
        interactive
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
        paths {
            screenshot
            preview
            stream
            webp
            vtt
            chapters_vtt
            sprite
            funscript
        }
        scene_markers {
            id
            title
            seconds
        }
        galleries {
            id
            path
            title
        }
        studio {
            id
            name
            image_path
        }
        movies {
            movie {
                id
                name
                front_image_path
            }
            scene_index
        }
        tags {
            id
            name
        }
        performers {
            id
            name
            gender
            favorite
            image_path
        }
        stash_ids {
            endpoint
            stash_id
        }
    }

    """
    variables = {
        "distance": distance
    }
    result = callGraphQL(query, variables)
    return result["findDuplicateScenes"]


def exit_plugin(msg=None, err=None):
    if msg is None and err is None:
        msg = "plugin ended"
    output_json = {
        "output": msg,
        "error": err
    }
    print(json.dumps(output_json))
    sys.exit()


def humanbytes(B: int) -> str:
    # https://stackoverflow.com/questions/12523586/python-format-size-application-converting-b-to-kb-mb-gb-tb
    'Return the given bytes as a human friendly KB, MB, GB, or TB string'
    B = float(B)
    KB = float(1024)
    MB = float(KB**2)  # 1,048,576
    GB = float(KB**3)  # 1,073,741,824
    TB = float(KB**4)  # 1,099,511,627,776

    if B < KB:
        return '{0} {1}'.format(B, 'Bytes' if 0 == B > 1 else 'Byte')
    elif KB <= B < MB:
        return '{0:.2f} KB'.format(B / KB)
    elif MB <= B < GB:
        return '{0:.2f} MB'.format(B / MB)
    elif GB <= B < TB:
        return '{0:.2f} GB'.format(B / GB)
    elif TB <= B:
        return '{0:.2f} TB'.format(B / TB)


# Distance;
DIST = None
if PLUGINS_ARGS == "exact":
    DIST = 0
if PLUGINS_ARGS == "high":
    DIST = 4
if PLUGINS_ARGS == "medium":
    DIST = 8
if PLUGINS_ARGS == "low":
    DIST = 10
if DIST is None:
    exit_plugin(err="Incorrect Argument")

duplicate_list = graphql_duplicateScenes(DIST)

log.LogInfo("There is {} sets of duplicates found.".format(len(duplicate_list)))

for group in duplicate_list:
    log.LogInfo("==========")
    for scene in group:
        log.LogInfo(f"[{scene['id']}] {scene['title']} - {humanbytes(scene['file']['size'])}")

exit_plugin("Plugin ended correctly.")
