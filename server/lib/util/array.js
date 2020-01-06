const firstAndRest = (arr) => {
    const [first, ...rest] = [...arr];
    return { 
        first: first || null,
        rest: rest || []
    };
};
const first = (arr) => firstAndRest(arr).first;
const rest = (arr) => firstAndRest(arr).rest;

const toObject = (keys, values) => {
    const obj = {};
    keys.forEach((k, i) => {
        obj[k] = values[i];
    });
    return {...obj};
};

const ensureArray = (obj, toArray = null) => {
    if (Array.isArray(obj)) {
        return [...obj];
    } else if (toArray) {
        return toArray(obj);
    } else {
        return [ obj ];
    }
};

module.exports = {
    firstAndRest,
    first,
    rest,

    ensureArray,
    toObject
};
