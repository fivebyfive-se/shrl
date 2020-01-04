const merge = (...objects) => {
    const objectList = objects.length === 1 && Array.isArray(objects[0]) ? [...objects[0]] : objects;
    return objectList.reduce((prev, curr) => (
        { ...prev, ...(curr || {}) }
    ), {});
};

module.exports = {
    merge
};
