(() => {
    const deleteKey = async (key) => {
        const options = {
            method: 'DELETE',
            cache: 'no-cache',
            credentials: 'include',
        };
        try {
            const resp = await fetch(`/url/${key}`, options);
            return await resp.json();
        } catch {
            return null;
        }
    };

    const deleteButtons = document.querySelectorAll('[data-delete-url]');
    (deleteButtons || []).forEach((button) => {
        button.addEventListener('click', async function (ev) {
            ev.preventDefault();
            const btn = this;
            const key = btn.dataset.deleteUrl;
            if (key) {
                const result = await deleteKey(key);
                if (result && result.success) {
                    (document.querySelectorAll(`[data-delete-container-for]`) || []).forEach((c) => {
                        if (c.dataset.deleteContainerFor === key) {
                            c.style.display = 'none';                            
                        }
                    });
                } else {
                    btn.classList.add('error');
                }
            }
        });
    });
})();