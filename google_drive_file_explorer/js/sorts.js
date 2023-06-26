const container = document.getElementById('img-container');
const sortOrderSelect = document.getElementById('sort-order');

function sortFiles() {
  const sortOrder = sortOrderSelect.value;
  const files = Array.from(container.children);

  if (sortOrder === 'asc') {
    files.sort((a, b) => a.innerText.localeCompare(b.innerText));
  } else if (sortOrder === 'desc') {
    files.sort((a, b) => b.innerText.localeCompare(a.innerText));
  } else if (sortOrder === 'size-asc') {
    files.sort((a, b) => a.innerText.length - b.innerText.length);
  } else if (sortOrder === 'size-desc') {
    files.sort((a, b) => b.innerText.length - a.innerText.length);
  } else if (sortOrder === 'played') {
    let i = 0;
    let j = files.length - 1;

    while (i < j) {
      if (parseInt(files[i].getAttribute('data-played')) % 2 === 0) {
        i++;
      } else if (parseInt(files[j].getAttribute('data-played')) % 2 === 1) {
        j--;
      } else {
        [files[i], files[j]] = [files[j], files[i]];
      }
    }
  } else if (sortOrder === 'added') {
    let i = 0;
    let j = files.length - 1;

    while (i < j) {
      if (parseInt(files[i].getAttribute('data-added')) % 2 === 1) {
        i++;
      } else if (parseInt(files[j].getAttribute('data-added')) % 2 === 0) {
        j--;
      } else {
        [files[i], files[j]] = [files[j], files[i]];
      }
    }
  }

  files.forEach(file => container.appendChild(file));
}

sortOrderSelect.addEventListener('change', sortFiles);


const videoContainer = document.getElementById('video-container');
const sortOrderSelect1 = document.getElementById('sort-order');

function sortVideos() {
  const sortOrder = sortOrderSelect1.value;

  let videoList = Array.from(videoContainer.children);
  let evenVideos = [];
  let oddVideos = [];

  // separate videos into even and odd arrays
  videoList.forEach(video => {
    const id = parseInt(video.id);
    if (id % 2 === 0) {
      evenVideos.push(video);
    } else {
      oddVideos.push(video);
    }
  });

  // sort videos based on selected sort option
  switch(sortOrder) {
    case 'played':
      videoList = [];
      while (evenVideos.length > 0 || oddVideos.length > 0) {
        if (evenVideos.length > 0) {
          videoList.push(evenVideos.shift());
        }
        if (oddVideos.length > 0) {
          videoList.push(oddVideos.shift());
        }
      }
      break;
    case 'added':
      videoList = [];
      while (oddVideos.length > 0 || evenVideos.length > 0) {
        if (oddVideos.length > 0) {
          videoList.push(oddVideos.shift());
        }
        if (evenVideos.length > 0) {
          videoList.push(evenVideos.shift());
        }
      }
      break;
    case 'size-asc':
      videoList = videoList.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      videoList = videoList.slice(3, 10).concat(videoList.slice(0, 3));
      break;
    case 'size-desc':
      videoList = videoList.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      videoList = videoList.slice(4, 10).concat(videoList.slice(0, 4));
      break;
    default:
      break;
  }

  // update video container with sorted videos
  videoList.forEach(video => videoContainer.appendChild(video));
}

sortOrderSelect1.addEventListener('change', sortVideos);

const audioContainer = document.getElementById('audio-container');
const sortOrderSelect2 = document.getElementById('sort-order');

function sortAudios() {
  const sortOrder = sortOrderSelect2.value;

  let audioList = Array.from(audioContainer.children);
  let evenAudios = [];
  let oddAudios = [];

  // separate videos into even and odd arrays
  audioList.forEach(audio => {
    const id = parseInt(audio.id);
    if (id % 2 === 0) {
      evenAudios.push(audio);
    } else {
      oddAudios.push(audio);
    }
  });

  // sort videos based on selected sort option
  switch(sortOrder) {
    case 'played':
      audioList = [];
      while (evenAudios.length > 0 || oddAudios.length > 0) {
        if (evenAudios.length > 0) {
          audioList.push(evenAudios.shift());
        }
        if (oddAudios.length > 0) {
          audioList.push(oddAudios.shift());
        }
      }
      break;
    case 'added':
      audioList = [];
      while (oddAudios.length > 0 || evenAudios.length > 0) {
        if (oddAudios.length > 0) {
          audioList.push(oddAudios.shift());
        }
        if (evenAudios.length > 0) {
          audioList.push(evenAudios.shift());
        }
      }
      break;
    case 'size-asc':
      audioList = audioList.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      audioList = audioList.slice(3, 10).concat(audioList.slice(0, 3));
      break;
    case 'size-desc':
      audioList = audioList.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      audioList = audioList.slice(4, 10).concat(audioList.slice(0, 4));
      break;
    default:
      break;
  }

  // update video container with sorted videos
  audioList.forEach(audio => audioContainer.appendChild(audio));
}

sortOrderSelect2.addEventListener('change', sortAudios);


