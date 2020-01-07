const prismic = require('prismic.io');

const objUtil = require('./util/object');

const serialize = (element, content, htmlSerializer) => {
    // Fall back to the default HTML output
    var TAG_NAMES = {
      "heading1": "h1",
      "heading2": "h2",
      "heading3": "h3",
      "heading4": "h4",
      "heading5": "h5",
      "heading6": "h6",
      "paragraph": "p",
      "preformatted": "pre",
      "list-item": "li",
      "o-list-item": "li",
      "group-list-item": "ul",
      "group-o-list-item": "ol",
      "strong": "strong",
      "em": "em"
    };
  
    if (TAG_NAMES[element.type]) {
      var name = TAG_NAMES[element.type];
      var classCode = element.label ? (' class="' + element.label + '"') : '';
      return '<' + name + classCode + '>' + content + '</' + name + '>';
    }
  
    if (element.type == "image") {
      var label = element.label ? (" " + element.label) : "";
      var imgTag = '<img src="' + element.url + '" alt="' + (element.alt || "") + '" copyright="' + (element.copyright || "") + '">';
      var imageTarget = element.linkTarget ? ' target="' + element.linkTarget + '" rel="noopener"' : '';
      return '<p class="block-img' + label + '">' +
        (element.linkUrl ? ('<a' + imageTarget + ' href="' + element.linkUrl + '">' + imgTag + '</a>') : imgTag) +
        '</p>';
    }
  
    if (element.type == "embed") {
      return '<div data-oembed="'+ element.embed_url +
        '" data-oembed-type="'+ element.type +
        '" data-oembed-provider="'+ element.provider_name +
        (element.label ? ('" class="' + element.label) : '') +
        '">' + element.oembed.html+"</div>";
    }
  
    if (element.type === 'hyperlink') {
      var target = (element.data.value && element.data.value.target) ? ' target="'+ element.data.value.target +'" rel="noopener"' : '';
      return '<a' + target + ' href="' + element.url + '">' + content + '</a>';
    }
  
    if (element.type === 'label') {
      return '<span class="' + element.data.label + '">' + content + '</span>';
    }
  
    return "<!-- Warning: " + element.type + " not implemented. Upgrade the Developer Kit. -->" + content;
  }

const parseSpans = (text, spans) => {
    let html = '';
    let tagsStart = {};
    let tagsEnd = {};

    spans.forEach(function (span) {
        if (!tagsStart[span.start]) { tagsStart[span.start] = []; }
        if (!tagsEnd[span.end]) { tagsEnd[span.end] = []; }

        tagsStart[span.start].push(span);
        tagsEnd[span.end].unshift(span);
    });

    let c;
    let stack = [];
    for (let pos = 0, len = text.length + 1; pos < len; pos++) { // Looping to length + 1 to catch closing tags
        if (tagsEnd[pos]) {
            tagsEnd[pos].forEach(() => {
                // Close a tag
                const tag = stack.pop();
                // Continue only if block contains content.
                if (typeof tag !== 'undefined') {
                    const innerHtml = serialize(tag.span, tag.text);
                    if (stack.length === 0) {
                        // The tag was top level
                        html += innerHtml;
                    } else {
                        // Add the content to the parent tag
                        stack[stack.length - 1].text += innerHtml;
                    }
                }
            });
        }
        if (tagsStart[pos]) {
            // Sort bigger tags first to ensure the right tag hierarchy
            tagsStart[pos].sort((a, b) => (b.end - b.start) - (a.end - a.start));
            tagsStart[pos].forEach((span) => {
                // Open a tag
                if (span.type === 'hyperlink') {
                    const {type, value} = span.data;
                    span.url = (value.url || '#').replace(/^https?:\/\/shrl.cc\/?/, '/');
                }
                var elt = {
                    span: span,
                    text: ""
                };
                stack.push(elt);
            });
        }
        if (pos < text.length) {
            c = text[pos];
            if (stack.length === 0) {
                // Top-level text
                html += c;
            } else {
                // Inner text of a span
                stack[stack.length - 1].text += c;
            }
        }
    }

    return html;
};

const parseDataValue = (value, prev, next) => {
    const { type, text, spans } = value;
    const prevType = prev ? prev.type : null;
    const nextType = next ? next.type : null;
    
    const html = parseSpans(text, spans);

    switch (type) {
        case 'heading2': return `<h2>${html}</h2>`;
        case `paragraph`: return `<p>${html}</p>`;
        case 'list-item': return (prevType !== type ? '<ul>' : '') + `<li>${html}</li>` + (nextType !== type ? '</ul>' : '');
        default: return html;
    }
};

const parseDataType = (item) => {
    const { type, value } = item;
    switch (type) {
        case 'Text': return value;
        case 'StructuredText':
            return value.map((v, i, all) => {
                return parseDataValue(v,
                    i > 0 ? all[i - 1] : null,
                    i < all.length - 1 ? all[i + 1] : null
                );
            }).join("\n");
        default:
            return type + ': ' + JSON.stringify(value);
    }
}

const parseDocument = (doc) => {
    const { type, data } = doc;
    return objUtil.mapKeysValues(data,
        (k) => k.replace(`${type}.`, ''),
        (v) => parseDataType(v)
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
            return response.results;
        };
        const queryByField = async (fieldName, fieldValue) => {
            const response = await (await getApi()).query(
                prismic.Predicates.at(`my.${fieldName}`, fieldValue)
            );
            return response.results;
        };

        this.getType = async (type) => await queryByType(type);
        this.getPage = async (pageName) => {
            const result = await queryByField('page.title', pageName);
            if (result && result.length > 0) {
                return parseDocument(result[0]);
            }
            return null;
        };
    }
}

module.exports = new PrismicWrapper();
