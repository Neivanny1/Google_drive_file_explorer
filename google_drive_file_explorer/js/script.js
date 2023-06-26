// this source code used updated google sign in options 
// after the previous button is deprecated
window.onload = () => {
    gapiLoaded();
    gisLoaded()
}

var CLIENT_ID = '34557826270-52gm4a55rghg20h6lqarnc0eivlaemjc.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDh9CjpChE_rNu2gdCw7AVZIo1_wCxxlg0';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';
var signinButton = document.getElementsByClassName('signin')[0];
var signoutButton = document.getElementsByClassName('signout')[0];
let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: ''
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        signinButton.style.display = 'block'
    }
}

signinButton.onclick = () => handleAuthClick()
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        signinButton.style.display = 'none'
        signoutButton.style.display = 'block'
        checkFolder()
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

signoutButton.onclick = () => handleSignoutClick()
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        signinButton.style.display = 'block'
        signoutButton.style.display = 'none'
    }
}

function toggleElements() {
  const notepadOrFile = document.getElementById("notepadOrFile");
  const notepadText = document.getElementById("notepadText");
  const fileInput = document.getElementById("fileInput");
  const saveButton = document.getElementById("saveButton");
  const backupButton = document.getElementById("backupButton");

  if (notepadOrFile.value === "notepad") {
    notepadText.style.display = "block";
    fileInput.style.display = "none";
    saveButton.style.display = "block";
    backupButton.style.display = "none";
  } else {
    notepadText.style.display = "none";
    fileInput.style.display = "block";
    saveButton.style.display = "none";
    backupButton.style.display = "block";
  }
}
// Call toggleElements on page load
  toggleElements();
  
  // Add event listener to the select element
  const notepadOrFile = document.getElementById("notepadOrFile");
  notepadOrFile.addEventListener("change", toggleElements);
  

// check for a Backup Folder in google drive
function checkFolder() {
    gapi.client.drive.files.list({
        'q': 'name = "Backup Folder"',
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                localStorage.setItem('parent_folder', file.id);
                console.log('Folder Available');
                // get files if folder available
                showList();
            }
        } else {
            // if folder not available then create
            createFolder();
        }
    })
}
async function uploadFile() {
  // Get the file input element from the HTML
  const fileInput = document.getElementById('fileInput');
  
  // Get the selected file from the input element
  const file = fileInput.files[0];
  
  if (file) {
    try {
      // Get the OAuth token for the user
      const authToken = gapi.auth.getToken().access_token;
      
      // Create a new file metadata object
      const metadata = {
        name: file.name
      };
      
      // Create a new multipart form data object
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);
      
      // Create a new XMLHttpRequest object
      const xhr = new XMLHttpRequest();
      
      // Set the URL and method for the request
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      
      // Set the Authorization header using the OAuth token
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      
      // Set the upload progress event handler
      xhr.upload.onprogress = (event) => {
        const progressBar = document.getElementById('progressBar');
        progressBar.max = event.total;
        progressBar.value = event.loaded;
      };
      
      // Send the request with the form data
      xhr.send(formData);
      
      // Wait for the response from the server
      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr);
        xhr.onerror = () => reject(xhr);
      });
      
      // Get the response from the server as JSON
      const data = JSON.parse(response.responseText);
      
      // Log the file ID to the console
      console.log(`File ID: ${data.id}`);
      
      // Optionally, display a success message to the user
      alert('File uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('There was an error uploading your file. ');
    }
  } else {
    alert('Please select a file to upload.');
  }
  
  // Clear the file input element
  fileInput.value = '';
  
  // Update the file list
  showList();
}

function upload() {
  var fileName = prompt("Enter file name:");
  if (fileName !== null && fileName.trim() !== "") {
    var text = document.querySelector('textarea');
    if (text.value !== "") {
      const blob = new Blob([text.value], { type: 'plain/text' });
      const parentFolder = localStorage.getItem('parent_folder');

      var metadata = {
        name: fileName + '.txt', // Use the provided file name
        mimeType: 'plain/text',
        parents: [parentFolder]
      };

      var formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append("file", blob);

      var progressBar = document.createElement('progress');
      progressBar.max = 100;
      progressBar.value = 0;
      document.body.appendChild(progressBar);

      fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: 'POST',
        headers: { "Authorization": "Bearer " + gapi.auth.getToken().access_token },
        body: formData
      })
        .then(function (response) {
          if (response.ok) {
            alert("File uploaded successfully!");
          } else {
            throw new Error('File upload failed');
          }
          return response.json();
        })
        .then(function (value) {
          console.log(value);
          showList();
          document.body.removeChild(progressBar);
        })
        .catch(function (error) {
          alert(error.message);
        });

      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', function (event) {
        if (event.lengthComputable) {
          var percentComplete = event.loaded / event.total * 100;
          progressBar.value = percentComplete;
        }
      }, false);
    }
  }
}


function createFolder() {
    var access_token = gapi.auth.getToken().access_token;
    var request = gapi.client.request({
        'path': 'drive/v/files',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token,
        },
        'body': {
            'title': 'Backup Folder',
            'mimeType': 'application/vnd.google-apps.folder'
        }
    });
    request.execute(function (response) {
        localStorage.setItem('parent_folder', response.id);
    })
}

var expandContainer = document.querySelector('.expand-container');
var expandContainerUl = document.querySelector('.expand-container ul');
var listcontainer = document.querySelector('.list ul');
// create a function to show hide options
function expand(v) {
    var click_position = v.getBoundingClientRect();
    if (expandContainer.style.display == 'block') {
        expandContainer.style.display = 'none';
        expandContainerUl.setAttribute('data-id', '');
        expandContainerUl.setAttribute('data-name', '');
    } else {
        expandContainer.style.display = 'block';
        expandContainer.style.left = (click_position.left + window.scrollX) - 120 + 'px';
        expandContainer.style.top = (click_position.top + window.scrollY) + 25 + 'px';
        // get data name & id and store it to the options
        expandContainerUl.setAttribute('data-id', v.parentElement.getAttribute('data-id'));
        expandContainerUl.setAttribute('data-name', v.parentElement.getAttribute('data-name'));
    }
}

const searchIcon = document.querySelector('.fas fa-search');

// Add a click event listener to the search icon
searchIcon.addEventListener('click', searchFiles);
async function showList() {
  let response;
  try {
    response = await gapi.client.drive.files.list({
      'pageSize': 50,
      'fields': 'files(id, name, size, modifiedTime, viewedByMeTime, modifiedByMeTime)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    const sortOption = document.getElementById('sort-select').value;
    let sortedFiles = files;
    switch (sortOption) {
      case 'name-asc':
        sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedFiles = files.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'size-asc':
        sortedFiles = files.sort((a, b) => a.size - b.size);
        break;
      case 'size-desc':
        sortedFiles = files.sort((a, b) => b.size - a.size);
        break;
      case 'modified-asc':
        sortedFiles = files.sort((a, b) => new Date(a.modifiedTime) - new Date(b.modifiedTime));
        break;
      case 'modified-desc':
        sortedFiles = files.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
        break;
      case 'opened-asc':
        sortedFiles = files.sort((a, b) => new Date(a.viewedByMeTime) - new Date(b.viewedByMeTime));
        break;
      case 'opened-desc':
        sortedFiles = files.sort((a, b) => new Date(b.viewedByMeTime) - new Date(a.viewedByMeTime));
        break;
      case 'modified-by-me-asc':
        sortedFiles = files.sort((a, b) => new Date(a.modifiedByMeTime) - new Date(b.modifiedByMeTime));
        break;
      case 'modified-by-me-desc':
        sortedFiles = files.sort((a, b) => new Date(b.modifiedByMeTime) - new Date(a.modifiedByMeTime));
        break;
        case 'photos':
  sortedFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.name));
  break;
case 'audio':
  sortedFiles = files.filter(file => /\.(mp3|wav|wma)$/i.test(file.name));
  break;
case 'video':
  sortedFiles = files.filter(file => /\.(mp4|avi|mov|wmv)$/i.test(file.name));
  break;
case 'documents':
  sortedFiles = files.filter(file => /\.(docx|pdf|pptx|txt)$/i.test(file.name));
  break;
      default:
        break;
    }
    listcontainer.innerHTML = '';
    for (var i = 0; i < sortedFiles.length; i++) {
      listcontainer.innerHTML += `
        
        <li data-id="${sortedFiles[i].id}" data-name="${sortedFiles[i].name}" data-size="${sortedFiles[i].size}">
        <span>${sortedFiles[i].name}</span>
        <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>`;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
  }
}

// Define the searchFiles function
async function searchFiles() {
  const searchQuery = document.getElementById('search-item').value;

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'q': `name contains '${searchQuery}'`,
      'pageSize': 50,
      'fields': 'files(id, name, size)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    listcontainer.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      listcontainer.innerHTML += `
        <li data-id="${files[i].id}" data-name="${files[i].name}" data-size="${files[i].size}">
          <span>${files[i].name}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Match of Files Requested</div>'
  }
}
function readEditDownload(v, condition) {
  var id = v.parentElement.getAttribute('data-id');
  var name = v.parentElement.getAttribute('data-name');
  v.innerHTML = '...';
  gapi.client.drive.files.get({
      fileId: id,
      alt: 'media'
  }).then(function (res) {
      expandContainer.style.display = 'none';
      expandContainerUl.setAttribute('data-id', '');
      expandContainerUl.setAttribute('data-name', '');
      if (condition == 'read') {
          v.innerHTML = 'Read';
          document.querySelector('textarea').value = res.body;
          document.documentElement.scrollTop = 0;
          console.log('Read Now')
      } else if (condition == 'edit') {
          v.innerHTML = 'Edit';
          document.querySelector('textarea').value = res.body;
          document.documentElement.scrollTop = 0;
          var updateBtn = document.getElementsByClassName('upload')[0];
          updateBtn.innerHTML = 'Update';
          // we will make the update function later
          updateBtn.setAttribute('onClick', 'update()');
          document.querySelector('textarea').setAttribute('data-update-id', id);
          console.log('File ready for update');
      } else {
          v.innerHTML = 'Download';
          var blob = new Blob([res.body], { type: 'plain/text' });
          var a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          a.download = name;
          a.click();
      }
  })
}
function readFilesInFolder(folderId) {
  gapi.client.drive.files.list({
    q: "'" + folderId + "' in parents",
    fields: "nextPageToken, files(id, name, mimeType, thumbnailLink)",
    pageSize: 10
  }).then(function (response) {
    var files = response.result.files;
    var tv = document.getElementById('tv');
    tv.innerHTML = '';
    var container = document.getElementById('container');
    container.innerHTML = '';
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var li = document.createElement('li');
        li.setAttribute('data-id', file.id);
        li.setAttribute('data-name', file.name);
        var thumbnail = document.createElement('img');
        thumbnail.src = file.thumbnailLink;
        li.appendChild(thumbnail);
        var span = document.createElement('span');
        span.innerHTML = file.name;
        li.appendChild(span);
        var readButton = document.createElement('button');
        readButton.innerHTML = 'Read';
        readButton.setAttribute('onClick', 'readEditDownload(this, "read")');
        li.appendChild(readButton);
        var editButton = document.createElement('button');
        editButton.innerHTML = 'Edit';
        editButton.setAttribute('onClick', 'readEditDownload(this, "edit")');
        li.appendChild(editButton);
        var downloadButton = document.createElement('button');
        downloadButton.innerHTML = 'Download';
        downloadButton.setAttribute('onClick', 'readEditDownload(this, "download")');
        li.appendChild(downloadButton);
        if (file.mimeType == 'application/vnd.google-apps.document' || file.mimeType == 'application/vnd.google-apps.spreadsheet' || file.mimeType == 'application/vnd.google-apps.presentation') {
          container.appendChild(li);
        } else {
          tv.appendChild(li);
        }
      }
    } else {
      tv.innerHTML = 'No files found.';
    }
  });
}


// new create update function
function update() {
    var updateId = document.querySelector('textarea').getAttribute('data-update-id');
    var url = 'https://www.googleapis.com/upload/drive/v3/files/' + updateId + '?uploadType=media';
    fetch(url, {
        method: 'PATCH',
        headers: new Headers({
            Authorization: 'Bearer ' + gapi.auth.getToken().access_token,
            'Content-type': 'plain/text'
        }),
        body: document.querySelector('textarea').value
    }).then(value => {
        console.log('File updated successfully');
        document.querySelector('textarea').setAttribute('data-update-id', '');
        var updateBtn = document.getElementsByClassName('upload')[0];
        updateBtn.innerHTML = 'Backup';
        updateBtn.setAttribute('onClick', 'uploaded()');
    }).catch(err => console.error(err))
}


function deleteFile(v) {
    var id = v.parentElement.getAttribute('data-id');
    v.innerHTML = '...';
    var request = gapi.client.request({
        'path': 'drive/v3/files/' + id,
        'method': 'DELETE'
    });
    request.execute(function (res) {
        console.log('File Deleted');
        v.innerHTML = 'Delete';
        expandContainer.style.display = 'none';
        expandContainerUl.setAttribute('data-id', '');
        expandContainerUl.setAttribute('data-name', '');
        // after delete update the list
        showList();
    })
}
// Function to get the most recently opened files
async function getRecentFiles() {
  let response;
  try {
    response = await gapi.client.drive.files.list({
      'orderBy': 'viewedByMeTime desc',
      'pageSize': 10,
      'fields': 'files(id, name, size, modifiedTime, viewedByMeTime, modifiedByMeTime)',
    });
  } catch (err) {
    console.error(err.message);
    return [];
  }
  return response.result.files;
}

// Function to show the list of files in the pop-up
async function getRecent() {
  let response;
  try {
    response = await gapi.client.drive.files.list({
      'orderBy': 'viewedByMeTime desc',
      'pageSize': 10,
      'fields': 'files(id, name)',
    });
  } catch (err) {
    console.error(err);
    return;
  }

  const files = response.result.files;
  popup(files);
  console.log(files)
}


document.getElementById('btnpdf').onclick = searchPdfFiles;
document.getElementById('btntxt').onclick = searchTxtFiles;
document.getElementById('btnword').onclick = searchWordFiles;
document.getElementById('btnmp3').onclick = searchMp3Files;
document.getElementById('btnmp4').onclick = searchMp4Files;
async function searchPdfFiles() {
  const searchQuery = document.getElementById('search-item').value;

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'q': `name contains '${searchQuery}' and mimeType='application/pdf'`,
      'pageSize': 50,
      'fields': 'files(id, name, size)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    listcontainer.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      listcontainer.innerHTML += `
        <li data-id="${files[i].id}" data-name="${files[i].name}" data-size="${files[i].size}">
          <span>${files[i].name}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
  }
}

async function searchTxtFiles() {
  const searchQuery = document.getElementById('search-item').value;

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'q': `name contains '${searchQuery}' and mimeType='application/txt'`,
      'pageSize': 50,
      'fields': 'files(id, name, size)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    listcontainer.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      listcontainer.innerHTML += `
        <li data-id="${files[i].id}" data-name="${files[i].name}" data-size="${files[i].size}">
          <span>${files[i].name}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
  }
}

async function searchWordFiles() {
  const searchQuery = document.getElementById('search-item').value;

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'q': `name contains '${searchQuery}' and mimeType='application/docx'`,
      'pageSize': 50,
      'fields': 'files(id, name, size)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    listcontainer.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      listcontainer.innerHTML += `
        <li data-id="${files[i].id}" data-name="${files[i].name}" data-size="${files[i].size}">
          <span>${files[i].name}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
  }
}

async function searchMp3Files() {
  const searchQuery = document.getElementById('search-item').value;

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'q': `name contains '${searchQuery}' and mimeType='application/mp3'`,
      'pageSize': 50,
      'fields': 'files(id, name, size)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    listcontainer.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      listcontainer.innerHTML += `
        <li data-id="${files[i].id}" data-name="${files[i].name}" data-size="${files[i].size}">
          <span>${files[i].name}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
  }
}

async function searchMp4Files() {
  const searchQuery = document.getElementById('search-item').value;

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'q': `name contains '${searchQuery}' and mimeType='application/mp4'`,
      'pageSize': 50,
      'fields': 'files(id, name, size)',
    });
  } catch (err) {
    document.getElementById('content').innerHTML = err.message;
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    listcontainer.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      listcontainer.innerHTML += `
        <li data-id="${files[i].id}" data-name="${files[i].name}" data-size="${files[i].size}">
          <span>${files[i].name}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
  } else {
    listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
  }
}
document.getElementById('btn-suggestion').addEventListener('click', suggestion);
async function suggestion() {
  const container = document.getElementById('tv');
  container.innerHTML = '<ul><div style="text-align: center;">Loading suggested files...</div></ul>';
  let response;
  try {
    response = await gapi.client.drive.files.list({
      'orderBy': 'modifiedTime desc',
      'pageSize': 6,
      'fields': 'files(id, name, size, modifiedTime)',
    });
  } catch (err) {
    container.innerHTML = '<ul><div style="text-align: center;">Failed to load suggested files</div></ul>';
    return;
  }
  const files = response.result.files;
  if (files && files.length > 0) {
    // Render the search results
    container.innerHTML = '<ul>';
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      container.innerHTML += `
        <li data-id="${file.id}" data-name="${file.name}" data-size="${file.size}">
          <span>${file.name}</span>
          <span>${new Date(file.modifiedTime).toLocaleString()}</span>
          <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
        </li>
      `;
    }
    container.innerHTML += '</ul>';
  } else {
    container.innerHTML = '<ul><div style="text-align: center;">No suggested files</div></ul>';
  }
}
async function grapher() {
  try {
    const query = "trashed=false";
    const response = await gapi.client.drive.files.list({
      q: query,
      fields: "files(name)",
      orderBy: "createdTime desc",
      pageSize: 6,
      spaces: "drive"
    });
    const files = response.result.files;
    const names = files.map(file => file.name);
    const data = { most: names };
    const jsonData = JSON.stringify(data);
    
    // Create a Blob object for the JSON data
    const blob = new Blob([jsonData], { type: "application/json" });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and set its attributes
    const link = document.createElement("a");
    link.href = url;
    link.download = "../json/most1.json"; // Set the file path and name
    
    // Simulate a click event to initiate the download
    link.click();
    
    // Clean up resources
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error retrieving files:", error);
  }
}
