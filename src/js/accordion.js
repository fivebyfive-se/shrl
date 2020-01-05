(function () {
    const accordions = document.querySelectorAll('.accordion__item');
    
    if (accordions) {
        accordions.forEach((a) => {
            const headers = a.querySelectorAll('.accordion__header');
            (headers || []).forEach((h) => {
                h.addEventListener('click', (ev) => {
                    a.classList.toggle('accordion__item--active');
                });
            });
        });
    }
})();
