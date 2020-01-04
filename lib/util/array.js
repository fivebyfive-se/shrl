const firstAndRest = (arr) => {
    const [first, ...rest] = [...arr];
    return { 
        first: first || null,
        rest: rest || []
    };
};
const first = (arr) => firstAndRest(arr).first;
const rest = (arr) => firstAndRest(arr).rest;

module.exports = {
    firstAndRest,
    first,
    rest,
};
