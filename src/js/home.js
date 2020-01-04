(() => {
    // #region Helpers
    const safeGetValue = (elm, fallback = '') => elm ? (elm.value.replace(/^\s+|\s+$/g, '') || fallback) : fallback;
    const validHostAndPath = (value) => {
        return value && /(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    };
    const validUrl = (value) => validHostAndPath(value) && /^(?:(?:(?:https?|ftp):)?\/\/)/.test(value);

    const handleChange = (element, eventToWatch, callback) => {
        ((field, handler, events) => {
            let lastValue = safeGetValue(field);

            function changeHandler() {
                const currValue = safeGetValue(field);

                if (currValue !== lastValue) {
                    if (handler) {
                        handler(field, currValue);
                    }
                    lastValue = currValue;
                }
            };

            (events || []).forEach((ev) => field.addEventListener(ev, changeHandler));
        })(element, callback, Array.isArray(eventToWatch) ? eventToWatch : [eventToWatch || 'change']);
    };

    const req = async (url, body = null) => {
        const options = body === null ? undefined : {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };
        try {
            const resp = await fetch(url, options);
            return await resp.json();
        } catch {
            return null;
        }
    };
    // #endregion


    // #region "Globals"
    const form = document.getElementById('main-form'),
        keyContainer = document.getElementById('key-container');

    const fields = [
        {
            key: 'url',
            validator: async (elm, value) => {
                if (validHostAndPath(value) && !validUrl(value)) {
                    value = `https://${value}`;
                    elm.value = value;
                }
                return validUrl(value) ? null : true;
            },
            valid: false,
            validationMessage: (value, _) => `${value} doesn't look like an URL`,
            onValidation: (valid) => keyContainer.style.display = valid ? 'block' : 'none',
            value: ''
        },
        {
            key: 'key',
            validator: async (_, value) => {
                const resp = await req(`/url/${value}`);
                if (resp) {
                    const valid = !resp.found && !resp.invalid;
                    return valid ? null : { ...resp };
                }
            },
            valid: true,
            validationMessage: (value, validationResult) => {
                return validationResult.found ? `${value} is already in use` : `${value} is not a valid key`;
            },
            onValidation: (valid) => null,
            value: ''
        }
    ];
    const allValid = () => fields.filter((f) => f.valid).length === fields.length;

    const updateForm = () => {
        if (allValid()) {
            form.removeAttribute('disabled');
        } else {
            form.setAttribute('disabled', 'disabled');
        }
    };

    const replaceClasses = (elements, replace, replacement) => {
        (elements || []).forEach((el) => {
            el.classList.remove(replace);
            el.classList.add(replacement);
        });
    };

    const validateField = async (element, value) => {
        const field = fields.find((f) => f.key === element.id),
            container = document.getElementById(`${field.key}-container`),
            message = container.querySelector(`[data-message-for=${field.key}]`);

        const validationResult = await field.validator(element, value);

        field.valid = !validationResult;

        if (field.valid) {
            message.innerHTML = '';
            replaceClasses([element, container], 'invalid', 'valid');
        } else {
            message.innerHTML = field.validationMessage(value, validationResult);
            replaceClasses([element, container], 'valid', 'invalid');
        }
        if (field.onValidation) {
            field.onValidation(field.valid);
        }
        updateForm();
    };
    // #endregion

    fields
        .map((f) => document.getElementById(f.key))
        .forEach((el) => handleChange(el, ['keyup', 'change'], validateField));

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        if (keyValid && urlValid) {
            const key = safeGetValue(keyField);
            const url = safeGetValue(urlField);

            form.setAttribute('disabled', 'disabled');

            const resp = await req(`/url/${key}`, { url });
            if (resp && resp.success) {
                const resultContainer = document.getElementById('result');

                resultContainer.innerHTML = `<p>Created new short link <a href="/${key}">shrl.cc/<b>${key}</b></a></p>`;
                resultContainer.style.display = 'block';

                form.style.display = 'none';
            } else {
                form.removeAttribute('disabled');
            }
        }
    });
})();