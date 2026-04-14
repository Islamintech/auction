document.addEventListener('DOMContentLoaded', () => {
    const tabLive = document.getElementById('tab-live');
    const tabWeek = document.getElementById('tab-week');
    const bars    = document.querySelectorAll('.bar');

    const liveData = [45, 60, 35, 75, 50, 40, 90, 55, 65, 80, 45, 70];
    const weekData = [70, 40, 85, 55, 65, 90, 45, 75, 60, 50, 80, 35];

    function updateBars(data) {
        bars.forEach((bar, i) => {
            bar.style.height = data[i] + '%';
        });
    }

    if (tabLive) {
        tabLive.addEventListener('click', () => {
            tabLive.classList.add('active');
            tabWeek.classList.remove('active');
            updateBars(liveData);
        });
    }

    if (tabWeek) {
        tabWeek.addEventListener('click', () => {
            tabWeek.classList.add('active');
            tabLive.classList.remove('active');
            updateBars(weekData);
        });
    }
});