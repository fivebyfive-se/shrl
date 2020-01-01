(() => {
    const safeGetValue = (elm, fallback = '') => elm ? (elm.value || fallback) : fallback;
    const replaceClass = (elm, replaceClass, replaceWith = null) => {
        if (elm && elm.classList) {
            elm.classList.remove(replaceClass);
            if (replaceWith) {
                elm.classList.add(replaceWith);
            }
        }
    };
    const validUrl = (value) => {
        return value && /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    };

    const form = document.getElementById('main-form');
    const button = document.getElementById('submit-button');
    const keyContainer = document.getElementById('shortened');
    const urlField = document.getElementById('url');
    const keyField = document.getElementById('key');
    const resultContainer = document.getElementById('result');

    const formFieldClass = 'form__field',
        fieldSuccess = `${formFieldClass}--success`,
        fieldError = `${formFieldClass}--error`;

    let keyDirty = false,
        formValid = false;

    if (urlField && keyField) {
        let lastUrlValue = safeGetValue(urlField);
        let lastKeyValue = safeGetValue(keyField)

        function urlChanged() {
            const field = this;
            const currValue = safeGetValue(field);
            if (lastUrlValue !== currValue) {
                formValid = validUrl(currValue);
                if (formValid) {
                    replaceClass(field, fieldError, fieldSuccess);
                    form.removeAttribute('disabled');
                    keyContainer.style.display = 'block';
                } else {
                    replaceClass(field, fieldSuccess, fieldError);
                    form.setAttribute('disabled', 'disabled');
                    keyContainer.style.display = 'none';
                }
                lastUrlValue = currValue;    
            }
        }

        function keyChanged() {
            const field = this;
            const currValue = safeGetValue(field);

            if (currValue !== lastKeyValue) {
                if (!keyDirty) {
                    keyField.addEventListener('change', keyChanged);
                    keyDirty = true;
                }
                fetch(`/url/${currValue}`)
                    .then((resp) => resp.json())
                    .then((resp) => {
                        field.classList.remove('error', 'success');
                        if (resp.found) {
                            field.classList.add('error');
                        } else {
                            field.classList.add('success')
                        }
                    });
            }
        }

        function formSubmitted(ev) {
            ev.preventDefault();
            if (formValid) {
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
        }

        urlField.addEventListener('keyup', urlChanged);
        urlField.addEventListener('change', urlChanged);
        keyField.addEventListener('keyup', keyChanged);

        form.addEventListener('submit', formSubmitted);
    }
})();