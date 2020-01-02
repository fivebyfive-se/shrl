(() => {
    const formFieldClass = 'form__field',
        fieldSuccess = `${formFieldClass}--success`,
        fieldError = `${formFieldClass}--error`,
        fieldDirty = `${formFieldClass}--dirty`;

    const form = document.getElementById('main-form'),
        keyContainer = document.getElementById('shortened'),
        urlField = document.getElementById('url'),
        keyField = document.getElementById('key'),        
        resultContainer = document.getElementById('result');
    
    let keyValid = true,
        urlValid = false;

    const safeGetValue = (elm, fallback = '') => elm ? (elm.value.replace(/^\s+|\s+$/g, '') || fallback) : fallback;
    const replaceClass = (elm, replaceClass, replaceWith = null) => {
        if (elm && elm.classList) {
            elm.classList.remove(replaceClass);
            if (replaceWith) {
                elm.classList.add(replaceWith);
            }
        }
    };
    const validIf = (elm, isValid) => {
        const icon = document.querySelector(`[data-validation-for=${elm.id}]`),
            message = document.querySelector(`[data-message-for=${elm.id}]`);

        message.classList.remove('show', 'error', 'success');

        if (isValid === null) {
            elm.classList.remove(fieldError, fieldSuccess);
            icon.classList.remove('show', 'error', 'success');
            icon.innerHTML = '';
        } else {
            if (isValid === true) {
                replaceClass(elm, fieldError, fieldSuccess);
                replaceClass(icon, 'error', 'success');
                icon.innerHTML = 'check_circle';
            } else {
                replaceClass(elm, fieldSuccess, fieldError);
                replaceClass(icon, 'success', 'error');
                icon.innerHTML = 'cancel';
                message.classList.add('show', 'error');
            }
            icon.classList.add('show');
        }
    };
    const validHostAndPath = (value) => {
        return value && /(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    };
    const validUrl = (value) => {
        return validHostAndPath(value) && /^(?:(?:(?:https?|ftp):)?\/\/)/.test(value);
    };
    const revalidateForm = () => {
        keyContainer.style.display = urlValid ? 'block' : 'none';

        if (urlValid && keyValid) {
            form.removeAttribute('disabled');
        } else {
            form.setAttribute('disabled', 'disabled');
        }
    };
    const handleChange = (element, eventToWatch, callback) => {
        ((field, handler, events) => {
            let lastValue = safeGetValue(field);

            function changeHandler() {
                const currValue = safeGetValue(field);
                if (currValue !== lastValue) {
                    if (lastValue === '') {
                        field.classList.add(fieldDirty);
                    }
                    if (handler) {
                        handler.call(field, currValue);
                    }
                    lastValue = currValue;
                }
            };

            (events || []).forEach((ev) => field.addEventListener(ev, changeHandler));
        })(element, callback, Array.isArray(eventToWatch) ? eventToWatch : [eventToWatch || 'change']);
    };


    handleChange(urlField, ['keyup', 'change'], (currValue) => {
        if (validHostAndPath(currValue) && !validUrl(currValue)) {
            currValue = `https://${currValue}`;
            urlField.value = currValue;
        }
        urlValid = validUrl(currValue);
        validIf(urlField, urlValid);

        revalidateForm();
    });

    handleChange(keyField, ['keyup', 'change'], (currValue) => {
        if (currValue.length < 3) {
            keyValid = false;
            revalidateForm();
        } else {
            form.setAttribute('disabled', 'disabled');
            fetch(`/url/${currValue}`)
                .then((resp) => resp.json())
                .then((resp) => {
                    keyValid = !resp.found;
                    validIf(keyField, keyValid);
                    revalidateForm();
                });    
        }
    });

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();

        if (keyValid && urlValid) {
            const key = safeGetValue(keyField);
            const url = safeGetValue(urlField);

            form.setAttribute('disabled', 'disabled');

            fetch(`/url/${key}`, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
            .then((resp) => resp.json())
            .then((resp) => {
                if (resp.success) {
                    resultContainer.innerHTML = `<p>Created new short link <a href="/${key}">/${key}</a></p>`;
                    resultContainer.style.display = 'block';
                    form.style.display = 'none';
                } else {
                    form.removeAttribute('disabled');
                }
            });
        }
    });
})();