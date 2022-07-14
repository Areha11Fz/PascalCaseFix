var dir = "excel"

const fs = require('fs')

const files = fs.readdirSync(dir)

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getNestedKeys = (data, keys) => {
    if (!(data instanceof Array) && typeof data == 'object') {
        Object.keys(data).forEach(key => {
            keys.push(key);
            const value = data[key];
            if (typeof value === 'object' && !(value instanceof Array)) {
                getNestedKeys(value, keys);
            }
        });
    }
    return keys
}

const isObject = (obj) => obj != null && obj.constructor.name === "Object";

function getKeys(obj, keepObjKeys, skipArrays, keys = [], scope = []) {
    if (Array.isArray(obj)) {
        if (!skipArrays) scope.push('[' + obj.length + ']');
        obj.forEach((o) => getKeys(o, keepObjKeys, skipArrays, keys, scope), keys);
    } else if (isObject(obj)) {
        Object.keys(obj).forEach((k) => {
            if ((!Array.isArray(obj[k]) && !isObject(obj[k])) || keepObjKeys) {
                let path = scope.concat(k).join('.').replace(/\.\[/g, '[');
                if (!keys.includes(path)) keys.push(path);
            }
            getKeys(obj[k], keepObjKeys, skipArrays, keys, scope.concat(k));
        }, keys);
    }
    return keys;
}

for (const file of files) {
    var excelFiles = JSON.parse(fs.readFileSync('./excel/' + file, 'utf8'));

    var allKeys = getKeys(excelFiles, true, true)

    var newKeyList = []

    allKeys.forEach(key => {
        // console.log(key);

        var nestedKey = key.split('.');
        if (nestedKey[1] !== undefined) {
            newKeyList.push(nestedKey[1])
        }

        if (nestedKey[1] == null) {
            newKeyList.push(key)
        }

    });

    // console.log(newKeyList);

    var stringified = JSON.stringify(excelFiles, null, 4);

    newKeyList.forEach(key => {
        // var reg = new RegExp(key, "g");
        // stringified.replace(reg, capitalizeFirstLetter(key));

        // stringified = stringified.replace(key, capitalizeFirstLetter(key));

        stringified = stringified.split(key).join(capitalizeFirstLetter(key))

    });

    fs.writeFileSync('./output/' + file, stringified);
}