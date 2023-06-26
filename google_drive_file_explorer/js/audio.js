const fetchMost = async() => {
    const response = await fetch("../json/audio.json"),
        keyValues = await response.json()
    return keyValues
}

fetchMost().then(keyValues => {
    const time_labels = Object.values(keyValues.slice(1).map(element => element[0])),
        states = Object.values(keyValues[0]),
        covid_datasets = [],
        bg = [
            'rgba(27, 158, 119, 0.5)',
            'rgba(217, 95, 2, 0.5)',
            'rgba(117, 112, 179, 0.5)',
            'rgba(231, 41, 138, 0.5)',
            'rgba(102, 166, 30, 0.5)',
            'rgba(230, 171, 2, 0.5)',
            'rgba(166, 118, 29, 0.5)',
            'rgba(102, 102, 102, 0.5)'
        ],
        bc = [
            'rgb(27, 158, 119)',
            'rgb(217, 95, 2)',
            'rgb(117, 112, 179)',
            'rgb(231, 41, 138)',
            'rgb(102, 166, 30)',
            'rgb(230, 171, 2)',
            'rgb(166, 118, 29)',
            'rgb(102, 102, 102)'
        ]
    for (let i = 1; i < states.length + 1; i++) {
        covid_datasets.push({
            label: states[i - 1],
            data: Object.values(keyValues.slice(1, 6).map(element => element[i])),
            backgroundColor: bg[i - 1],
            borderColor: bc[i - 1]
        })
    }
    const myNewChart = new Chart(document.getElementById('myChart'), {
        type: 'bar',
        data: {
            datasets: covid_datasets,
            labels: time_labels
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'DAYS OF THE WEEK'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'TIMES OPENED'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: "FILES YOU ACCESSED MORE OFTEN",
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: true
                }
            }
        }
    })
})
