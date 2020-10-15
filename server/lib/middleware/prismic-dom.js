const PrismicDOM = require('prismic-dom');
const prismic = require('prismic.io');

function linkResolver(doc) {
    // Define the url depending on the document type
    if (doc.type === 'page') {
        return '/page/' + doc.uid;
    } 
    // Default to homepage
    return '/';
}

module.exports = async (req, res, next) => {
    res.locals.ctx = {
        endpoint: process.env.PRISMIC_ENDPOINT,
        linkResolver
    };
    res.locals.PrismicDOM = PrismicDOM;
    req.prismicApi = await prismic.api(process.env.PRISMIC_ENDPOINT, { req });
    next();
};
