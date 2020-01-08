const prismic = require('prismic.io');

const objUtil = require('./util/object');

const tag = (element, attrs = {}, content = null) => {
    const attrString = Object.keys(attrs)
        .filter((key) => attrs[key] !== null)
        .reduce((prev, key) => {
            const val = Array.isArray(attrs[key]) 
                ? attrs[key].filter((v) => v !== null).join(' ')
                : attrs[key];

            return `${prev} ${key}="${val}"`;
        }, '');

    return `<${element}${attrString}` + (
        content !== null
            ? `>${content}</${element}>`
            : '/>'
    );
};

const serialize = (element, content) => {
    // Fall back to the default HTML output
    const TAG_NAMES = {
        'heading1': 'h1',
        'heading2': 'h2',
        'heading3': 'h3',
        'heading4': 'h4',
        'heading5': 'h5',
        'heading6': 'h6',
        'paragraph': 'p',
        'preformatted': 'pre',
        'list-item': 'li',
        'o-list-item': 'li',
        'group-list-item': 'ul',
        'group-o-list-item': 'ol',
        'strong': 'strong',
        'em': 'em'
    };

    if (TAG_NAMES[element.type]) {
        return tag(TAG_NAMES[element.type], { 'class': element.label || null }, content);
    }

    if (element.type === 'image') {
        const imgTag = tag('img', {
            src: element.url,
            alt: element.alt || '',
            copyright: element.copyright || ''
        });
        const linkTag = element.linkUrl 
            ? tag('a', {
                target: element.linkTarget || null,
                rel: element.linkTarget ? 'noopener' : null,
                href: element.linkUrl
            }, imgTag)
            : imgTag;

        return tag('p', {
            'class': ['block-img', element.label || null]
        }, linkTag);
    }

    if (element.type === 'embed') {
        return tag('div', {
            'data-oembed': element.embed_url,
            'data-oembed-type': element.type,
            'data-oembed-provider': element.provider_name,
            'class': element.label || null
        }, element.oembed_html);
    }

    if (element.type === 'hyperlink') {
        return tag('a', {
            href: element.url,
            target: (element.data.value && element.data.value.target) ? element.data.target : null,
            rel: (element.data.value && element.data.value.target) ? 'noopener' : null
        }, content);
    }

    if (element.type === 'label') {
        return tag('span', { 'class': element.data.label }, content);
    }

    return `<!-- Warning: ${element.type} not implemented. Upgrade the Developer Kit. -->${content}`;
}


const parseDocument = (doc) => {
    const { type, data } = doc;
    const fragments = prismic.Fragments.parseFragments(data);

    return objUtil.mapKeysValues(fragments,
        (k) => k.replace(`${type}.`, ''),
        (v) => {
            if (v.value) {
                return v.value;
            } else {
                return (v.blocks || [])
                    .map((b) => {
                        return serialize(b, prismic.Fragments.insertSpans(b.text, b.spans));
                    })
                    .join("\n")
            }
        }
    );
}

class PrismicWrapper {
    constructor() {
        let _api = null;

        const getApi = async () => {
            if (!_api) {
                _api = await prismic.api(process.env.PRISMIC_ENDPOINT);
            }
            return _api;
        };
        const queryByType = async (documentType) => {
            const response = await (await getApi()).query(
                prismic.Predicates.at('document.type', documentType)
            );
            return (response.results || []).map((d) => parseDocument(d));
        };
        const queryByField = async (fieldName, fieldValue) => {
            const response = await (await getApi()).query(
                prismic.Predicates.at(`my.${fieldName}`, fieldValue)
            );
            return (response.results || []).map((d) => parseDocument(d));
        };

        this.getType = async (type) => await queryByType(type);
        this.getPage = async (pageName) => {
            const result = await queryByField('page.title', pageName);
            if (result && result.length > 0) {
                return result[0];
            }
            return null;
        };
    }
}

module.exports = new PrismicWrapper();
