const merge = (...objects) => {
    const objectList = objects.length === 1 && Array.isArray(objects[0]) ? [...objects[0]] : objects;
    return objectList.reduce((prev, curr) => (
        { ...prev, ...(curr || {}) }
    ), {});
};

const get = (obj, path, fallback = null) => {
    const pathArr = Array.isArray(path) ? [...path] : path.split(/[\[\]\.]/);
    const pathLength = pathArr.length;

    let index = 0;
    let ret = obj;

    while (ret && index < pathLength) {
        ret = ret[pathArr[index++]];
    }
    return index === pathLength ? ret : fallback;
};

const toArray = (obj) => {
    return Object.keys(obj || {}).reduce(
        (prev, curr) => {
            return [...prev, { key: curr, value: obj[curr] }];
        }, 
        []
    );
};

const addProperty = (obj, propName, propValue) => {
    const obj2 = {};
    obj2[propName] = propValue;
    return {...obj, ...obj2};
};

const mapKeysValues = (obj, keyMap = (k) => k, valMap = (v) => v) => {
    const ret = {},
        keys = Object.keys(obj),
        values = Object.values(obj);

    keys.forEach((k, i, all) => {
        ret[keyMap(k, i, all)] = valMap(values[i], i, values);
    });

    return ret;
};

module.exports = {
    merge,
    get,
    toArray,

    addProperty,
    mapKeysValues
};
