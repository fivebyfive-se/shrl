(() => {
    const time = () => (new Date()).getTime();

    const limit = 7;
    const counter = document.getElementById('count-down-timer');
    const start = time();

    let timer = null;

    function update() {
        const diff = (time() - start);
        if (diff > 1000) {
            const timeLeft = parseInt(limit - (diff / 1000));
            counter.innerHTML = timeLeft;
        } else if (timer) {
            clearInterval(timer);
        }
        setTimeout(update, 250);
    };

    update();
})();