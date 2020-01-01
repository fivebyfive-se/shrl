(() => {
    const debounce = (func, wait, immediate) => {
        let timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
    const safeGetValue = (elm, fallback = '') => elm ? (elm.value || fallback) : fallback;
    const replaceClass = (elm, replaceClass, replaceWith = null) => {
        if (elm && elm.classList) {
            elm.classList.remove(replaceClass);
            if (replaceWith) {
                elm.classList.add(replaceWith);
            }
        }
    };

    const urlField = document.getElementById('url');
    const keyField = document.getElementById('shortened');
    const formFieldClass = 'form__field',
        fieldSuccess = `${formFieldClass}--success`,
        fieldError = `${formFieldClass}--error`;

    let keyDirty = false;

    if (urlField && keyField) {
        let lastUrlValue = safeGetValue(urlField);
        let lastKeyValue = safeGetValue(keyField)

        function urlChanged() {
            const field = this;
            const currValue = safeGetValue(field);
            if (lastUrlValue !== currValue) {
                if (currValue.length > 5) {
                    replaceClass(field, fieldError, fieldSuccess);
                    keyField.style.display = 'block';
                } else {
                    replaceClass(field, fieldSuccess, fieldError);
                    keyField.style.display = 'none';
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
                fetch(`/url/${currValue}`).then((resp) => {
                    
                });
            }
        }

        urlField.addEventListener('keyup', urlChanged);
        urlField.addEventListener('change', urlChanged);
        keyField.addEventListener('keyup', keyChanged);
    }
})();