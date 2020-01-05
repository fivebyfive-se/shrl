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

module.exports = {
    merge,
    get
};
